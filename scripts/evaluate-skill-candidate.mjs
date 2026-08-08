import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: node scripts/evaluate-skill-candidate.mjs <evaluation.json>');
  process.exit(2);
}
const root = process.cwd();
const policy = JSON.parse(fs.readFileSync(path.join(root, '.claude/skill-evolution/policy.json'), 'utf8'));
const evaluation = JSON.parse(fs.readFileSync(path.resolve(inputPath), 'utf8'));
const fail = (message) => { console.error(message); process.exit(2); };
for (const key of ['evaluationId', 'candidateId', 'evaluatedBy', 'candidateAuthor', 'suiteId']) {
  if (!String(evaluation[key] ?? '').trim()) fail(`Missing ${key}`);
}
if (evaluation.evaluatedBy !== policy.roles.evaluator) fail('Evaluator role mismatch');
if (evaluation.evaluatedBy === evaluation.candidateAuthor) fail('Candidate author may not evaluate the candidate');
for (const setName of ['diagnosticCaseIds', 'validationCaseIds', 'holdoutCaseIds']) {
  if (!Array.isArray(evaluation[setName])) fail(`${setName} must be an array`);
}
const diagnostic = new Set(evaluation.diagnosticCaseIds);
const validation = new Set(evaluation.validationCaseIds);
const holdout = new Set(evaluation.holdoutCaseIds);
for (const id of diagnostic) if (validation.has(id) || holdout.has(id)) fail(`Case ${id} appears in multiple sets`);
for (const id of validation) if (holdout.has(id)) fail(`Case ${id} appears in multiple sets`);
if (validation.size < policy.benchmark.minimumValidationCases) fail('Not enough validation cases');
if (holdout.size < policy.benchmark.minimumHoldoutCases) fail('Not enough holdout cases');
if (!Array.isArray(evaluation.results) || evaluation.results.length === 0) fail('results are required');
const known = new Set([...diagnostic, ...validation, ...holdout]);
for (const result of evaluation.results) {
  if (!known.has(result.caseId)) fail(`Result for unknown case ${result.caseId}`);
  if (!['diagnostic', 'validation', 'holdout'].includes(result.set)) fail(`Invalid set for ${result.caseId}`);
  for (const key of ['baselineScore', 'candidateScore']) {
    if (!(Number.isFinite(result[key]) && result[key] >= 0 && result[key] <= 100)) fail(`Invalid ${key} for ${result.caseId}`);
  }
}
const bySet = (name) => evaluation.results.filter((result) => result.set === name);
const avg = (items, key) => items.length ? items.reduce((sum, item) => sum + item[key], 0) / items.length : Number.NaN;
const validationResults = bySet('validation');
const holdoutResults = bySet('holdout');
if (new Set(validationResults.map((x) => x.caseId)).size < validation.size) fail('Every validation case must have a result');
if (new Set(holdoutResults.map((x) => x.caseId)).size < holdout.size) fail('Every holdout case must have a result');
const validationDelta = avg(validationResults, 'candidateScore') - avg(validationResults, 'baselineScore');
const holdoutDelta = avg(holdoutResults, 'candidateScore') - avg(holdoutResults, 'baselineScore');
const criticalRegression = evaluation.results.some((result) => result.critical === true && result.baselineCriticalPass !== false && result.candidateCriticalPass === false);
const categories = new Map();
for (const result of evaluation.results.filter((x) => x.set === 'validation' || x.set === 'holdout')) {
  const category = result.category || 'uncategorized';
  const entry = categories.get(category) || { baseline: [], candidate: [] };
  entry.baseline.push(result.baselineScore);
  entry.candidate.push(result.candidateScore);
  categories.set(category, entry);
}
const simpleAvg = (numbers) => numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
const categoryDeltas = {};
let worstCategoryRegression = 0;
for (const [category, values] of categories) {
  const delta = simpleAvg(values.candidate) - simpleAvg(values.baseline);
  categoryDeltas[category] = Number(delta.toFixed(2));
  if (delta < worstCategoryRegression) worstCategoryRegression = delta;
}
let recommendation = 'REVISE';
if (criticalRegression) recommendation = 'REJECT';
else if (
  validationDelta >= policy.benchmark.minimumValidationDeltaPoints &&
  holdoutDelta >= policy.benchmark.minimumHoldoutDeltaPoints &&
  worstCategoryRegression >= -policy.benchmark.maximumProtectedCategoryRegressionPoints
) recommendation = 'ADVANCE_TO_PILOT';
else if (validationDelta <= 0 && holdoutDelta <= 0) recommendation = 'NO_PROVEN_GAIN';
const summary = {
  schemaVersion: 1,
  evaluationId: evaluation.evaluationId,
  candidateId: evaluation.candidateId,
  suiteId: evaluation.suiteId,
  evaluatedBy: evaluation.evaluatedBy,
  candidateAuthor: evaluation.candidateAuthor,
  validation: {
    baseline: Number(avg(validationResults, 'baselineScore').toFixed(2)),
    candidate: Number(avg(validationResults, 'candidateScore').toFixed(2)),
    delta: Number(validationDelta.toFixed(2))
  },
  holdout: {
    baseline: Number(avg(holdoutResults, 'baselineScore').toFixed(2)),
    candidate: Number(avg(holdoutResults, 'candidateScore').toFixed(2)),
    delta: Number(holdoutDelta.toFixed(2))
  },
  categoryDeltas,
  criticalRegression,
  worstCategoryRegression: Number(worstCategoryRegression.toFixed(2)),
  recommendation
};
const output = path.join(path.dirname(path.resolve(inputPath)), `${path.basename(inputPath, path.extname(inputPath))}.scored.json`);
fs.writeFileSync(output, JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
console.error(`Scored result written to ${output}`);
if (recommendation === 'REJECT') process.exitCode = 3;
