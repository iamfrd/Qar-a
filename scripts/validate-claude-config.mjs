import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const errors = [];
const warnings = [];
const join = (relativePath) => path.join(root, relativePath);
const exists = (relativePath) => fs.existsSync(join(relativePath));
const read = (relativePath) => fs.readFileSync(join(relativePath), 'utf8');

function walk(relativePath, predicate) {
  const base = join(relativePath);
  if (!fs.existsSync(base)) return [];
  const output = [];
  for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
    const child = path.join(relativePath, entry.name);
    if (entry.isDirectory()) output.push(...walk(child, predicate));
    else if (predicate(child)) output.push(child);
  }
  return output;
}

function parseJson(relativePath, label) {
  try {
    return JSON.parse(read(relativePath));
  } catch (error) {
    errors.push(`${label} is invalid JSON: ${error.message}`);
    return null;
  }
}

function frontmatter(relativePath) {
  const text = read(relativePath);
  if (!text.startsWith('---\n')) {
    errors.push(`${relativePath}: YAML frontmatter is missing`);
    return { meta: {}, body: text };
  }
  const end = text.indexOf('\n---\n', 4);
  if (end < 0) {
    errors.push(`${relativePath}: YAML frontmatter is not closed`);
    return { meta: {}, body: text };
  }
  const meta = {};
  for (const line of text.slice(4, end).split('\n')) {
    if (!line.trim() || /^\s/.test(line)) continue;
    const index = line.indexOf(':');
    if (index > 0) meta[line.slice(0, index).trim()] = line.slice(index + 1).trim();
  }
  const body = text.slice(end + 5).trim();
  if (!body) errors.push(`${relativePath}: prompt body is empty`);
  return { meta, body };
}

function checkNodeSyntax(relativePath) {
  if (!exists(relativePath)) {
    errors.push(`${relativePath} is missing`);
    return;
  }
  const checked = spawnSync(process.execPath, ['--check', join(relativePath)], { encoding: 'utf8' });
  if (checked.status !== 0) errors.push(`${relativePath} has a syntax error: ${checked.stderr.trim()}`);
}

function assertEnglishInternalFiles() {
  const roots = ['CLAUDE.md', '.claude', 'docs', 'scripts', 'automation', 'tests', '.qarga-seo', 'tools'];
  const textExtensions = new Set(['.md', '.json', '.jsonl', '.mjs', '.js', '.yml', '.yaml', '.txt', '.html', '.css']);
  const files = [];
  for (const relativeRoot of roots) {
    if (!exists(relativeRoot)) continue;
    if (fs.statSync(join(relativeRoot)).isFile()) files.push(relativeRoot);
    else files.push(...walk(relativeRoot, (item) => textExtensions.has(path.extname(item))));
  }
  const nonEnglishCharacters = /[\u018F\u0259\u011E\u011F\u0130\u0131\u00D6\u00F6\u015E\u015F\u00C7\u00E7\u00DC\u00FC]/;
  const permittedNames = /Qarğa|QARGA|Qarga|Lələk/g;
  for (const relativePath of files) {
    const normalized = read(relativePath).replace(permittedNames, 'ProductName');
    if (nonEnglishCharacters.test(normalized)) {
      errors.push(`${relativePath}: contains Azerbaijani-specific characters outside approved product names; internal system files must be English`);
    }
  }
}

if (!exists('CLAUDE.md')) errors.push('CLAUDE.md is missing');
if (!exists('.claude/capability-registry.json')) errors.push('.claude/capability-registry.json is missing');
if (!exists('.claude/settings.json')) errors.push('.claude/settings.json is missing');

const registry = exists('.claude/capability-registry.json')
  ? parseJson('.claude/capability-registry.json', 'capability registry')
  : null;
const settings = exists('.claude/settings.json')
  ? parseJson('.claude/settings.json', 'Claude settings')
  : null;
const performancePolicy = exists('.claude/performance/policy.json')
  ? parseJson('.claude/performance/policy.json', 'performance policy')
  : null;
const performanceScorecards = exists('.claude/performance/scorecards.json')
  ? parseJson('.claude/performance/scorecards.json', 'performance scorecards')
  : null;
const learningPolicy = exists('.claude/learning/policy.json')
  ? parseJson('.claude/learning/policy.json', 'learning policy')
  : null;
