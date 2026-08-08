import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: npm run task:record -- <task-event.json>');
  process.exit(1);
}
const resolve = (value) => path.resolve(root, value);
const policyPath = resolve('.claude/tasks/policy.json');
const ledgerPath = resolve('.claude/tasks/contracts.jsonl');
const progressPath = resolve('.claude/tasks/progress.jsonl');
const registryPath = resolve('.claude/capability-registry.json');
const filePath = resolve(inputPath);
const fail = (message) => { console.error(`Task event rejected: ${message}`); process.exit(1); };
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const readJsonl = (file) => fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).map((line, index) => {
  try { return JSON.parse(line); } catch (error) { fail(`${path.relative(root, file)} line ${index + 1} is invalid JSON: ${error.message}`); }
});
for (const file of [policyPath, ledgerPath, progressPath, registryPath, filePath]) if (!fs.existsSync(file)) fail(`file not found: ${path.relative(root, file)}`);
const policy = readJson(policyPath);
const registry = readJson(registryPath);
const event = readJson(filePath);
const records = readJsonl(ledgerPath);
const progress = readJsonl(progressPath);
const validAgents = new Set(registry.agents.map((item) => item.name));
const validReviewers = new Set([...validAgents, registry.ownerRole]);
const types = new Set(['created', 'evidence', 'amended', 'closed']);
if (!event.eventId || !/^[A-Za-z0-9._-]+$/.test(event.eventId)) fail('eventId is missing or invalid');
if (records.some((item) => item.eventId === event.eventId)) fail(`duplicate eventId: ${event.eventId}`);
if (!event.taskId || !/^[A-Za-z0-9._-]+$/.test(event.taskId)) fail('taskId is missing or invalid');
if (!types.has(event.eventType)) fail('eventType must be created, evidence, amended, or closed');
if (event.sensitiveDataIncluded === true) fail('task ledgers must not contain secrets or personal data');
const taskRecords = records.filter((item) => item.taskId === event.taskId);
const created = taskRecords.find((item) => item.eventType === 'created');

function laneFor(points) {
  for (const [lane, config] of Object.entries(policy.lanes ?? {})) {
    const [min, max] = config.points ?? [];
    if (points >= min && points <= max) return lane;
  }
  return null;
}
function activeRequirements() {
  let requirements = structuredClone(created?.requirements ?? []);
  let reviewerAgent = created?.reviewerAgent;
  let ownerAgent = created?.ownerAgent;
  for (const item of taskRecords.filter((record) => record.eventType === 'amended')) {
    if (Array.isArray(item.replaceRequirements)) requirements = structuredClone(item.replaceRequirements);
    if (item.replaceReviewerAgent) reviewerAgent = item.replaceReviewerAgent;
    if (item.replaceOwnerAgent) ownerAgent = item.replaceOwnerAgent;
  }
  return { requirements, reviewerAgent, ownerAgent };
}
function antiSpinBlocked() {
  const attempts = progress.filter((item) => item.taskId === event.taskId).sort((a,b) => a.iteration - b.iteration);
  const anti = policy.antiSpin ?? {};
  if (attempts.length > (anti.maxMaterialIterations ?? 5)) return 'material iteration budget exceeded';
  const lastNoProgress = attempts.slice(-(anti.consecutiveNoProgressLimit ?? 2));
  if (lastNoProgress.length >= (anti.consecutiveNoProgressLimit ?? 2) && lastNoProgress.every((item) => item.measurableProgress === false)) return 'consecutive no-progress limit reached';
  const byApproach = new Map();
  for (const attempt of attempts) {
    const key = String(attempt.approachKey ?? '').trim().toLowerCase();
    if (!key) continue;
    const list = byApproach.get(key) ?? [];
    list.push(attempt);
    byApproach.set(key, list);
  }
  for (const [key, list] of byApproach) {
    const failures = list.filter((item) => item.measurableProgress === false);
    if (failures.length >= (anti.sameApproachWithoutNewEvidenceLimit ?? 2)) return `repeated approach without progress: ${key}`;
  }
  if (anti.detectFlipFlop && attempts.length >= 3) {
    const last = attempts.slice(-3).map((item) => String(item.approachKey ?? '').trim().toLowerCase());
    if (last[0] && last[1] && last[0] === last[2] && last[0] !== last[1]) return `approach flip-flop detected: ${last.join(' -> ')}`;
  }
  return null;
}

