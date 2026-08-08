import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: npm run performance:record -- <evaluation.json>');
  process.exit(1);
}

const resolve = (rel) => path.resolve(root, rel);
const registryPath = resolve('.claude/capability-registry.json');
const policyPath = resolve('.claude/performance/policy.json');
const ledgerPath = resolve('.claude/performance/ledger.jsonl');
const scorecardsPath = resolve('.claude/performance/scorecards.json');
const taskContractPath = resolve('.claude/tasks/contracts.jsonl');
const evaluationPath = resolve(inputPath);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function fail(message) {
  console.error(`Performance record rejected: ${message}`);
  process.exit(1);
}

for (const file of [registryPath, policyPath, ledgerPath, scorecardsPath, taskContractPath, evaluationPath]) {
  if (!fs.existsSync(file)) fail(`file not found: ${path.relative(root, file)}`);
}

const registry = readJson(registryPath);
const policy = readJson(policyPath);
const evaluation = readJson(evaluationPath);
const scorecards = readJson(scorecardsPath);
const taskContractLines = fs.readFileSync(taskContractPath, 'utf8').split(/\r?\n/).filter(Boolean);
const taskContractRecords = taskContractLines.map((line, index) => {
  try { return JSON.parse(line); }
  catch { fail(`task contract ledger line ${index + 1} is invalid JSON`); }
});
const taskCreated = taskContractRecords.find((item) => item.taskId === evaluation.taskId && item.eventType === 'created');
const taskClosed = [...taskContractRecords].reverse().find((item) => item.taskId === evaluation.taskId && item.eventType === 'closed');
if (policy?.evaluationRules?.completionContractRequired === true && !taskCreated) fail(`completion contract is missing for ${evaluation.taskId}`);
if (taskCreated) {
  if (taskCreated.ownerAgent !== evaluation.agent) fail(`evaluation agent does not match completion-contract owner: ${taskCreated.ownerAgent}`);
  if (taskCreated.basePoints !== evaluation.basePoints) fail(`evaluation basePoints do not match completion contract: ${taskCreated.basePoints}`);
}
if (policy?.evaluationRules?.contractMustBeClosedBeforeScoring === true && !taskClosed) fail(`completion contract is not closed for ${evaluation.taskId}`);
if (taskClosed) {
  if (evaluation.status !== taskClosed.status) fail(`evaluation status ${evaluation.status} does not match completion-contract closure ${taskClosed.status}`);
  if (evaluation.status === 'accepted' && taskClosed.status !== 'accepted') fail('accepted performance score requires an accepted completion contract');
}

const agentNames = new Set(registry.agents.map((agent) => agent.name));
const validReviewers = new Set([...agentNames, registry.ownerRole]);
const dimensionNames = Object.keys(policy.qualityWeights);
const statuses = new Set(['accepted', 'partial', 'rejected']);

if (!evaluation.taskId || !/^[A-Za-z0-9._-]+$/.test(evaluation.taskId)) fail('taskId is missing or invalid');
if (!evaluation.taskTitle || typeof evaluation.taskTitle !== 'string') fail('taskTitle is missing');
if (!agentNames.has(evaluation.agent)) fail(`agent is not registered: ${evaluation.agent}`);
if (!validReviewers.has(evaluation.reviewer)) fail(`reviewer is not registered: ${evaluation.reviewer}`);
if (evaluation.agent === evaluation.reviewer) fail('an agent cannot evaluate its own task');
if (evaluation.agent === registry.defaultAgent && evaluation.reviewer !== registry.ownerRole) {
  fail(`${registry.defaultAgent} may only be evaluated by ${registry.ownerRole}`);
}
if (!Number.isInteger(evaluation.basePoints) || evaluation.basePoints < policy.taskPoints.min || evaluation.basePoints > policy.taskPoints.max) {
  fail(`basePoints must be an integer from ${policy.taskPoints.min} to ${policy.taskPoints.max}`);
}
if (!statuses.has(evaluation.status)) fail('status must be accepted, partial, or rejected');
if (!evaluation.dimensions || typeof evaluation.dimensions !== 'object') fail('dimensions are missing');
if (!Array.isArray(evaluation.evidence) || evaluation.evidence.length < policy.evaluationRules.minimumEvidenceItems) {
  fail(`at least ${policy.evaluationRules.minimumEvidenceItems} evidence item is required`);
}
for (const evidence of evaluation.evidence) {
  if (typeof evidence !== 'string' || !evidence.trim()) fail('evidence items must be non-empty strings');
}