const projectMemoryPolicy = exists('.claude/project-memory/policy.json')
  ? parseJson('.claude/project-memory/policy.json', 'project memory policy')
  : null;
const projectMemoryReview = exists('.claude/project-memory/review.json')
  ? parseJson('.claude/project-memory/review.json', 'project memory review')
  : null;
const evalScenarios = exists('.claude/evals/coordinator-scenarios.json')
  ? parseJson('.claude/evals/coordinator-scenarios.json', 'coordinator eval scenarios')
  : null;
const evalResults = exists('.claude/evals/results.json')
  ? parseJson('.claude/evals/results.json', 'system eval results')
  : null;
const taskPolicy = exists('.claude/tasks/policy.json')
  ? parseJson('.claude/tasks/policy.json', 'task policy')
  : null;
const taskReview = exists('.claude/tasks/review.json')
  ? parseJson('.claude/tasks/review.json', 'task review')
  : null;
const evolutionPolicy = exists('.claude/evolution/policy.json')
  ? parseJson('.claude/evolution/policy.json', 'system evolution policy')
  : null;
const evolutionReview = exists('.claude/evolution/review.json')
  ? parseJson('.claude/evolution/review.json', 'system evolution review')
  : null;
const telemetryPolicy = exists('.claude/telemetry/policy.json')
  ? parseJson('.claude/telemetry/policy.json', 'telemetry policy')
  : null;
const securityPolicy = exists('.claude/security/policy.json')
  ? parseJson('.claude/security/policy.json', 'security policy')
  : null;
const workOsPolicy = exists('.claude/work-os/policy.json')
  ? parseJson('.claude/work-os/policy.json', 'Work OS policy')
  : null;
const workOsState = exists('.claude/work-os/state.json')
  ? parseJson('.claude/work-os/state.json', 'Work OS state')
  : null;
const workOsReview = exists('.claude/work-os/review.json')
  ? parseJson('.claude/work-os/review.json', 'Work OS review')
  : null;
const skillEvolutionPolicy = exists('.claude/skill-evolution/policy.json')
  ? parseJson('.claude/skill-evolution/policy.json', 'skill evolution policy')
  : null;
const skillEvolutionCandidates = exists('.claude/skill-evolution/candidates.json')
  ? parseJson('.claude/skill-evolution/candidates.json', 'skill evolution candidates')
  : null;
const skillEvolutionReview = exists('.claude/skill-evolution/review.json')
  ? parseJson('.claude/skill-evolution/review.json', 'skill evolution review')
  : null;
const capabilityBenchmarks = exists('.claude/evals/capabilities/catalog.json')
  ? parseJson('.claude/evals/capabilities/catalog.json', 'capability benchmark catalog')
  : null;

if (settings && registry) {
  if (settings.agent !== registry.defaultAgent) errors.push(`Default agent does not match the registry: ${settings.agent}`);
  if (settings?.env?.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS !== '1') errors.push('The Agent Teams feature flag is not enabled');
  if (!Array.isArray(settings?.hooks?.PreToolUse)) errors.push('The PreToolUse safety hook is missing');
  if (!Array.isArray(settings?.hooks?.SubagentStart) || !Array.isArray(settings?.hooks?.SubagentStop)) errors.push('Subagent lifecycle telemetry hooks are missing');
  const preHookCommands = (settings?.hooks?.PreToolUse ?? []).flatMap((item) => item.hooks ?? []).map((hook) => String(hook.command ?? ''));
  if (!preHookCommands.some((command) => command.includes('block-dangerous-command.mjs'))) errors.push('Dangerous-command hook is not configured');
  if (!preHookCommands.some((command) => command.includes('scan-staged-secrets.mjs'))) errors.push('Staged-secret hook is not configured');
  if (settings?.permissions?.disableBypassPermissionsMode !== 'disable') errors.push('Bypass-permissions mode is not disabled');
}

const agentFiles = walk('.claude/agents', (item) => item.endsWith('.md'));
const agentMeta = new Map();
for (const relativePath of agentFiles) {
  const { meta } = frontmatter(relativePath);
  const name = meta.name;
  if (!name) errors.push(`${relativePath}: agent name is missing`);
  else {
    if (!/^[a-z0-9-]+$/.test(name)) errors.push(`${relativePath}: agent name has an invalid format`);
    if (agentMeta.has(name)) errors.push(`${relativePath}: duplicate agent name ${name}`);
    agentMeta.set(name, { relativePath, meta });
  }
  if (!meta.description) errors.push(`${relativePath}: agent description is missing`);
  if (!meta.tools) errors.push(`${relativePath}: agent tools are missing`);
}

