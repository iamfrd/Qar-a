import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

export const root = process.cwd();
const resolve = (relativePath) => path.resolve(root, relativePath);
const statePath = resolve('.claude/work-os/state.json');
const policyPath = resolve('.claude/work-os/policy.json');
const eventsPath = resolve('.claude/work-os/events.jsonl');
const registryPath = resolve('.claude/capability-registry.json');
const performancePolicyPath = resolve('.claude/performance/policy.json');
const performanceLedgerPath = resolve('.claude/performance/ledger.jsonl');
const lockPath = resolve('.claude/work-os/.lock');

const waitArray = new Int32Array(new SharedArrayBuffer(4));
const sleep = (ms) => Atomics.wait(waitArray, 0, 0, ms);

export function fail(message) {
  const error = new Error(message);
  error.name = 'WorkOsError';
  throw error;
}

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function readPolicy() {
  return readJson(policyPath);
}

export function readRegistry() {
  return readJson(registryPath);
}

export function readState() {
  if (!fs.existsSync(statePath)) fail('.claude/work-os/state.json is missing');
  return readJson(statePath);
}

export function readEvents(limit = 250) {
  if (!fs.existsSync(eventsPath)) return [];
  const lines = fs.readFileSync(eventsPath, 'utf8').split(/\r?\n/).filter(Boolean);
  return lines.slice(-Math.max(0, limit)).map((line, index) => {
    try { return JSON.parse(line); }
    catch { return { eventType: 'invalid-event', error: `Invalid event near tail index ${index}` }; }
  });
}

function acquireLock(timeoutMs = 5000) {
  fs.mkdirSync(path.dirname(lockPath), { recursive: true });
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const fd = fs.openSync(lockPath, 'wx');
      fs.writeFileSync(fd, `${process.pid}\n${new Date().toISOString()}\n`);
      fs.closeSync(fd);
      return;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      try {
        const age = Date.now() - fs.statSync(lockPath).mtimeMs;
        if (age > 30000) {
          fs.unlinkSync(lockPath);
          continue;
        }
      } catch {}
      sleep(50);
    }
  }
  fail('Work OS is busy. Could not acquire the state lock within 5 seconds.');
}

function releaseLock() {
  try { fs.unlinkSync(lockPath); } catch {}
}

function withLock(fn) {
  acquireLock();
  try { return fn(); }
  finally { releaseLock(); }
}

function atomicWriteJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`);
  fs.renameSync(tmp, file);
}

function appendEvent(event) {
  const clean = {
    schemaVersion: 1,
    eventId: event.eventId ?? `WO-EVT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    recordedAt: new Date().toISOString(),
    ...event
  };
  fs.mkdirSync(path.dirname(eventsPath), { recursive: true });
  fs.appendFileSync(eventsPath, `${JSON.stringify(clean)}\n`);
  return clean;
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function uniqueStrings(values = []) {
  return [...new Set(values.map(normalizeString).filter(Boolean))];
}

function assertNoSensitiveKeys(value, pathLabel = 'payload') {
  const forbidden = /(?:password|passwd|secret|private[_-]?key|access[_-]?token|refresh[_-]?token|api[_-]?key|authorization|cookie)/i;
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoSensitiveKeys(item, `${pathLabel}[${index}]`));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, item] of Object.entries(value)) {
    if (forbidden.test(key)) fail(`${pathLabel}.${key} looks like a secret-bearing field. Store a safe reference instead.`);
    assertNoSensitiveKeys(item, `${pathLabel}.${key}`);
  }
}

function getValidAgentSets() {
  const registry = readRegistry();
  const agents = new Set(registry.agents.map((agent) => agent.name));
  const reviewers = new Set([...agents, registry.ownerRole]);
  return { registry, agents, reviewers };
}

function findTask(state, taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) fail(`Task not found: ${taskId}`);
  return task;
}

function findSubtask(task, subtaskId) {
  const subtask = task.subtasks.find((item) => item.id === subtaskId);
  if (!subtask) fail(`Subtask not found: ${subtaskId}`);
  return subtask;
}

function nextTaskId(state) {
  state.counters.task = Number(state.counters.task ?? 0) + 1;
  return `QW-${String(state.counters.task).padStart(4, '0')}`;
}

