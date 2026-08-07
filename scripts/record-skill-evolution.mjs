import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const mode = process.argv[2];
const file = process.argv[3];
if (!mode || !file) {
  console.error('Usage: node scripts/record-skill-evolution.mjs <research|candidate|evaluation|pilot|feedback|promotion> <json-file>');
  process.exit(2);
}
const base = path.join(root, '.claude/skill-evolution');
const policy = JSON.parse(fs.readFileSync(path.join(base, 'policy.json'), 'utf8'));
const input = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
const candidatesPath = path.join(base, 'candidates.json');
const frontierPath = path.join(base, 'frontier.json');
const scorecardsPath = path.join(base, 'skill-scorecards.json');
const candidates = JSON.parse(fs.readFileSync(candidatesPath, 'utf8'));
const append = (name, obj) => fs.appendFileSync(path.join(base, name), JSON.stringify({ ...obj, recordedAt: new Date().toISOString() }) + '\n');
const readLines = (name) => fs.existsSync(path.join(base, name)) ? fs.readFileSync(path.join(base, name), 'utf8').split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line)) : [];
const fail = (message) => { console.error(message); process.exit(2); };
const nonempty = (value) => typeof value === 'string' && value.trim().length > 0;
const saveCandidates = () => fs.writeFileSync(candidatesPath, JSON.stringify(candidates, null, 2) + '\n');
const findCandidate = (id) => candidates.candidates.find((item) => item.candidateId === id);