const skillFiles = walk('.claude/skills', (item) => item.endsWith('SKILL.md'));
const skillNames = new Set();
for (const relativePath of skillFiles) {
  const { meta } = frontmatter(relativePath);
  if (!meta.name) errors.push(`${relativePath}: skill name is missing`);
  else {
    if (skillNames.has(meta.name)) errors.push(`${relativePath}: duplicate skill name ${meta.name}`);
    skillNames.add(meta.name);
  }
  if (!meta.description) errors.push(`${relativePath}: skill description is missing`);
}

const commandFiles = walk('.claude/commands', (item) => item.endsWith('.md'));
const commandNames = new Set();
for (const relativePath of commandFiles) {
  const { meta } = frontmatter(relativePath);
  if (!meta.description) errors.push(`${relativePath}: command description is missing`);
  const name = path.basename(relativePath, '.md');
  if (commandNames.has(name)) errors.push(`${relativePath}: duplicate command name ${name}`);
  commandNames.add(name);
}

if (registry) {
  const registeredAgents = new Map(registry.agents.map((agent) => [agent.name, agent]));
  for (const [name] of registeredAgents) if (!agentMeta.has(name)) errors.push(`Registered active agent file is missing: ${name}`);
  for (const [name] of agentMeta) if (!registeredAgents.has(name)) errors.push(`Agent is not registered: ${name}`);

  const registeredSkills = new Set(registry.skills.map((skill) => skill.name));
  for (const name of registeredSkills) if (!skillNames.has(name)) errors.push(`Registered skill file is missing: ${name}`);
  for (const name of skillNames) if (!registeredSkills.has(name)) errors.push(`Skill is not registered: ${name}`);

  const registeredCommands = new Set(registry.commands.map((command) => command.name));
  for (const name of registeredCommands) if (!commandNames.has(name)) errors.push(`Registered command file is missing: ${name}`);
  for (const name of commandNames) if (!registeredCommands.has(name)) errors.push(`Command is not registered: ${name}`);

  for (const agent of registry.agents) {
    for (const skill of agent.skills ?? []) {
      if (!registeredSkills.has(skill)) errors.push(`${agent.name}: registry references unknown skill ${skill}`);
    }
    const fileMeta = agentMeta.get(agent.name)?.meta;
    const promptSkills = new Set((fileMeta?.skills ?? '').split(',').map((item) => item.trim()).filter(Boolean));
    for (const skill of agent.skills ?? []) {
      if (!promptSkills.has(skill)) errors.push(`${agent.name}: frontmatter does not preload registered skill ${skill}`);
    }
    for (const skill of promptSkills) {
      if (!(agent.skills ?? []).includes(skill)) errors.push(`${agent.name}: frontmatter skill is not registered for this agent: ${skill}`);
    }
    if (!promptSkills.has('qarga-performance-governance')) errors.push(`${agent.name}: qarga-performance-governance is not preloaded`);
    if (!promptSkills.has('qarga-controlled-learning')) errors.push(`${agent.name}: qarga-controlled-learning is not preloaded`);
    if (!promptSkills.has('qarga-project-memory-governance')) errors.push(`${agent.name}: qarga-project-memory-governance is not preloaded`);
    if (!promptSkills.has('qarga-work-os')) errors.push(`${agent.name}: qarga-work-os is not preloaded`);
  }

  const coordinator = agentMeta.get(registry.defaultAgent);
  if (!coordinator) errors.push('Coordinator agent file is missing');
  else {
    const match = coordinator.meta.tools?.match(/Agent\(([^)]*)\)/);
    const allowed = new Set(match ? match[1].split(',').map((item) => item.trim()).filter(Boolean) : []);
    const expected = new Set(registry.agents.map((agent) => agent.name).filter((name) => name !== registry.defaultAgent));
    for (const name of expected) if (!allowed.has(name)) errors.push(`Coordinator Agent allowlist is missing: ${name}`);
    for (const name of allowed) if (!expected.has(name)) errors.push(`Coordinator Agent allowlist contains an unregistered agent: ${name}`);
  }

  if (!registry?.governance?.newAgentPolicy?.toLowerCase().includes('approval')) warnings.push('The new-agent approval policy is not explicit');
  if (!Array.isArray(registry.futureRoles) || registry.futureRoles.length === 0) warnings.push('The future-role watchlist is empty');
}

