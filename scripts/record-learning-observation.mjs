import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const inputPath = process.argv[2];

function fail(message) {
  console.error(`Learning observation rejected: ${message}`);
  process.exit(1);
}

if (!inputPath) {
  fail('Usage: npm run learning:record -- <observation.json>');
}

const resolve = (relativePath) => path.resolve(root, relativePath);
const registryPath = resolve('.claude/capability-registry.json');
const policyPath = resolve('.claude/learning/policy.json');
const ledgerPath = resolve('.claude/learning/observations.jsonl');
const observationPath = resolve(inputPath);

for (const file of [registryPath, policyPath, ledgerPath, observationPath]) {
  if (!fs.existsSync(file)) {
    fail(`file not found: ${path.relative(root, file)}`);
  }
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    fail(`invalid JSON in ${path.relative(root, file)}: ${error.message}`);
  }
}

const registry = readJson(registryPath);
const policy = readJson(policyPath);
const observation = readJson(observationPath);
const agentNames = new Set(registry.agents.map((agent) => agent.name));
const categories = new Set(policy.observationCategories);
const evidenceTypes = new Set(policy.evidenceTypes);

if (!observation.observationId || !/^[A-Za-z0-9._-]+$/.test(observation.observationId)) {
  fail('observationId is missing or invalid');
}
if (!observation.taskId || !/^[A-Za-z0-9._-]+$/.test(observation.taskId)) {
  fail('taskId is missing or invalid');
}
if (!agentNames.has(observation.recordedBy) && observation.recordedBy !== registry.ownerRole) {
  fail(`recordedBy is not a registered agent or owner role: ${observation.recordedBy}`);
}
if (observation.agent && !agentNames.has(observation.agent)) {
  fail(`agent is not registered: ${observation.agent}`);
}
if (!categories.has(observation.category)) {
  fail(`unsupported category: ${observation.category}`);
}
if (typeof observation.capability !== 'string' || !observation.capability.trim()) {
  fail('capability is required');
}
if (typeof observation.summary !== 'string' || observation.summary.trim().length < 12) {
  fail('summary must contain at least 12 characters');
}
if (typeof observation.impact !== 'string' || observation.impact.trim().length < 8) {
  fail('impact must contain at least 8 characters');
}
if (observation.sensitiveDataIncluded !== false) {
  fail('sensitiveDataIncluded must be explicitly false');
}
if (!Array.isArray(observation.evidence) || observation.evidence.length < policy.minimumEvidenceItems) {
  fail(`at least ${policy.minimumEvidenceItems} evidence item is required`);
}
for (const [index, evidence] of observation.evidence.entries()) {
  if (!evidence || typeof evidence !== 'object') {
    fail(`evidence item ${index + 1} must be an object`);
  }
  if (!evidenceTypes.has(evidence.type)) {
    fail(`unsupported evidence type at item ${index + 1}: ${evidence.type}`);
  }
  if (typeof evidence.reference !== 'string' || !evidence.reference.trim()) {
    fail(`evidence item ${index + 1} requires a non-empty reference`);
  }
}

const records = fs.readFileSync(ledgerPath, 'utf8')
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line, index) => {
    try {
      return JSON.parse(line);
    } catch (error) {
      fail(`learning ledger line ${index + 1} is invalid JSON: ${error.message}`);
    }
  });

if (records.some((record) => record.observationId === observation.observationId)) {
  fail(`duplicate observationId: ${observation.observationId}`);
}

const record = {
  eventType: 'learning-observation',
  schemaVersion: 1,
  recordedAt: new Date().toISOString(),
  observationId: observation.observationId,
  taskId: observation.taskId,
  recordedBy: observation.recordedBy,
  agent: observation.agent ?? null,
  category: observation.category,
  capability: observation.capability.trim(),
  summary: observation.summary.trim(),
  evidence: observation.evidence.map((item) => ({
    type: item.type,
    reference: item.reference.trim()
  })),
  impact: observation.impact.trim(),
  suggestedAction: typeof observation.suggestedAction === 'string'
    ? observation.suggestedAction.trim()
    : '',
  sensitiveDataIncluded: false
};

fs.appendFileSync(ledgerPath, `${JSON.stringify(record)}\n`);
console.log(`Recorded learning observation ${record.observationId} for ${record.capability}.`);