if (mode === 'research') {
  for (const key of ['researchId', 'researchedBy', 'targetAgent', 'failurePattern', 'recommendedAction', 'validationPlan', 'rollback']) if (!nonempty(input[key])) fail(`Missing ${key}`);
  if (input.researchedBy !== policy.roles.researcher) fail('Skill research must be authored by the configured researcher');
  if (!Array.isArray(input.existingSkillsInspected) || input.existingSkillsInspected.length === 0) fail('Existing skill inventory is required');
  if (!Array.isArray(input.options) || input.options.length < policy.research.minimumOptions) fail('Insufficient research alternatives');
  append('events.jsonl', { type: 'research', ...input });
} else if (mode === 'candidate') {
  for (const key of ['candidateId', 'researchId', 'targetType', 'targetName', 'action', 'authoredBy', 'status', 'rollback']) if (!nonempty(input[key])) fail(`Missing ${key}`);
  if (input.authoredBy !== policy.roles.candidateAuthor) fail('Candidate must be authored by the configured candidate author');
  if (input.status !== 'CANDIDATE') fail('New candidate status must be CANDIDATE');
  if (findCandidate(input.candidateId)) fail('Duplicate candidateId');
  candidates.candidates.push({ ...input, createdAt: new Date().toISOString() });
  saveCandidates();
  append('events.jsonl', { type: 'candidate', ...input });
} else if (mode === 'evaluation') {
  for (const key of ['evaluationId', 'candidateId', 'evaluatedBy', 'candidateAuthor', 'recommendation']) if (!nonempty(input[key])) fail(`Missing ${key}`);
  if (input.evaluatedBy !== policy.roles.evaluator) fail('Evaluation must be authored by the configured evaluator');
  if (input.candidateAuthor === input.evaluatedBy) fail('Candidate author may not evaluate the same candidate');
  const candidate = findCandidate(input.candidateId);
  if (!candidate) fail('Unknown candidateId');
  if (candidate.authoredBy !== input.candidateAuthor) fail('Evaluation candidateAuthor does not match candidate record');
  const recommendations = new Set(['ADVANCE_TO_PILOT', 'REVISE', 'NO_PROVEN_GAIN', 'REJECT']);
  if (!recommendations.has(input.recommendation)) fail('Invalid evaluation recommendation');
  append('evaluations.jsonl', input);
  append('events.jsonl', { type: 'evaluation', ...input });
  if (input.recommendation === 'ADVANCE_TO_PILOT') candidate.status = 'PILOT';
  else if (input.recommendation === 'REJECT') candidate.status = 'REJECTED';
  else candidate.status = 'BENCHMARKING';
  candidate.updatedAt = new Date().toISOString();
  saveCandidates();
  if (input.recommendation === 'ADVANCE_TO_PILOT' && input.validation && input.holdout) {
    const frontier = JSON.parse(fs.readFileSync(frontierPath, 'utf8'));
    const key = candidate.targetName;
    const list = frontier.capabilities[key] ?? [];
    const score = Number((((input.validation.candidate ?? 0) + (input.holdout.candidate ?? 0)) / 2).toFixed(2));
    const filtered = list.filter((item) => item.candidateId !== candidate.candidateId);
    filtered.push({ candidateId: candidate.candidateId, score, evaluationId: input.evaluationId, updatedAt: new Date().toISOString() });
    filtered.sort((a, b) => b.score - a.score);
    frontier.capabilities[key] = filtered.slice(0, 3);
    fs.writeFileSync(frontierPath, JSON.stringify(frontier, null, 2) + '\n');
  }
} else if (mode === 'pilot') {
  for (const key of ['pilotId', 'candidateId', 'outcome', 'reviewedBy']) if (!nonempty(input[key])) fail(`Missing ${key}`);
  const candidate = findCandidate(input.candidateId);
  if (!candidate) fail('Unknown candidateId');
  if (candidate.status !== 'PILOT') fail('Candidate is not eligible for pilot recording');
  if (input.reviewedBy !== policy.roles.systemReviewer) fail('Pilot must be independently reviewed by the configured system reviewer');
  if (!Array.isArray(input.taskIds) || new Set(input.taskIds).size < policy.pilot.minimumRelevantRealTasks) fail('Pilot does not include enough distinct relevant real tasks');
  if (!Array.isArray(input.evidence) || input.evidence.length === 0) fail('Pilot evidence is required');
  if (!['KEEP', 'REVISE', 'REJECT'].includes(input.outcome)) fail('Invalid pilot outcome');
  append('pilots.jsonl', input);
  append('events.jsonl', { type: 'pilot', ...input });
  if (input.outcome === 'REJECT') candidate.status = 'REJECTED';
  candidate.updatedAt = new Date().toISOString();
  saveCandidates();
} else if (mode === 'feedback') {
  for (const key of ['feedbackId', 'candidateId', 'outcome', 'reason']) if (!nonempty(input[key])) fail(`Missing ${key}`);
  append('feedback-history.jsonl', input);
  append('events.jsonl', { type: 'feedback', ...input });
} else if (mode === 'promotion') {
  for (const key of ['candidateId', 'outcome', 'approvedBy']) if (!nonempty(input[key])) fail(`Missing ${key}`);
  const candidate = findCandidate(input.candidateId);
  if (!candidate) fail('Unknown candidateId');
  if (input.outcome === 'PROVEN') {
    if (input.approvedBy !== policy.roles.owner) fail('Permanent PROVEN promotion requires project-owner approval');
    const evaluations = readLines('evaluations.jsonl').filter((item) => item.candidateId === input.candidateId);
    if (!evaluations.some((item) => item.recommendation === 'ADVANCE_TO_PILOT')) fail('PROVEN promotion requires an independent ADVANCE_TO_PILOT evaluation');
    const pilots = readLines('pilots.jsonl').filter((item) => item.candidateId === input.candidateId);
    if (!pilots.some((item) => item.outcome === 'KEEP' && new Set(item.taskIds ?? []).size >= policy.pilot.minimumRelevantRealTasks)) fail('PROVEN promotion requires a successful minimum-length real-task pilot');
  }
  if (!['PROVEN', 'REJECTED', 'DEPRECATED', 'REPLACED'].includes(input.outcome)) fail('Invalid promotion outcome');
  candidate.status = input.outcome;
  candidate.updatedAt = new Date().toISOString();
  candidate.approvedBy = input.approvedBy;
  saveCandidates();
  if (input.outcome === 'PROVEN') {
    const scorecards = JSON.parse(fs.readFileSync(scorecardsPath, 'utf8'));
    const evaluations = readLines('evaluations.jsonl').filter((item) => item.candidateId === input.candidateId);
    const latest = evaluations.at(-1) ?? {};
    scorecards.skills[candidate.targetName] = {
      status: 'PROVEN', candidateId: candidate.candidateId, provenAt: new Date().toISOString(),
      validation: latest.validation ?? null, holdout: latest.holdout ?? null, categoryDeltas: latest.categoryDeltas ?? null,
      criticalRegression: latest.criticalRegression ?? null, usageCount: 0, realTaskPilotCount: policy.pilot.minimumRelevantRealTasks
    };
    fs.writeFileSync(scorecardsPath, JSON.stringify(scorecards, null, 2) + '\n');
  }
  append('events.jsonl', { type: 'promotion', ...input });
} else {
  fail('Unknown mode');
}
console.log(`Recorded skill-evolution ${mode}`);