function nextCommentId(state) {
  state.counters.comment = Number(state.counters.comment ?? 0) + 1;
  return `QWC-${String(state.counters.comment).padStart(5, '0')}`;
}

function nextSubtaskId(task) {
  const n = task.subtasks.length + 1;
  return `${task.id}-S${String(n).padStart(2, '0')}`;
}

function laneFor(points) {
  if (points <= 3) return 'fast';
  if (points <= 6) return 'standard';
  return 'critical';
}

function dependenciesSatisfied(task, subtask) {
  return subtask.dependencies.every((dependencyId) => {
    const dependency = task.subtasks.find((item) => item.id === dependencyId);
    return dependency && dependency.status === 'done';
  });
}

function hasOpenDecision(task) {
  return task.decisionRequired?.open === true;
}

function recomputeSubtaskReadiness(task) {
  for (const subtask of task.subtasks) {
    if (!['waiting', 'ready'].includes(subtask.status)) continue;
    const ready = dependenciesSatisfied(task, subtask) && !hasOpenDecision(task);
    subtask.status = ready ? 'ready' : 'waiting';
  }
}

export function recomputeTask(task) {
  recomputeSubtaskReadiness(task);
  const activeSubtasks = task.subtasks;
  task.kpiMaxPoints = round(activeSubtasks.reduce((sum, item) => sum + item.basePoints, 0));
  task.kpiEarnedPoints = round(activeSubtasks.reduce((sum, item) => sum + (item.earnedPoints ?? 0), 0));
  task.progress = {
    completed: task.subtasks.filter((item) => item.status === 'done').length,
    total: task.subtasks.length,
    percent: task.subtasks.length ? Math.round(task.subtasks.filter((item) => item.status === 'done').length / task.subtasks.length * 100) : 0
  };
  task.participants = uniqueStrings(task.subtasks.flatMap((item) => [item.assignedAgent, ...(item.collaborators ?? []), item.reviewerAgent]));

  if (task.status === 'archived') return task;
  if (task.type === 'routine' && task.subtasks.length === 0) {
    task.status = 'routine';
    return task;
  }
  if (hasOpenDecision(task)) task.status = 'needs_decision';
  else if (task.subtasks.length && task.subtasks.every((item) => item.status === 'done')) task.status = 'done';
  else if (task.subtasks.some((item) => item.status === 'review')) task.status = 'review';
  else if (task.subtasks.some((item) => ['in_progress', 'rework'].includes(item.status))) task.status = 'in_progress';
  else if (task.subtasks.some((item) => item.status === 'ready')) task.status = 'ready';
  else if (task.subtasks.some((item) => item.status === 'blocked')) task.status = 'blocked';
  else task.status = task.subtasks.length ? 'inbox' : (task.type === 'routine' ? 'routine' : 'inbox');

  if (task.status === 'done' && !task.completedAt) task.completedAt = new Date().toISOString();
  if (task.status !== 'done') task.completedAt = null;
  return task;
}

function recomputeAll(state) {
  for (const task of state.tasks) recomputeTask(task);
  state.updatedAt = new Date().toISOString();
  return state;
}

function round(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function persistState(state) {
  recomputeAll(state);
  atomicWriteJson(statePath, state);
  return state;
}

function runJsonScript(scriptRelative, payload) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'qarga-work-os-'));
  const tempFile = path.join(tempDir, 'payload.json');
  fs.writeFileSync(tempFile, `${JSON.stringify(payload, null, 2)}\n`);
  const result = spawnSync(process.execPath, [resolve(scriptRelative), tempFile], {
    cwd: root,
    encoding: 'utf8'
  });
  try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
  if (result.status !== 0) fail((result.stderr || result.stdout || `${scriptRelative} failed`).trim());
  return (result.stdout || '').trim();
}

function recordContractCreated(subtask, options) {
  const event = {
    eventId: `${subtask.id}-CREATE-001`,
    taskId: subtask.contractTaskId,
    eventType: 'created',
    title: subtask.title,
    lane: laneFor(subtask.basePoints),
    basePoints: subtask.basePoints,
    ownerAgent: subtask.assignedAgent,
    reviewerAgent: subtask.reviewerAgent,
    allowedFiles: options.allowedFiles,
    forbiddenFiles: options.forbiddenFiles,
    approvalGates: options.approvalGates,
    requirements: subtask.acceptanceCriteria.map((item) => ({ id: item.id, text: item.text, evidence: item.evidenceExpectation })),
    sensitiveDataIncluded: false
  };
  return runJsonScript('scripts/record-task-event.mjs', event);
}