for (const requiredPath of [
  '.claude/performance/policy.json',
  '.claude/performance/scorecards.json',
  '.claude/performance/ledger.jsonl',
  '.claude/learning/policy.json',
  '.claude/learning/observations.jsonl',
  '.claude/learning/review.json',
  '.claude/learning/proposals.json',
  '.claude/project-memory/policy.json',
  '.claude/project-memory/decisions.jsonl',
  '.claude/project-memory/technical-debt.jsonl',
  '.claude/project-memory/experiments.jsonl',
  '.claude/project-memory/review.json',
  '.claude/evals/coordinator-scenarios.json',
  '.claude/evals/results.json',
  'docs/AGENT-PERFORMANCE-SYSTEM.md',
  'docs/SELF-IMPROVEMENT-SYSTEM.md',
  'docs/PROJECT-MEMORY-SYSTEM.md',
  'docs/project-memory/DECISION-TEMPLATE.json',
  'docs/project-memory/TECHNICAL-DEBT-TEMPLATE.json',
  'docs/project-memory/EXPERIMENT-TEMPLATE.json',
  'docs/SYSTEM-EVALUATION.md',
  'docs/AUTONOMY-ROADMAP.md',
  'docs/AGENT-REGISTRY.md',
  'docs/TEAM-GROWTH-POLICY.md',
  '.claude/tasks/policy.json',
  '.claude/tasks/contracts.jsonl',
  '.claude/tasks/progress.jsonl',
  '.claude/tasks/review.json',
  '.claude/evolution/policy.json',
  '.claude/evolution/research.jsonl',
  '.claude/evolution/proposals.jsonl',
  '.claude/evolution/changes.jsonl',
  '.claude/evolution/reviews.jsonl',
  '.claude/evolution/pilots.jsonl',
  '.claude/evolution/review.json',
  '.claude/telemetry/policy.json',
  '.claude/telemetry/agent-events.jsonl',
  '.claude/ops/agent-ops.json',
  '.claude/ops/system-health.json',
  '.claude/security/policy.json',
  '.claude/analytics/event-contract.json',
  '.claude/observability/policy.json',
  '.claude/automation/policy.json',
  '.claude/e2e/policy.json',
  '.qarga-seo/README.md',
  'tests/e2e/playwright.config.mjs',
  'tests/load/qarga-smoke.js',
  'automation/cloudflare-workers/qarga-daily-health/index.js',
  'automation/cloudflare-workers/qarga-weekly-pulse/index.js',
  'docs/automation/7X24-OPERATIONS.md',
  'docs/integrations/SENTRY.md',
  'docs/integrations/PLAYWRIGHT.md',
  'docs/integrations/SKILL-SECURITY.md',
  'docs/integrations/INTEGRATION-CATALOG.md',
  'docs/automation/SANDBOXED-WORKERS.md',
  '.claude/integrations/catalog.json',
  '.claude/automation/sandbox-policy.json',
  '.claude/performance/web-budget.json',
  '.claude/work-os/policy.json',
  '.claude/work-os/state.json',
  '.claude/work-os/events.jsonl',
  '.claude/work-os/routines.json',
  '.claude/work-os/views.json',
  '.claude/work-os/review.json',
  'docs/WORK-OS.md',
  'docs/work-os/README.md',
  'tools/work-os/index.html',
  'tools/work-os/styles.css',
  'tools/work-os/app.js',
  '.claude/skill-evolution/policy.json',
  '.claude/skill-evolution/candidates.json',
  '.claude/skill-evolution/frontier.json',
  '.claude/skill-evolution/skill-scorecards.json',
  '.claude/skill-evolution/evaluations.jsonl',
  '.claude/skill-evolution/pilots.jsonl',
  '.claude/skill-evolution/feedback-history.jsonl',
  '.claude/skill-evolution/events.jsonl',
  '.claude/skill-evolution/review.json',
  '.claude/evals/capabilities/catalog.json',
  'docs/SKILL-EVOLUTION-SYSTEM.md',
  'docs/skill-evolution/README.md'
]) {
  if (!exists(requiredPath)) errors.push(`${requiredPath} is missing`);
}

