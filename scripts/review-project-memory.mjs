import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const dir = path.join(root, '.claude/project-memory');
const now = new Date();

function readJsonl(name) {
  const file = path.join(dir, name);
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).map((line, index) => {
    try { return JSON.parse(line); }
    catch (error) {
      console.error(`${name} line ${index + 1} is invalid JSON: ${error.message}`);
      process.exit(1);
    }
  });
}
function latestBy(events, idField) {
  const map = new Map();
  for (const event of events) map.set(event[idField], event);
  return map;
}
function isDateDue(trigger) {
  if (!trigger || trigger.type !== 'date' || typeof trigger.value !== 'string') return false;
  const date = new Date(trigger.value);
  return !Number.isNaN(date.getTime()) && date <= now;
}
function ref(event, idField) {
  return {
    id: event[idField],
    title: event.title,
    status: event.status,
    reviewTrigger: event.reviewTrigger ?? null,
    ownerAgent: event.ownerAgent ?? null,
    severity: event.severity ?? null
  };
}

const decisions = latestBy(readJsonl('decisions.jsonl'), 'decisionId');
const debt = latestBy(readJsonl('technical-debt.jsonl'), 'debtId');
const experiments = latestBy(readJsonl('experiments.jsonl'), 'experimentId');

const decisionValues = [...decisions.values()];
const debtValues = [...debt.values()];
const experimentValues = [...experiments.values()];

const output = {
  generatedAt: now.toISOString(),
  decisions: {
    totalEntities: decisionValues.length,
    approved: decisionValues.filter((x) => x.status === 'approved').map((x) => ref(x, 'decisionId')),
    reviewDue: decisionValues.filter((x) => x.status === 'approved' && isDateDue(x.reviewTrigger)).map((x) => ref(x, 'decisionId')),
    manualReviewTriggers: decisionValues.filter((x) => x.status === 'approved' && x.reviewTrigger && x.reviewTrigger.type !== 'date').map((x) => ref(x, 'decisionId')),
    superseded: decisionValues.filter((x) => x.status === 'superseded').map((x) => ref(x, 'decisionId'))
  },
  technicalDebt: {
    totalEntities: debtValues.length,
    openCritical: debtValues.filter((x) => ['open','planned'].includes(x.status) && x.severity === 'critical').map((x) => ref(x, 'debtId')),
    openHigh: debtValues.filter((x) => ['open','planned'].includes(x.status) && x.severity === 'high').map((x) => ref(x, 'debtId')),
    reviewDue: debtValues.filter((x) => ['open','planned','accepted-risk'].includes(x.status) && isDateDue(x.reviewTrigger)).map((x) => ref(x, 'debtId')),
    manualReviewTriggers: debtValues.filter((x) => ['open','planned','accepted-risk'].includes(x.status) && x.reviewTrigger && x.reviewTrigger.type !== 'date').map((x) => ref(x, 'debtId')),
    resolved: debtValues.filter((x) => x.status === 'resolved').map((x) => ref(x, 'debtId'))
  },
  experiments: {
    totalEntities: experimentValues.length,
    draft: experimentValues.filter((x) => x.status === 'draft').map((x) => ref(x, 'experimentId')),
    approved: experimentValues.filter((x) => x.status === 'approved').map((x) => ref(x, 'experimentId')),
    running: experimentValues.filter((x) => x.status === 'running').map((x) => ref(x, 'experimentId')),
    reviewDue: experimentValues.filter((x) => ['approved','running','paused'].includes(x.status) && isDateDue(x.reviewTrigger)).map((x) => ref(x, 'experimentId')),
    manualReviewTriggers: experimentValues.filter((x) => ['approved','running','paused'].includes(x.status) && x.reviewTrigger && x.reviewTrigger.type !== 'date').map((x) => ref(x, 'experimentId')),
    completed: experimentValues.filter((x) => x.status === 'completed').map((x) => ref(x, 'experimentId'))
  },
  crossSignals: {
    learningCandidates: [],
    teamReviewCandidates: [],
    releaseBlockers: []
  }
};

const debtCategoryCounts = new Map();
for (const item of debtValues.filter((x) => ['open','planned','accepted-risk'].includes(x.status))) {
  const key = item.category || 'uncategorized';
  debtCategoryCounts.set(key, (debtCategoryCounts.get(key) || 0) + 1);
}
for (const [category, count] of debtCategoryCounts) {
  if (count >= 2) output.crossSignals.learningCandidates.push({
    type: 'repeated-technical-debt', category, count,
    recommendation: 'Diagnose whether a reusable skill, checklist, architecture change, or team capability gap is causing repeated debt.'
  });
}

if (output.technicalDebt.openCritical.length) {
  output.crossSignals.releaseBlockers.push({
    type: 'critical-technical-debt',
    count: output.technicalDebt.openCritical.length,
    recommendation: 'Do not declare release READY until each critical item is resolved or the project owner explicitly accepts the residual risk.'
  });
}

const ownerCounts = new Map();
for (const item of debtValues.filter((x) => ['open','planned'].includes(x.status))) {
  if (!item.ownerAgent) continue;
  ownerCounts.set(item.ownerAgent, (ownerCounts.get(item.ownerAgent) || 0) + 1);
}
for (const [ownerAgent, count] of ownerCounts) {
  if (count >= 3) output.crossSignals.teamReviewCandidates.push({
    type: 'debt-concentration', ownerAgent, count,
    recommendation: 'Review whether the agent needs a narrower scope, new skill, paired review, or an additional specialist role.'
  });
}

fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'review.json'), `${JSON.stringify(output, null, 2)}\n`);
console.log(`Project-memory review updated: ${decisionValues.length} decisions, ${debtValues.length} debt items, ${experimentValues.length} experiments.`);