function recordRequirementEvidence(subtask, reviewerAgent) {
  for (const requirement of subtask.acceptanceCriteria) {
    if (!Array.isArray(requirement.evidenceRefs) || requirement.evidenceRefs.length === 0) {
      fail(`${subtask.id} requirement ${requirement.id} has no submitted evidence reference`);
    }
    runJsonScript('scripts/record-task-event.mjs', {
      eventId: `${subtask.id}-EVIDENCE-${requirement.id}-${Date.now()}`,
      taskId: subtask.contractTaskId,
      eventType: 'evidence',
      requirementId: requirement.id,
      verifiedBy: reviewerAgent,
      evidence: requirement.evidenceRefs,
      sensitiveDataIncluded: false
    });
  }
}

function closeContract(subtask, reviewerAgent, outcome, remainingRisk) {
  return runJsonScript('scripts/record-task-event.mjs', {
    eventId: `${subtask.id}-CLOSE-${Date.now()}`,
    taskId: subtask.contractTaskId,
    eventType: 'closed',
    status: outcome,
    closedBy: reviewerAgent,
    ...(outcome === 'partial' ? { remainingRisk } : {}),
    sensitiveDataIncluded: false
  });
}

function recordPerformance(subtask, reviewerAgent, outcome, dimensions, evidence, strengths, improvementAreas, notes) {
  return runJsonScript('scripts/record-agent-performance.mjs', {
    taskId: subtask.contractTaskId,
    taskTitle: subtask.title,
    agent: subtask.assignedAgent,
    reviewer: reviewerAgent,
    basePoints: subtask.basePoints,
    status: outcome,
    dimensions,
    evidence,
    strengths,
    improvementAreas,
    notes
  });
}

function latestPerformance(taskId, agent) {
  if (!fs.existsSync(performanceLedgerPath)) return null;
  const lines = fs.readFileSync(performanceLedgerPath, 'utf8').split(/\r?\n/).filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const item = JSON.parse(lines[i]);
    if (item.eventType === 'task-evaluation' && item.taskId === taskId && item.agent === agent) return item;
  }
  return null;
}

export function createTask(input) {
  assertNoSensitiveKeys(input);
  const policy = readPolicy();
  const type = normalizeString(input.type || 'feature');
  const priority = normalizeString(input.priority || 'medium');
  if (!policy.taskTypes.includes(type)) fail(`Unknown task type: ${type}`);
  if (!policy.priorities.includes(priority)) fail(`Unknown priority: ${priority}`);
  const title = normalizeString(input.title);
  if (!title) fail('Task title is required');

  return withLock(() => {
    const state = readState();
    const id = nextTaskId(state);
    const now = new Date().toISOString();
    const task = {
      id,
      title,
      description: normalizeString(input.description),
      type,
      status: type === 'routine' ? 'routine' : 'inbox',
      priority,
      ownerAgent: 'qarga-coordinator',
      team: normalizeString(input.team),
      sprint: normalizeString(input.sprint),
      labels: uniqueStrings(input.labels),
      dueDate: normalizeString(input.dueDate) || null,
      kpiMaxPoints: 0,
      kpiEarnedPoints: 0,
      progress: { completed: 0, total: 0, percent: 0 },
      participants: [],
      decisionRequired: {
        open: Boolean(input.decisionRequired),
        summary: normalizeString(input.decisionSummary) || null,
        options: uniqueStrings(input.decisionOptions),
        decisionId: null,
        resolvedAt: null
      },
      links: {
        decisions: uniqueStrings(input.decisionLinks),
        technicalDebt: uniqueStrings(input.debtLinks),
        experiments: uniqueStrings(input.experimentLinks),
        githubIssues: uniqueStrings(input.githubIssues),
        pullRequests: uniqueStrings(input.pullRequests)
      },
      subtasks: [],
      comments: [],
      attachments: [],
      createdAt: now,
      updatedAt: now,
      completedAt: null,
      archivedAt: null
    };
    state.tasks.push(task);
    persistState(state);
    appendEvent({ eventType: 'task-created', taskId: id, actor: input.actor || 'qarga-coordinator', title, type, priority });
    return task;
  });
}