if (performancePolicy) {
  const weightTotal = Object.values(performancePolicy.qualityWeights ?? {}).reduce((sum, value) => sum + value, 0);
  if (weightTotal !== 100) errors.push(`Performance quality weights total ${weightTotal}, not 100`);
  if (performancePolicy?.taskPoints?.min !== 1 || performancePolicy?.taskPoints?.max !== 10) errors.push('Performance task-point range is not 1–10');
  if (performancePolicy?.evaluationRules?.selfEvaluationCounts !== false) errors.push('Agent self-evaluation is not blocked');
  if (performancePolicy?.evaluationRules?.negativePoints !== false) errors.push('The negative-point guardrail is missing');
  if (performancePolicy?.evaluationRules?.completionContractRequired !== true) errors.push('Performance scoring does not require a completion contract');
  if (performancePolicy?.evaluationRules?.contractMustBeClosedBeforeScoring !== true) errors.push('Performance scoring does not require contract closure');
}

if (performanceScorecards && registry) {
  const scorecardAgents = new Set(Object.keys(performanceScorecards.agents ?? {}));
  const registeredAgents = new Set(registry.agents.map((agent) => agent.name));
  for (const name of registeredAgents) if (!scorecardAgents.has(name)) errors.push(`Performance scorecard is missing: ${name}`);
  for (const name of scorecardAgents) if (!registeredAgents.has(name)) errors.push(`Performance scorecard belongs to an unregistered agent: ${name}`);
}

if (learningPolicy) {
  if (learningPolicy.repetitionThreshold !== 2) warnings.push(`Learning repetition threshold is ${learningPolicy.repetitionThreshold}, expected 2`);
  if (learningPolicy.validationWindowTasks < 3) errors.push('Learning validation window must cover at least three tasks');
  const forbidden = new Set(learningPolicy.forbiddenAutomaticActions ?? []);
  for (const phrase of ['edit agent prompts', 'change permissions or hooks', 'create or retire agents', 'promote a proposal into a permanent rule']) {
    if (!forbidden.has(phrase)) errors.push(`Learning policy does not forbid automatic action: ${phrase}`);
  }
}

if (projectMemoryPolicy) {
  if (projectMemoryPolicy?.globalRules?.appendOnly !== true) errors.push('Project memory must be append-only');
  if (projectMemoryPolicy?.globalRules?.noSecretsOrPersonalData !== true) errors.push('Project memory must forbid secrets and personal data');
  if (projectMemoryPolicy?.globalRules?.unverifiedMetricsAreForbidden !== true) errors.push('Project memory must forbid unverified metrics');
  for (const type of ['decision', 'technicalDebt', 'experiment']) {
    if (!projectMemoryPolicy?.recordTypes?.[type]?.ledger) errors.push(`Project-memory policy is missing ledger configuration for ${type}`);
  }
}
if (projectMemoryReview) {
  for (const key of ['decisions', 'technicalDebt', 'experiments', 'crossSignals']) {
    if (!projectMemoryReview[key] || typeof projectMemoryReview[key] !== 'object') errors.push(`Project-memory review is missing section: ${key}`);
  }
}

