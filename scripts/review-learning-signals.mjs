import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const resolve = (relativePath) => path.resolve(root, relativePath);
const policyPath = resolve('.claude/learning/policy.json');
const ledgerPath = resolve('.claude/learning/observations.jsonl');
const reviewPath = resolve('.claude/learning/review.json');

function fail(message) {
  console.error(`Learning review failed: ${message}`);
  process.exit(1);
}

for (const file of [policyPath, ledgerPath]) {
  if (!fs.existsSync(file)) fail(`file not found: ${path.relative(root, file)}`);
}

let policy;
try {
  policy = JSON.parse(fs.readFileSync(policyPath, 'utf8'));
} catch (error) {
  fail(`invalid learning policy JSON: ${error.message}`);
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

const groups = new Map();
for (const record of records) {
  if (record.eventType !== 'learning-observation') continue;
  const key = `${record.category}::${record.capability}`;
  const group = groups.get(key) ?? {
    category: record.category,
    capability: record.capability,
    observationIds: [],
    taskIds: new Set(),
    agents: new Set(),
    summaries: [],
    impacts: [],
    suggestedActions: []
  };
  group.observationIds.push(record.observationId);
  group.taskIds.add(record.taskId);
  if (record.agent) group.agents.add(record.agent);
  group.summaries.push(record.summary);
  group.impacts.push(record.impact);
  if (record.suggestedAction) group.suggestedActions.push(record.suggestedAction);
  groups.set(key, group);
}

const signals = [...groups.values()]
  .map((group) => {
    const independentCount = group.taskIds.size;
    const confidence = independentCount >= policy.validationWindowTasks
      ? 'validated-candidate'
      : independentCount >= policy.repetitionThreshold
        ? 'repeated'
        : 'candidate';
    return {
      category: group.category,
      capability: group.capability,
      observationCount: group.observationIds.length,
      independentTaskCount: independentCount,
      confidence,
      observationIds: group.observationIds,
      taskIds: [...group.taskIds],
      agents: [...group.agents],
      summaries: [...new Set(group.summaries)],
      impacts: [...new Set(group.impacts)],
      suggestedActions: [...new Set(group.suggestedActions)],
      requiresProposalReview: independentCount >= policy.repetitionThreshold
    };
  })
  .sort((a, b) => {
    if (b.independentTaskCount !== a.independentTaskCount) return b.independentTaskCount - a.independentTaskCount;
    return a.capability.localeCompare(b.capability);
  });

const review = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  observationCount: records.length,
  repetitionThreshold: policy.repetitionThreshold,
  validationWindowTasks: policy.validationWindowTasks,
  signals
};

fs.writeFileSync(reviewPath, `${JSON.stringify(review, null, 2)}\n`);
const repeated = signals.filter((signal) => signal.requiresProposalReview).length;
console.log(`Learning review generated: ${records.length} observations, ${signals.length} signals, ${repeated} repeated signals requiring proposal review.`);