if (event.eventType === 'created') {
  if (created) fail('task already has a created contract');
  if (!event.title || typeof event.title !== 'string') fail('title is required');
  if (!Number.isInteger(event.basePoints) || event.basePoints < policy.basePoints.min || event.basePoints > policy.basePoints.max) fail('basePoints must be an integer from 1 to 10');
  const expectedLane = laneFor(event.basePoints);
  if (event.lane !== expectedLane) fail(`lane must be ${expectedLane} for ${event.basePoints} base points`);
  if (!validAgents.has(event.ownerAgent)) fail(`ownerAgent is not registered: ${event.ownerAgent}`);
  if (!validReviewers.has(event.reviewerAgent)) fail(`reviewerAgent is not registered: ${event.reviewerAgent}`);
  if (event.ownerAgent === event.reviewerAgent) fail('ownerAgent and reviewerAgent must differ');
  if (!Array.isArray(event.requirements) || event.requirements.length < (policy.lanes[event.lane]?.minimumRequirements ?? 1)) fail('requirements are missing or below lane minimum');
  const ids = new Set();
  for (const requirement of event.requirements) {
    if (!requirement.id || !requirement.text || !requirement.evidence) fail('every requirement needs id, text, and evidence');
    if (ids.has(requirement.id)) fail(`duplicate requirement id: ${requirement.id}`);
    ids.add(requirement.id);
  }
  for (const key of ['allowedFiles','forbiddenFiles','approvalGates']) if (!Array.isArray(event[key])) fail(`${key} must be an array`);
} else {
  if (!created) fail('task contract does not exist');
  if (taskRecords.some((item) => item.eventType === 'closed')) fail('task contract is already closed');
  const state = activeRequirements();
  if (event.eventType === 'evidence') {
    const requirement = state.requirements.find((item) => item.id === event.requirementId);
    if (!requirement) fail(`unknown requirementId: ${event.requirementId}`);
    if (!validReviewers.has(event.verifiedBy)) fail(`verifiedBy is not registered: ${event.verifiedBy}`);
    if (event.verifiedBy === state.ownerAgent) fail('task owner cannot independently verify its own requirement');
    if (!Array.isArray(event.evidence) || event.evidence.length === 0 || event.evidence.some((item) => typeof item !== 'string' || !item.trim())) fail('evidence must contain non-empty evidence references');
  }
  if (event.eventType === 'amended') {
    if (event.approvedBy !== registry.ownerRole) fail(`task contract amendments require ${registry.ownerRole} approval`);
    if (!event.reason || typeof event.reason !== 'string') fail('amendment reason is required');
    if (Array.isArray(event.replaceRequirements)) {
      const ids = new Set();
      for (const requirement of event.replaceRequirements) {
        if (!requirement.id || !requirement.text || !requirement.evidence || ids.has(requirement.id)) fail('replacement requirements must have unique id, text, and evidence');
        ids.add(requirement.id);
      }
    }
    if (event.replaceReviewerAgent && !validReviewers.has(event.replaceReviewerAgent)) fail('replacement reviewer is not registered');
    if (event.replaceOwnerAgent && !validAgents.has(event.replaceOwnerAgent)) fail('replacement owner is not registered');
  }
  if (event.eventType === 'closed') {
    if (!new Set(['accepted','partial','rejected']).has(event.status)) fail('closed status must be accepted, partial, or rejected');
    if (!validReviewers.has(event.closedBy)) fail(`closedBy is not registered: ${event.closedBy}`);
    if (event.closedBy === state.ownerAgent) fail('task owner cannot close its own contract');
    const evidenceRecords = taskRecords.filter((item) => item.eventType === 'evidence');
    const evidenced = new Set(evidenceRecords.map((item) => item.requirementId));
    const missing = state.requirements.filter((item) => !evidenced.has(item.id)).map((item) => item.id);
    const spinReason = antiSpinBlocked();
    if (event.status === 'accepted' && missing.length) fail(`accepted task still has unverified requirements: ${missing.join(', ')}`);
    if (event.status === 'accepted' && spinReason) fail(`accepted task is anti-spin blocked: ${spinReason}`);
    if (event.status === 'partial' && (!event.remainingRisk || typeof event.remainingRisk !== 'string')) fail('partial closure requires remainingRisk');
  }
}
const record = {...event, schemaVersion: 1, recordedAt: new Date().toISOString()};
fs.appendFileSync(ledgerPath, `${JSON.stringify(record)}\n`);
console.log(`Recorded task event ${event.eventType}: ${event.taskId} / ${event.eventId}`);