if (taskPolicy) {
  if (taskPolicy.contractRequiredForDelegatedTasks !== true) errors.push('Delegated tasks do not require completion contracts');
  if (taskPolicy?.antiSpin?.contractWeakeningForbidden !== true) errors.push('Anti-spin policy does not forbid contract weakening');
  if ((taskPolicy?.antiSpin?.consecutiveNoProgressLimit ?? 0) < 2) errors.push('Anti-spin no-progress limit is too weak');
  if (taskPolicy?.closure?.acceptedRequiresAllRequirementsVerified !== true) errors.push('Accepted task closure does not require all requirements verified');
}
if (taskReview && (!taskReview.tasks || !Array.isArray(taskReview.blocked))) errors.push('Task review structure is invalid');
if (evolutionPolicy) {
  if (evolutionPolicy?.separationOfDuties?.researcherMayImplement !== false) errors.push('System researcher is allowed to implement');
  if (evolutionPolicy?.separationOfDuties?.improverMayApproveOwnChange !== false) errors.push('System improver may approve its own change');
  if (evolutionPolicy?.separationOfDuties?.reviewerMayAuthorReviewedChange !== false) errors.push('System reviewer may author reviewed changes');
  if ((evolutionPolicy?.pilot?.defaultRelevantTasks ?? 0) < 3) errors.push('System evolution pilot is shorter than three relevant tasks');
}
if (evolutionReview) {
  for (const key of ['openResearch','awaitingApproval','awaitingReview','pilots','promotionCandidates','blocked']) if (!Array.isArray(evolutionReview[key])) errors.push(`System evolution review is missing array: ${key}`);
}
if (telemetryPolicy) {
  const forbidden = new Set(telemetryPolicy.forbiddenFields ?? []);
  for (const field of ['prompt','toolInput','toolOutput','userContent','secrets','personalData']) if (!forbidden.has(field)) errors.push(`Telemetry policy does not forbid: ${field}`);
}
if (securityPolicy) {
  if (securityPolicy.commitSecretScan !== true) errors.push('Commit secret scan is not required');
  if (securityPolicy.neverPrintDetectedSecretValue !== true) errors.push('Secret scanner may print detected values');
  if (!Array.isArray(securityPolicy.protectedBranches) || !securityPolicy.protectedBranches.includes('main')) errors.push('Main branch is not protected by security policy');
}

if (workOsPolicy) {
  if (workOsPolicy?.board?.manualDoneForbidden !== true) errors.push('Work OS must forbid manual DONE transitions');
  if (workOsPolicy?.roles?.specialistsMaySelfAssign !== false) errors.push('Work OS allows specialist self-assignment');
  if (workOsPolicy?.roles?.specialistsMayMarkOwnWorkDone !== false) errors.push('Work OS allows specialists to mark their own work done');
  if (workOsPolicy?.roles?.reviewerMustDifferFromImplementer !== true) errors.push('Work OS does not require independent reviewers');
  if (workOsPolicy?.taskModel?.subtaskRequiresCompletionContract !== true) errors.push('Work OS subtasks do not require completion contracts');
  if (workOsPolicy?.review?.performanceEvaluationCreatedAfterContractClosure !== true) errors.push('Work OS scoring is not tied to contract closure');
  if (workOsPolicy?.ui?.remoteBindingForbiddenByDefault !== true) errors.push('Work OS remote binding is not forbidden by default');
}
if (workOsState) {
  if (workOsState.schemaVersion !== 1 || !Array.isArray(workOsState.tasks)) errors.push('Work OS state structure is invalid');
}
if (workOsReview) {
  for (const key of ['blocked','stale','reviewQueue','learningCandidates']) if (!Array.isArray(workOsReview[key])) errors.push(`Work OS review is missing array: ${key}`);
}
if (registry && !registry?.automation?.workOS) errors.push('Capability registry does not expose Work OS automation metadata');

if (skillEvolutionPolicy) {
  const roles = skillEvolutionPolicy.roles ?? {};
  for (const role of ['researcher','candidateAuthor','evaluator','systemReviewer']) {
    if (!agentMeta.has(roles[role])) errors.push(`Skill-evolution role is not a registered agent: ${role}=${roles[role] ?? '<missing>'}`);
  }
  if (roles.candidateAuthor === roles.evaluator) errors.push('Skill-evolution candidate author and evaluator must differ');
  if (skillEvolutionPolicy?.benchmark?.setsMustBeDisjoint !== true) errors.push('Skill-evolution benchmark sets are not required to be disjoint');
  if (skillEvolutionPolicy?.benchmark?.holdoutExpectedAnswersHiddenFromCandidateAuthor !== true) errors.push('Skill-evolution holdout-answer protection is missing');
  if ((skillEvolutionPolicy?.benchmark?.minimumValidationCases ?? 0) < 3) errors.push('Skill-evolution validation set minimum is below three cases');
  if ((skillEvolutionPolicy?.benchmark?.minimumHoldoutCases ?? 0) < 3) errors.push('Skill-evolution holdout set minimum is below three cases');
  if (skillEvolutionPolicy?.benchmark?.criticalCaseFailureBlocksAdvance !== true) errors.push('Critical benchmark regressions do not block advancement');
  if ((skillEvolutionPolicy?.pilot?.minimumRelevantRealTasks ?? 0) < 3) errors.push('Skill-evolution real-task pilot is shorter than three tasks');
  if (skillEvolutionPolicy?.pilot?.ownerApprovalRequiredForPermanentPromotion !== true) errors.push('Permanent skill promotion does not require owner approval');
}
if (skillEvolutionCandidates && !Array.isArray(skillEvolutionCandidates.candidates)) errors.push('Skill-evolution candidates must contain a candidates array');
if (skillEvolutionReview) {
  for (const key of ['activeCandidates','blockedPromotions','staleCandidates','provenSkills','rejectedCandidates']) if (!Array.isArray(skillEvolutionReview[key])) errors.push(`Skill-evolution review is missing array: ${key}`);
}
if (capabilityBenchmarks) {
  if (!Array.isArray(capabilityBenchmarks.suites)) errors.push('Capability benchmark catalog must contain suites');
  for (const suite of capabilityBenchmarks.suites ?? []) {
    if (!suite.id || !suite.agent || !suite.categories || !suite.sets) errors.push(`Capability benchmark suite is incomplete: ${suite.id ?? '<missing>'}`);
    if (suite.agent && !agentMeta.has(suite.agent)) errors.push(`Capability benchmark references unknown agent: ${suite.agent}`);
  }
}