let weighted = 0;
let weightTotal = 0;
for (const name of dimensionNames) {
  const score = evaluation.dimensions[name];
  if (typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > 100) {
    fail(`${name} must be a number from 0 to 100`);
  }
  const weight = policy.qualityWeights[name];
  weighted += score * weight;
  weightTotal += weight;
}
if (weightTotal !== 100) fail('policy qualityWeights do not total 100');

const qualityScore = Math.round((weighted / weightTotal) * 100) / 100;
const earnedPoints = evaluation.status === 'rejected'
  ? policy.evaluationRules.rejectedTaskEarnedPoints
  : Math.round((evaluation.basePoints * qualityScore / 100) * 100) / 100;

const rawLines = fs.readFileSync(ledgerPath, 'utf8').split(/\r?\n/).filter(Boolean);
const ledgerRecords = rawLines.map((line, index) => {
  try { return JSON.parse(line); }
  catch { fail(`ledger line ${index + 1} is invalid JSON`); }
});
if (ledgerRecords.some((record) => record.eventType === 'task-evaluation' && record.taskId === evaluation.taskId && record.agent === evaluation.agent)) {
  fail(`duplicate evaluation: ${evaluation.taskId} / ${evaluation.agent}`);
}

const record = {
  eventType: 'task-evaluation',
  schemaVersion: 1,
  recordedAt: new Date().toISOString(),
  taskId: evaluation.taskId,
  taskTitle: evaluation.taskTitle,
  agent: evaluation.agent,
  reviewer: evaluation.reviewer,
  basePoints: evaluation.basePoints,
  status: evaluation.status,
  dimensions: Object.fromEntries(dimensionNames.map((name) => [name, evaluation.dimensions[name]])),
  qualityScore,
  earnedPoints,
  evidence: evaluation.evidence,
  strengths: Array.isArray(evaluation.strengths) ? evaluation.strengths : [],
  improvementAreas: Array.isArray(evaluation.improvementAreas) ? evaluation.improvementAreas : [],
  notes: typeof evaluation.notes === 'string' ? evaluation.notes : ''
};

fs.appendFileSync(ledgerPath, `${JSON.stringify(record)}\n`);

const allTaskRecords = [...ledgerRecords, record].filter((item) => item.eventType === 'task-evaluation');
const agentRecords = allTaskRecords.filter((item) => item.agent === evaluation.agent);
const rolling = agentRecords.slice(-policy.rollingWindow);
const rollingQuality = rolling.length
  ? Math.round((rolling.reduce((sum, item) => sum + item.qualityScore, 0) / rolling.length) * 100) / 100
  : null;
const averageQuality = agentRecords.length
  ? Math.round((agentRecords.reduce((sum, item) => sum + item.qualityScore, 0) / agentRecords.length) * 100) / 100
  : null;

function determineLevel(tasks, rollingScore) {
  if (tasks < 3 || rollingScore === null) return 'unrated';
  if (tasks >= 10 && rollingScore >= 93) return 'trusted';
  if (rollingScore >= 85) return 'strong';
  if (rollingScore >= 70) return 'reliable';
  return 'developing';
}

const card = scorecards.agents[evaluation.agent] ?? {};
card.tasksEvaluated = agentRecords.length;
card.totalBasePoints = Math.round(agentRecords.reduce((sum, item) => sum + item.basePoints, 0) * 100) / 100;
card.totalEarnedPoints = Math.round(agentRecords.reduce((sum, item) => sum + item.earnedPoints, 0) * 100) / 100;
card.averageQuality = averageQuality;
card.rollingQuality = rollingQuality;
card.rollingTaskIds = rolling.map((item) => item.taskId);
card.level = determineLevel(agentRecords.length, rollingQuality);
card.lastEvaluationAt = record.recordedAt;
card.recentStrengths = record.strengths;
card.recentImprovementAreas = record.improvementAreas;
scorecards.agents[evaluation.agent] = card;
scorecards.updatedAt = record.recordedAt;

fs.writeFileSync(scorecardsPath, `${JSON.stringify(scorecards, null, 2)}\n`);
console.log(`Recorded ${evaluation.taskId} for ${evaluation.agent}: quality ${qualityScore}%, earned ${earnedPoints}/${evaluation.basePoints}, level ${card.level}.`);
