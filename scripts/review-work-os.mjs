import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { publicState, readEvents, validateWorkOs } from './work-os-core.mjs';

const root = process.cwd();
const outPath = path.resolve(root, '.claude/work-os/review.json');
const state = publicState();
const validation = validateWorkOs();
const events = readEvents(2000);
const now = Date.now();
const ageDays = (iso) => iso ? Math.floor((now - new Date(iso).getTime()) / 86400000) : null;

const blocked = [];
const stale = [];
const reviewQueue = [];
const reworkByAgent = new Map();
const blockerByCategory = new Map();

for (const task of state.tasks) {
  if (task.decisionRequired?.open) blocked.push({ taskId: task.id, type: 'owner-decision', detail: task.decisionRequired.summary });
  for (const subtask of task.subtasks) {
    if (subtask.status === 'blocked') blocked.push({ taskId: task.id, subtaskId: subtask.id, type: 'subtask-blocker', detail: subtask.blocker?.reason || 'blocked' });
    if (subtask.status === 'review') reviewQueue.push({ taskId: task.id, subtaskId: subtask.id, reviewer: subtask.reviewerAgent, submittedAt: subtask.submittedAt });
    if (['ready','in_progress','review','rework','blocked'].includes(subtask.status)) {
      const days = ageDays(subtask.updatedAt || subtask.createdAt);
      if (days !== null && days >= 3) stale.push({ taskId: task.id, subtaskId: subtask.id, status: subtask.status, ageDays: days, agent: subtask.assignedAgent });
    }
  }
}

for (const event of events) {
  if (event.eventType === 'subtask-rework-requested' && event.agent) reworkByAgent.set(event.agent, (reworkByAgent.get(event.agent) || 0) + 1);
  if (event.eventType === 'subtask-blocked' && event.reason) {
    const normalized = String(event.reason).toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter((word) => word.length >= 5).slice(0, 3).join(' ') || 'other';
    blockerByCategory.set(normalized, (blockerByCategory.get(normalized) || 0) + 1);
  }
}

const learningCandidates = [];
for (const [reviewerOrActor, count] of reworkByAgent) {
  if (count >= 2) learningCandidates.push({ signal: 'repeated-rework', subject: reviewerOrActor, occurrences: count, recommendation: 'Inspect the underlying task/agent pattern before proposing a checklist, skill, routing change, or new specialist.' });
}
for (const [category, count] of blockerByCategory) {
  if (count >= 2) learningCandidates.push({ signal: 'repeated-blocker-pattern', subject: category, occurrences: count, recommendation: 'Verify current repository evidence and run controlled-learning/system-research if this is a real recurring capability gap.' });
}

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  status: validation.errors.length ? 'FAIL' : blocked.length || stale.length ? 'ATTENTION' : 'HEALTHY',
  validation,
  summary: state.summary,
  blocked,
  stale,
  reviewQueue,
  learningCandidates,
  note: 'Learning candidates are evidence prompts only. They never authorize automatic prompt, skill, permission, hook, integration, or agent changes.'
};
fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Work OS review: ${report.status}. ${blocked.length} blocker(s), ${reviewQueue.length} review item(s), ${stale.length} stale item(s), ${learningCandidates.length} learning candidate(s).`);
if (validation.errors.length) process.exit(1);