if (evalScenarios) {
  if (!Array.isArray(evalScenarios.scenarios) || evalScenarios.scenarios.length < 15) errors.push('At least fifteen coordinator regression scenarios are required');
  const ids = new Set();
  for (const scenario of evalScenarios.scenarios ?? []) {
    if (!scenario.id || ids.has(scenario.id)) errors.push(`Coordinator scenario ID is missing or duplicated: ${scenario.id ?? '<missing>'}`);
    ids.add(scenario.id);
    if (!scenario.prompt || !Array.isArray(scenario.expectedBehaviors) || !scenario.expectedBehaviors.length) errors.push(`${scenario.id}: expected behaviors are missing`);
    if (!Array.isArray(scenario.forbiddenBehaviors) || !scenario.forbiddenBehaviors.length) errors.push(`${scenario.id}: forbidden behaviors are missing`);
  }
}
if (evalResults && !Array.isArray(evalResults.runs)) errors.push('System evaluation results must contain a runs array');

for (const ledgerPath of ['.claude/performance/ledger.jsonl', '.claude/learning/observations.jsonl', '.claude/project-memory/decisions.jsonl', '.claude/project-memory/technical-debt.jsonl', '.claude/project-memory/experiments.jsonl', '.claude/tasks/contracts.jsonl', '.claude/tasks/progress.jsonl', '.claude/evolution/research.jsonl', '.claude/evolution/proposals.jsonl', '.claude/evolution/changes.jsonl', '.claude/evolution/reviews.jsonl', '.claude/evolution/pilots.jsonl', '.claude/telemetry/agent-events.jsonl', '.claude/work-os/events.jsonl', '.claude/skill-evolution/evaluations.jsonl', '.claude/skill-evolution/pilots.jsonl', '.claude/skill-evolution/feedback-history.jsonl', '.claude/skill-evolution/events.jsonl']) {
  if (!exists(ledgerPath)) continue;
  const lines = read(ledgerPath).split(/\r?\n/).filter(Boolean);
  for (let index = 0; index < lines.length; index += 1) {
    try { JSON.parse(lines[index]); }
    catch (error) { errors.push(`${ledgerPath} line ${index + 1} is invalid JSON: ${error.message}`); }
  }
}

for (const script of [
  'scripts/record-agent-performance.mjs',
  'scripts/record-learning-observation.mjs',
  'scripts/review-learning-signals.mjs',
  'scripts/record-project-memory.mjs',
  'scripts/review-project-memory.mjs',
  'scripts/test-claude-system.mjs',
  'scripts/record-task-event.mjs',
  'scripts/record-task-progress.mjs',
  'scripts/review-task-system.mjs',
  'scripts/record-system-evolution.mjs',
  'scripts/review-system-evolution.mjs',
  'scripts/generate-agent-ops-dashboard.mjs',
  'scripts/system-health.mjs',
  'scripts/scan-agent-config-security.mjs',
  'scripts/check-playwright-readiness.mjs',
  'scripts/check-web-performance-budget.mjs',
  'scripts/work-os-core.mjs',
  'scripts/work-os.mjs',
  'scripts/work-os-server.mjs',
  'scripts/review-work-os.mjs',
  'scripts/export-work-os-snapshot.mjs',
  'scripts/record-skill-evolution.mjs',
  'scripts/evaluate-skill-candidate.mjs',
  'scripts/review-skill-evolution.mjs',
  'scripts/audit-skill-structure.mjs',
  '.claude/hooks/block-dangerous-command.mjs',
  '.claude/hooks/scan-staged-secrets.mjs',
  '.claude/hooks/agent-lifecycle-logger.mjs'
]) checkNodeSyntax(script);

