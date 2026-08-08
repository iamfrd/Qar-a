import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const type = process.argv[2];
const inputPath = process.argv[3];
const root = process.cwd();
const config = {
  decision: { ledger: '.claude/project-memory/decisions.jsonl', idField: 'decisionId', prefix: 'DEC-' },
  debt: { ledger: '.claude/project-memory/technical-debt.jsonl', idField: 'debtId', prefix: 'DEBT-' },
  experiment: { ledger: '.claude/project-memory/experiments.jsonl', idField: 'experimentId', prefix: 'EXP-' }
};

function fail(message) {
  console.error(`Project-memory record rejected: ${message}`);
  process.exit(1);
}
function requireString(obj, key) {
  if (typeof obj[key] !== 'string' || !obj[key].trim()) fail(`${key} is required`);
}
function requireArray(obj, key, minimum = 0) {
  if (!Array.isArray(obj[key]) || obj[key].length < minimum) fail(`${key} must be an array with at least ${minimum} item(s)`);
}
function parseLedger(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).map((line, index) => {
    try { return JSON.parse(line); }
    catch (error) { fail(`${path.relative(root, file)} line ${index + 1} is invalid JSON: ${error.message}`); }
  });
}

if (!config[type]) fail('first argument must be decision, debt, or experiment');
if (!inputPath) fail('input JSON path is required');
const absoluteInput = path.resolve(root, inputPath);
if (!fs.existsSync(absoluteInput)) fail(`input file does not exist: ${inputPath}`);
let event;
try { event = JSON.parse(fs.readFileSync(absoluteInput, 'utf8')); }
catch (error) { fail(`input JSON is invalid: ${error.message}`); }

requireString(event, 'eventId');
requireString(event, config[type].idField);
requireString(event, 'eventType');
requireString(event, 'status');
requireString(event, 'title');
requireString(event, 'recordedBy');
if (!['qarga-coordinator', 'project-owner'].includes(event.recordedBy)) fail('recordedBy must be qarga-coordinator or project-owner');
if (!event[config[type].idField].startsWith(config[type].prefix)) fail(`${config[type].idField} must start with ${config[type].prefix}`);
if (event.sensitiveDataIncluded !== false) fail('sensitiveDataIncluded must be explicitly false');

const ledgerPath = path.join(root, config[type].ledger);
fs.mkdirSync(path.dirname(ledgerPath), { recursive: true });
const existing = parseLedger(ledgerPath);
if (existing.some((item) => item.eventId === event.eventId)) fail(`duplicate eventId: ${event.eventId}`);
const entityId = event[config[type].idField];
const prior = existing.filter((item) => item[config[type].idField] === entityId);
const latest = prior.length ? prior[prior.length - 1] : null;
if (prior.length && event.eventType === 'created') fail(`${entityId} already exists; append a lifecycle event instead of a second created event`);

if (type === 'decision') {
  const statuses = new Set(['proposed', 'approved', 'rejected', 'superseded', 'retired']);
  const eventTypes = new Set(['created', 'reviewed', 'approved', 'rejected', 'superseded', 'retired']);
  if (!statuses.has(event.status)) fail(`invalid decision status: ${event.status}`);
  if (!eventTypes.has(event.eventType)) fail(`invalid decision eventType: ${event.eventType}`);
  requireString(event, 'context');
  requireArray(event, 'options', 1);
  requireArray(event, 'evidence', 1);
  requireArray(event, 'affectedAreas', 1);
  if (event.status === 'approved') {
    requireString(event, 'chosenOption');
    requireString(event, 'rationale');
    if (event.approvedBy !== 'project-owner') fail('approved decisions require approvedBy: project-owner');
    if (!event.reviewTrigger || typeof event.reviewTrigger !== 'object') fail('approved decisions require reviewTrigger');
    requireString(event.reviewTrigger, 'type');
    requireString(event.reviewTrigger, 'value');
  }
  if (['reviewed', 'superseded', 'retired'].includes(event.eventType) && !latest) fail(`${event.eventType} requires an existing decision record`);
  if (event.status === 'superseded') requireString(event, 'supersededBy');
}