export function addSubtask(taskId, input) {
  assertNoSensitiveKeys(input);
  const { agents, reviewers } = getValidAgentSets();
  const title = normalizeString(input.title);
  const assignedAgent = normalizeString(input.assignedAgent);
  const reviewerAgent = normalizeString(input.reviewerAgent);
  const basePoints = Number(input.basePoints);
  if (!title) fail('Subtask title is required');
  if (!agents.has(assignedAgent)) fail(`Unknown assigned agent: ${assignedAgent}`);
  if (!reviewers.has(reviewerAgent)) fail(`Unknown reviewer: ${reviewerAgent}`);
  if (assignedAgent === reviewerAgent) fail('Assigned agent and reviewer must differ');
  if (!Number.isInteger(basePoints) || basePoints < 1 || basePoints > 10) fail('Subtask basePoints must be an integer from 1 to 10');
  if (!Array.isArray(input.acceptanceCriteria) || input.acceptanceCriteria.length === 0) fail('At least one acceptance criterion is required');
  const taskContractPolicy = readJson(resolve('.claude/tasks/policy.json'));
  const selectedLane = laneFor(basePoints);
  const minimumRequirements = taskContractPolicy?.lanes?.[selectedLane]?.minimumRequirements ?? 1;
  if (input.acceptanceCriteria.length < minimumRequirements) fail(`${selectedLane} lane with ${basePoints} base points requires at least ${minimumRequirements} acceptance criteria`);

  return withLock(() => {
    const state = readState();
    const task = findTask(state, taskId);
    if (task.status === 'archived') fail('Cannot add a subtask to an archived task');
    const id = nextSubtaskId(task);
    const dependencies = uniqueStrings(input.dependencies);
    for (const dependencyId of dependencies) if (!task.subtasks.some((item) => item.id === dependencyId)) fail(`Unknown dependency: ${dependencyId}`);
    const acceptanceCriteria = input.acceptanceCriteria.map((criterion, index) => {
      const text = normalizeString(criterion.text ?? criterion);
      if (!text) fail(`Acceptance criterion ${index + 1} is empty`);
      return {
        id: `REQ-${index + 1}`,
        text,
        evidenceExpectation: normalizeString(criterion.evidenceExpectation) || 'Reviewer-verified test, diff, artifact, or other concrete evidence reference',
        evidenceRefs: []
      };
    });
    const subtask = {
      id,
      parentTaskId: task.id,
      contractTaskId: id,
      title,
      description: normalizeString(input.description),
      assignedAgent,
      collaborators: uniqueStrings(input.collaborators),
      reviewerAgent,
      basePoints,
      lane: laneFor(basePoints),
      status: 'waiting',
      outcome: null,
      qualityScore: null,
      earnedPoints: 0,
      dependencies,
      acceptanceCriteria,
      allowedFiles: uniqueStrings(input.allowedFiles),
      forbiddenFiles: uniqueStrings(['.env*', ...(input.forbiddenFiles ?? [])]),
      approvalGates: uniqueStrings(input.approvalGates),
      blocker: null,
      dueDate: normalizeString(input.dueDate) || null,
      summary: null,
      startedAt: null,
      submittedAt: null,
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    recordContractCreated(subtask, {
      allowedFiles: subtask.allowedFiles,
      forbiddenFiles: subtask.forbiddenFiles,
      approvalGates: subtask.approvalGates
    });
    task.subtasks.push(subtask);
    persistState(state);
    appendEvent({ eventType: 'subtask-created', taskId: task.id, subtaskId: id, actor: input.actor || 'qarga-coordinator', assignedAgent, reviewerAgent, basePoints, dependencies });
    return findSubtask(findTask(readState(), taskId), id);
  });
}

export function startSubtask(taskId, subtaskId, actor) {
  return withLock(() => {
    const state = readState();
    const task = findTask(state, taskId);
    recomputeTask(task);
    const subtask = findSubtask(task, subtaskId);
    if (actor !== subtask.assignedAgent) fail(`Only assigned agent ${subtask.assignedAgent} may start ${subtask.id}`);
    if (!['ready', 'rework'].includes(subtask.status)) fail(`${subtask.id} is not ready to start; current status: ${subtask.status}`);
    if (!dependenciesSatisfied(task, subtask)) fail(`${subtask.id} still has incomplete dependencies`);
    if (hasOpenDecision(task)) fail(`${task.id} is waiting for an owner decision`);
    subtask.status = 'in_progress';
    subtask.startedAt ??= new Date().toISOString();
    subtask.updatedAt = new Date().toISOString();
    persistState(state);
    appendEvent({ eventType: 'subtask-started', taskId, subtaskId, actor });
    return subtask;
  });
}

export function submitSubtask(taskId, subtaskId, input) {
  assertNoSensitiveKeys(input);
  return withLock(() => {
    const state = readState();
    const task = findTask(state, taskId);
    const subtask = findSubtask(task, subtaskId);
    if (input.actor !== subtask.assignedAgent) fail(`Only assigned agent ${subtask.assignedAgent} may submit ${subtask.id}`);
    if (!['in_progress', 'rework'].includes(subtask.status)) fail(`${subtask.id} must be in progress or rework before submission`);
    const evidenceByRequirement = input.evidenceByRequirement ?? {};
    for (const requirement of subtask.acceptanceCriteria) {
      const refs = uniqueStrings(evidenceByRequirement[requirement.id] ?? []);
      if (refs.length) requirement.evidenceRefs = refs;
    }
    const missing = subtask.acceptanceCriteria.filter((item) => item.evidenceRefs.length === 0).map((item) => item.id);
    if (missing.length) fail(`Submission is missing evidence for: ${missing.join(', ')}`);
    subtask.summary = normalizeString(input.summary);
    subtask.status = 'review';
    subtask.submittedAt = new Date().toISOString();
    subtask.updatedAt = subtask.submittedAt;
    persistState(state);
    appendEvent({ eventType: 'subtask-submitted', taskId, subtaskId, actor: input.actor, summary: subtask.summary, requirementIds: subtask.acceptanceCriteria.map((item) => item.id) });
    return subtask;
  });
}

export function blockSubtask(taskId, subtaskId, input) {
  const reason = normalizeString(input.reason);
  if (!reason) fail('Blocker reason is required');
  return withLock(() => {
    const state = readState();
    const task = findTask(state, taskId);
    const subtask = findSubtask(task, subtaskId);
    const allowedActors = new Set([subtask.assignedAgent, subtask.reviewerAgent, 'qarga-coordinator']);
    if (!allowedActors.has(input.actor)) fail('Only the assigned agent, reviewer, or coordinator may block this subtask');
    subtask.status = 'blocked';
    subtask.blocker = { reason, since: new Date().toISOString(), actor: input.actor };
    subtask.updatedAt = new Date().toISOString();
    persistState(state);
    appendEvent({ eventType: 'subtask-blocked', taskId, subtaskId, actor: input.actor, reason });
    return subtask;
  });
}

export function unblockSubtask(taskId, subtaskId, input) {
  return withLock(() => {
    const state = readState();
    const task = findTask(state, taskId);
    const subtask = findSubtask(task, subtaskId);
    if (!['qarga-coordinator', subtask.reviewerAgent].includes(input.actor)) fail('Only the coordinator or reviewer may unblock this subtask');
    subtask.blocker = null;
    subtask.status = dependenciesSatisfied(task, subtask) && !hasOpenDecision(task) ? 'ready' : 'waiting';
    subtask.updatedAt = new Date().toISOString();
    persistState(state);
    appendEvent({ eventType: 'subtask-unblocked', taskId, subtaskId, actor: input.actor });
    return subtask;
  });
}

export function reviewSubtask(taskId, subtaskId, input) {
  assertNoSensitiveKeys(input);
  const outcome = normalizeString(input.outcome);
  if (!['accepted', 'rework', 'partial', 'rejected'].includes(outcome)) fail('Review outcome must be accepted, rework, partial, or rejected');
  return withLock(() => {
    const state = readState();
    const task = findTask(state, taskId);
    const subtask = findSubtask(task, subtaskId);
    const reviewer = normalizeString(input.reviewer);
    if (reviewer !== subtask.reviewerAgent) fail(`Only assigned reviewer ${subtask.reviewerAgent} may review ${subtask.id}`);
    if (subtask.status !== 'review') fail(`${subtask.id} is not awaiting review`);

    if (outcome === 'rework') {
      const note = normalizeString(input.notes);
      if (!note) fail('Rework requires review notes');
      subtask.status = 'rework';
      subtask.blocker = null;
      subtask.updatedAt = new Date().toISOString();
      persistState(state);
      appendEvent({ eventType: 'subtask-rework-requested', taskId, subtaskId, actor: reviewer, agent: subtask.assignedAgent, notes: note });
      return subtask;
    }

    const dimensions = input.dimensions ?? {};
    const performancePolicy = readJson(performancePolicyPath);
    for (const dimension of Object.keys(performancePolicy.qualityWeights ?? {})) {
      const score = Number(dimensions[dimension]);
      if (!Number.isFinite(score) || score < 0 || score > 100) fail(`Review dimension ${dimension} must be 0-100`);
      dimensions[dimension] = score;
    }
    if (outcome === 'partial' && !normalizeString(input.remainingRisk)) fail('Partial review requires remainingRisk');

    recordRequirementEvidence(subtask, reviewer);
    closeContract(subtask, reviewer, outcome, normalizeString(input.remainingRisk));
    const evidence = uniqueStrings(subtask.acceptanceCriteria.flatMap((item) => item.evidenceRefs));
    recordPerformance(
      subtask,
      reviewer,
      outcome,
      dimensions,
      evidence,
      uniqueStrings(input.strengths),
      uniqueStrings(input.improvementAreas),
      normalizeString(input.notes)
    );
    const performance = latestPerformance(subtask.contractTaskId, subtask.assignedAgent);
    subtask.outcome = outcome;
    subtask.qualityScore = performance?.qualityScore ?? null;
    subtask.earnedPoints = performance?.earnedPoints ?? 0;
    subtask.completedAt = new Date().toISOString();
    subtask.updatedAt = subtask.completedAt;
    if (outcome === 'accepted') {
      subtask.status = 'done';
      subtask.blocker = null;
    } else {
      subtask.status = 'blocked';
      subtask.blocker = {
        reason: outcome === 'partial' ? normalizeString(input.remainingRisk) : 'Review rejected the deliverable. Create a replacement or corrective subtask before continuing.',
        since: subtask.completedAt,
        actor: reviewer
      };
    }
    persistState(state);
    appendEvent({
      eventType: 'subtask-reviewed',
      taskId,
      subtaskId,
      actor: reviewer,
      outcome,
      qualityScore: subtask.qualityScore,
      earnedPoints: subtask.earnedPoints,
      basePoints: subtask.basePoints,
      remainingRisk: outcome === 'partial' ? normalizeString(input.remainingRisk) : null
    });
    return subtask;
  });
}

export function addComment(taskId, input) {
  assertNoSensitiveKeys(input);
  const text = normalizeString(input.text);
  const author = normalizeString(input.author);
  if (!text || !author) fail('Comment author and text are required');
  return withLock(() => {
    const state = readState();
    const task = findTask(state, taskId);
    const comment = {
      id: nextCommentId(state),
      author,
      text,
      kind: normalizeString(input.kind || 'comment'),
      createdAt: new Date().toISOString()
    };
    task.comments.push(comment);
    task.updatedAt = comment.createdAt;
    persistState(state);
    appendEvent({ eventType: 'comment-added', taskId, actor: author, commentId: comment.id, kind: comment.kind });
    return comment;
  });
}

export function setDecision(taskId, input) {
  assertNoSensitiveKeys(input);
  return withLock(() => {
    const state = readState();
    const task = findTask(state, taskId);
    if (input.resolve === true) {
      if (input.actor !== 'project-owner') fail('Only project-owner may resolve an owner-decision gate');
      const summary = normalizeString(input.summary);
      if (!summary) fail('Resolved decision summary is required');
      task.decisionRequired = {
        open: false,
        summary,
        options: task.decisionRequired?.options ?? [],
        decisionId: normalizeString(input.decisionId) || null,
        resolvedAt: new Date().toISOString()
      };
      if (task.decisionRequired.decisionId && !task.links.decisions.includes(task.decisionRequired.decisionId)) task.links.decisions.push(task.decisionRequired.decisionId);
      appendEvent({ eventType: 'owner-decision-resolved', taskId, actor: input.actor, decisionId: task.decisionRequired.decisionId, summary });
    } else {
      if (input.actor !== 'qarga-coordinator') fail('Only qarga-coordinator may open an owner-decision gate');
      const summary = normalizeString(input.summary);
      if (!summary) fail('Decision summary is required');
      task.decisionRequired = {
        open: true,
        summary,
        options: uniqueStrings(input.options),
        decisionId: null,
        resolvedAt: null
      };
      appendEvent({ eventType: 'owner-decision-requested', taskId, actor: input.actor, summary, options: task.decisionRequired.options });
    }
    task.updatedAt = new Date().toISOString();
    persistState(state);
    return task.decisionRequired;
  });
}

export function archiveTask(taskId, actor = 'qarga-coordinator') {
  if (actor !== 'qarga-coordinator') fail('Only qarga-coordinator may archive tasks');
  return withLock(() => {
    const state = readState();
    const task = findTask(state, taskId);
    if (!['done', 'routine'].includes(task.status)) fail('Only done or inactive routine tasks may be archived');
    task.status = 'archived';
    task.archivedAt = new Date().toISOString();
    task.updatedAt = task.archivedAt;
    persistState(state);
    appendEvent({ eventType: 'task-archived', taskId, actor });
    return task;
  });
}

export function getAgentQueue(agentName) {
  const { agents } = getValidAgentSets();
  if (!agents.has(agentName)) fail(`Unknown agent: ${agentName}`);
  const state = recomputeAll(readState());
  return state.tasks.flatMap((task) => task.subtasks
    .filter((subtask) => subtask.assignedAgent === agentName && subtask.status === 'ready')
    .map((subtask) => ({
      taskId: task.id,
      taskTitle: task.title,
      taskPriority: task.priority,
      subtaskId: subtask.id,
      title: subtask.title,
      basePoints: subtask.basePoints,
      lane: subtask.lane,
      dueDate: subtask.dueDate,
      dependencies: subtask.dependencies
    })))
    .sort((a, b) => priorityRank(b.taskPriority) - priorityRank(a.taskPriority) || b.basePoints - a.basePoints || a.subtaskId.localeCompare(b.subtaskId));
}

function priorityRank(value) {
  return { low: 1, medium: 2, high: 3, critical: 4 }[value] ?? 0;
}

export function summarizeState() {
  const state = recomputeAll(readState());
  const byStatus = Object.fromEntries(readPolicy().board.columns.map((status) => [status, state.tasks.filter((task) => task.status === status).length]));
  const ownerDecisions = state.tasks.filter((task) => task.decisionRequired?.open).map((task) => ({ id: task.id, title: task.title, summary: task.decisionRequired.summary, options: task.decisionRequired.options }));
  const activeSubtasks = state.tasks.flatMap((task) => task.subtasks.map((subtask) => ({ task, subtask }))).filter(({ subtask }) => ['ready', 'in_progress', 'review', 'rework', 'blocked'].includes(subtask.status));
  return {
    updatedAt: state.updatedAt,
    taskCount: state.tasks.length,
    byStatus,
    ownerDecisions,
    activeSubtasks: activeSubtasks.length,
    totalKpiMaxPoints: round(state.tasks.reduce((sum, task) => sum + task.kpiMaxPoints, 0)),
    totalKpiEarnedPoints: round(state.tasks.reduce((sum, task) => sum + task.kpiEarnedPoints, 0))
  };
}

function detectDependencyCycle(task) {
  const graph = new Map(task.subtasks.map((subtask) => [subtask.id, subtask.dependencies]));
  const visiting = new Set();
  const visited = new Set();
  function visit(id) {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    for (const dep of graph.get(id) ?? []) if (visit(dep)) return true;
    visiting.delete(id);
    visited.add(id);
    return false;
  }
  return [...graph.keys()].some(visit);
}

export function validateWorkOs() {
  const errors = [];
  const warnings = [];
  let state;
  let policy;
  let registry;
  try { state = readState(); } catch (error) { return { errors: [error.message], warnings }; }
  try { policy = readPolicy(); } catch (error) { errors.push(error.message); }
  try { registry = readRegistry(); } catch (error) { errors.push(error.message); }
  if (!policy || !registry) return { errors, warnings };
  if (state.schemaVersion !== 1) errors.push('Work OS state schemaVersion must be 1');
  if (!Array.isArray(state.tasks)) errors.push('Work OS tasks must be an array');
  const agentNames = new Set(registry.agents.map((item) => item.name));
  const reviewerNames = new Set([...agentNames, registry.ownerRole]);
  const taskIds = new Set();
  const contractLedger = fs.existsSync(resolve('.claude/tasks/contracts.jsonl'))
    ? fs.readFileSync(resolve('.claude/tasks/contracts.jsonl'), 'utf8').split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line))
    : [];
  const contractIds = new Set(contractLedger.filter((item) => item.eventType === 'created').map((item) => item.taskId));

  for (const task of state.tasks ?? []) {
    if (!task.id || taskIds.has(task.id)) errors.push(`Missing or duplicate task id: ${task.id ?? '<missing>'}`);
    taskIds.add(task.id);
    if (!policy.taskTypes.includes(task.type)) errors.push(`${task.id}: unknown type ${task.type}`);
    if (!policy.priorities.includes(task.priority)) errors.push(`${task.id}: unknown priority ${task.priority}`);
    if (!policy.board.columns.includes(task.status)) errors.push(`${task.id}: unknown status ${task.status}`);
    const subtaskIds = new Set(task.subtasks.map((item) => item.id));
    for (const subtask of task.subtasks) {
      if (!agentNames.has(subtask.assignedAgent)) errors.push(`${subtask.id}: unknown assignedAgent ${subtask.assignedAgent}`);
      if (!reviewerNames.has(subtask.reviewerAgent)) errors.push(`${subtask.id}: unknown reviewer ${subtask.reviewerAgent}`);
      if (subtask.assignedAgent === subtask.reviewerAgent) errors.push(`${subtask.id}: assigned agent cannot review own work`);
      if (!Number.isInteger(subtask.basePoints) || subtask.basePoints < 1 || subtask.basePoints > 10) errors.push(`${subtask.id}: basePoints must be integer 1-10`);
      if (!policy.subtaskStatuses.includes(subtask.status)) errors.push(`${subtask.id}: unknown status ${subtask.status}`);
      if (!contractIds.has(subtask.contractTaskId)) errors.push(`${subtask.id}: completion contract ${subtask.contractTaskId} is missing`);
      for (const dep of subtask.dependencies) if (!subtaskIds.has(dep)) errors.push(`${subtask.id}: dependency ${dep} does not exist in parent task`);
      if (subtask.status === 'done' && subtask.outcome !== 'accepted') errors.push(`${subtask.id}: done requires accepted outcome`);
      if (subtask.status === 'done' && subtask.qualityScore === null) errors.push(`${subtask.id}: done requires a quality score`);
      if (!Array.isArray(subtask.acceptanceCriteria) || subtask.acceptanceCriteria.length === 0) errors.push(`${subtask.id}: acceptance criteria are missing`);
    }
    if (detectDependencyCycle(task)) errors.push(`${task.id}: dependency graph contains a cycle`);
    const expectedMax = round(task.subtasks.reduce((sum, item) => sum + item.basePoints, 0));
    if (round(task.kpiMaxPoints) !== expectedMax) warnings.push(`${task.id}: stored KPI max ${task.kpiMaxPoints} differs from derived ${expectedMax}; run a Work OS command to refresh state`);
  }
  return { errors, warnings };
}

export function refreshState() {
  return withLock(() => persistState(readState()));
}

export function publicState() {
  const state = recomputeAll(readState());
  const registry = readRegistry();
  const scorecards = fs.existsSync(resolve('.claude/performance/scorecards.json')) ? readJson(resolve('.claude/performance/scorecards.json')) : { agents: {} };
  return {
    ...state,
    agents: registry.agents.map((agent) => ({
      name: agent.name,
      department: agent.department,
      role: agent.role,
      status: agent.status,
      level: scorecards.agents?.[agent.name]?.level ?? 'unrated',
      rollingQuality: scorecards.agents?.[agent.name]?.rollingQuality ?? null
    })),
    recentEvents: readEvents(300),
    summary: summarizeState()
  };
}