try {
  const pkg = JSON.parse(read('package.json'));
  const requiredScripts = {
    'validate:claude': 'node scripts/validate-claude-config.mjs',
    'performance:record': 'node scripts/record-agent-performance.mjs',
    'learning:record': 'node scripts/record-learning-observation.mjs',
    'learning:review': 'node scripts/review-learning-signals.mjs',
    'decision:record': 'node scripts/record-project-memory.mjs decision',
    'debt:record': 'node scripts/record-project-memory.mjs debt',
    'experiment:record': 'node scripts/record-project-memory.mjs experiment',
    'project-memory:review': 'node scripts/review-project-memory.mjs',
    'test:claude-system': 'node scripts/test-claude-system.mjs',
    'task:record': 'node scripts/record-task-event.mjs',
    'task:progress': 'node scripts/record-task-progress.mjs',
    'task:review': 'node scripts/review-task-system.mjs',
    'evolution:record': 'node scripts/record-system-evolution.mjs',
    'evolution:review': 'node scripts/review-system-evolution.mjs',
    'agent-ops:report': 'node scripts/generate-agent-ops-dashboard.mjs',
    'system:health': 'node scripts/system-health.mjs',
    'security:claude': 'node scripts/scan-agent-config-security.mjs',
    'security:secrets': 'node .claude/hooks/scan-staged-secrets.mjs --staged',
    'e2e:check': 'node scripts/check-playwright-readiness.mjs',
    'load:smoke': 'k6 run tests/load/qarga-smoke.js',
    'web:budget': 'node scripts/check-web-performance-budget.mjs',
    'work-os': 'node scripts/work-os.mjs',
    'work-os:serve': 'node scripts/work-os-server.mjs',
    'work-os:summary': 'node scripts/work-os.mjs summary',
    'work-os:validate': 'node scripts/work-os.mjs validate',
    'work-os:review': 'node scripts/review-work-os.mjs',
    'work-os:export': 'node scripts/export-work-os-snapshot.mjs',
    'skill-evolution:record': 'node scripts/record-skill-evolution.mjs',
    'skill-evolution:evaluate': 'node scripts/evaluate-skill-candidate.mjs',
    'skill-evolution:review': 'node scripts/review-skill-evolution.mjs',
    'skill:audit': 'node scripts/audit-skill-structure.mjs'
  };
  for (const [name, value] of Object.entries(requiredScripts)) {
    if (pkg?.scripts?.[name] !== value) errors.push(`package.json script is missing or different: ${name}`);
  }
} catch (error) {
  errors.push(`package.json is invalid JSON: ${error.message}`);
}

if (!exists('.github/workflows/ci.yml')) errors.push('GitHub CI workflow is missing');
else {
  const ci = read('.github/workflows/ci.yml');
  for (const command of ['npm run validate:claude', 'npm run skill:audit', 'npm run skill-evolution:review', 'npm run work-os:validate', 'npm run work-os:review', 'npm run test:claude-system', 'npm run security:claude', 'npm run system:health -- --ci', 'npm run lint', 'npm run build', 'npm test']) {
    if (!ci.includes(command)) errors.push(`GitHub CI does not run: ${command}`);
  }
}

assertEnglishInternalFiles();

for (const warning of warnings) console.warn(`WARN: ${warning}`);
for (const error of errors) console.error(`ERROR: ${error}`);

if (errors.length) {
  console.error(`\nClaude configuration validation failed: ${errors.length} error(s), ${warnings.length} warning(s).`);
  process.exit(1);
}
console.log(`Claude configuration valid: ${agentFiles.length} agents, ${skillFiles.length} skills, ${commandFiles.length} commands, ${registry?.futureRoles?.length ?? 0} future roles, ${evalScenarios?.scenarios?.length ?? 0} system scenarios, ${warnings.length} warning(s).`);