if (type === 'debt') {
  const statuses = new Set(['open', 'planned', 'resolved', 'accepted-risk', 'obsolete']);
  const eventTypes = new Set(['created', 'updated', 'planned', 'resolved', 'accepted-risk', 'obsolete']);
  if (!statuses.has(event.status)) fail(`invalid technical-debt status: ${event.status}`);
  if (!eventTypes.has(event.eventType)) fail(`invalid technical-debt eventType: ${event.eventType}`);
  const severities = new Set(['low', 'medium', 'high', 'critical']);
  if (!severities.has(event.severity)) fail(`invalid severity: ${event.severity}`);
  requireString(event, 'impact');
  requireArray(event, 'evidence', 1);
  requireArray(event, 'affectedAreas', 1);
  requireString(event, 'remediation');
  requireString(event, 'ownerAgent');
  if (!event.reviewTrigger || typeof event.reviewTrigger !== 'object') fail('technical debt requires reviewTrigger');
  requireString(event.reviewTrigger, 'type');
  requireString(event.reviewTrigger, 'value');
  if (['updated', 'planned', 'resolved', 'accepted-risk', 'obsolete'].includes(event.eventType) && !latest) fail(`${event.eventType} requires an existing technical-debt record`);
  if (event.status === 'resolved') requireArray(event, 'resolutionEvidence', 1);
  if (event.status === 'accepted-risk' && ['critical', 'high'].includes(event.severity) && event.approvedBy !== 'project-owner') fail('high or critical accepted-risk debt requires approvedBy: project-owner');
}

if (type === 'experiment') {
  const statuses = new Set(['draft', 'approved', 'running', 'paused', 'completed', 'cancelled']);
  const eventTypes = new Set(['created', 'approved', 'started', 'paused', 'completed', 'cancelled', 'updated']);
  if (!statuses.has(event.status)) fail(`invalid experiment status: ${event.status}`);
  if (!eventTypes.has(event.eventType)) fail(`invalid experiment eventType: ${event.eventType}`);
  requireString(event, 'hypothesis');
  requireString(event, 'primaryMetric');
  requireString(event, 'metricSource');
  requireArray(event, 'guardrailMetrics');
  requireString(event, 'audience');
  requireString(event, 'stopRule');
  requireString(event, 'decisionRule');
  requireString(event, 'ownerAgent');
  if (['approved', 'running'].includes(event.status) && event.approvedBy !== 'project-owner') fail(`${event.status} experiments require approvedBy: project-owner`);
  if (['approved', 'running', 'paused'].includes(event.status)) {
    if (!event.reviewTrigger || typeof event.reviewTrigger !== 'object') fail(`${event.status} experiments require reviewTrigger`);
    requireString(event.reviewTrigger, 'type');
    requireString(event.reviewTrigger, 'value');
  }
  if (event.status === 'running' && (!latest || !['approved', 'paused', 'running'].includes(latest.status))) fail('a running experiment requires an existing approved or paused experiment state');
  if (event.status === 'completed' && (!latest || !['running', 'paused'].includes(latest.status))) fail('a completed experiment requires an existing running or paused experiment state');
  if (['paused', 'cancelled'].includes(event.status) && !latest) fail(`${event.status} requires an existing experiment record`);
  if (event.status === 'completed') {
    requireArray(event, 'evidence', 1);
    const conclusions = new Set(['keep', 'iterate', 'stop', 'inconclusive']);
    if (!conclusions.has(event.conclusion)) fail('completed experiments require conclusion: keep, iterate, stop, or inconclusive');
  }
  if (event.baseline !== undefined && typeof event.baseline !== 'object') fail('baseline must be an object when provided');
  if (event.baseline?.value !== undefined && event.baseline?.value !== null && !event.baseline?.source) fail('a measured baseline requires baseline.source');
}

const now = new Date().toISOString();
const record = { ...event, recordedAt: now };
fs.appendFileSync(ledgerPath, `${JSON.stringify(record)}\n`);
console.log(`Recorded ${type} event ${event.eventId} for ${entityId}.`);
