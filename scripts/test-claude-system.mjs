import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const sourceRoot = process.cwd();
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'qarga-claude-system-v10-'));
const cleanup = () => fs.rmSync(tempRoot, { recursive: true, force: true });
const fail = (message) => { cleanup(); console.error(`Claude system self-test failed: ${message}`); process.exit(1); };

function copyOverlay() {
  for (const entry of fs.readdirSync(sourceRoot, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    fs.cpSync(path.join(sourceRoot, entry.name), path.join(tempRoot, entry.name), { recursive: true });
  }
}
function runNode(script, args = [], options = {}) {
  return spawnSync(process.execPath, [path.join(tempRoot, script), ...args], {
    cwd: tempRoot, encoding: 'utf8', input: options.input,
    env: { ...process.env, CLAUDE_PROJECT_DIR: tempRoot, CLAUDE_SESSION_ID: 'SELFTEST-SESSION' }
  });
}
const overlayPath = (relativePath) => path.join(tempRoot, relativePath);
const readOverlay = (relativePath) => fs.readFileSync(overlayPath(relativePath), 'utf8');
const readOverlayJson = (relativePath) => JSON.parse(readOverlay(relativePath));
function writeOverlay(relativePath, text) {
  fs.mkdirSync(path.dirname(overlayPath(relativePath)), { recursive: true });
  fs.writeFileSync(overlayPath(relativePath), text);
}
const writeOverlayJson = (relativePath, value) => writeOverlay(relativePath, `${JSON.stringify(value, null, 2)}\n`);

// copyOverlay duplicates the working tree, so the live Work OS board and its linked ledgers
// would otherwise decide the outcome of this fixture: create-task would continue the live
// counter instead of allocating QW-0001, add-subtask would mutate a real card, the real
// completion contract for that subtask already exists ("task already has a created contract"),
// the performance ledger already holds reviewed subtask ids, and work-os validate /
// review-work-os / export-snapshot assert across every real row.
// Seeding pristine ledgers is preferred over deriving the new task id from CLI output:
// deriving an id would fix only the id collision, while board-wide validation, review, KPI
// rollup, snapshot export, and contract/performance duplicate detection would still read live
// rows. Seeding removes the whole coupling in one place. The files are rewritten rather than
// deleted because scripts/validate-claude-config.mjs requires every one of them to exist.
function seedPristineOperationalState() {
  const epoch = '2000-01-01T00:00:00.000Z';
  const liveState = readOverlayJson('.claude/work-os/state.json');
  writeOverlayJson('.claude/work-os/state.json', { schemaVersion: liveState.schemaVersion, project: liveState.project, updatedAt: epoch, counters: { task: 0, comment: 0 }, tasks: [] });
  writeOverlay('.claude/work-os/events.jsonl', '');
  writeOverlay('.claude/tasks/contracts.jsonl', '');
  writeOverlay('.claude/tasks/progress.jsonl', '');
  writeOverlay('.claude/performance/ledger.jsonl', '');
  // Reset every scorecard to its unrated state but keep the agent keys: the config validator
  // requires exactly one scorecard per registered agent, so dropping the keys would trade the
  // live-data coupling for a "Performance scorecard is missing" failure.
  const scorecards = readOverlayJson('.claude/performance/scorecards.json');
  const pristineScorecard = () => ({ tasksEvaluated: 0, totalBasePoints: 0, totalEarnedPoints: 0, averageQuality: null, rollingQuality: null, rollingTaskIds: [], level: 'unrated', lastEvaluationAt: null, recentStrengths: [], recentImprovementAreas: [] });
  writeOverlayJson('.claude/performance/scorecards.json', { ...scorecards, updatedAt: epoch, agents: Object.fromEntries(Object.keys(scorecards.agents ?? {}).map((agent) => [agent, pristineScorecard()])) });
  // Regenerate the derived review files with the real generators so their schema stays valid.
  expectStatus(runNode('scripts/review-work-os.mjs'), 0, 'pristine Work OS review seed');
  expectStatus(runNode('scripts/review-task-system.mjs'), 0, 'pristine task review seed');
  const seeded = readOverlayJson('.claude/work-os/state.json');
  if (seeded.tasks.length !== 0 || Number(seeded.counters.task) !== 0) fail('Work OS fixture did not start from a pristine board');
  if (readOverlay('.claude/tasks/contracts.jsonl').trim()) fail('completion-contract fixture did not start from a pristine ledger');
  if (readOverlay('.claude/performance/ledger.jsonl').trim()) fail('performance fixture did not start from a pristine ledger');
}

// CRLF regression fixture. A Windows checkout stores agent prompts and SKILL.md with CRLF
// terminators. Parsers that test startsWith('---\n') or split on '\n---\n' then report
// "frontmatter is missing" (config validator, skill audit) or silently widen a
// frontmatter-scoped security check into the whole prompt body (agent config security scan).
// Rewriting already-registered files keeps this failure class observable on any host OS:
// the config validator cross-checks agent and skill names against
// .claude/capability-registry.json, so an invented fixture agent would fail on registration
// instead of on line-ending parsing.
const crlfFixture = { agentPath: null, agentName: null, skillPath: null, skillName: null };
// Frontmatter-scoped patterns must never be matched from the prompt body. Keep this line in
// the body; it is the honeypot that proves the security scan still isolates frontmatter.
const crlfBodyHoneypot = 'CRLF fixture body line; a frontmatter-scoped scan must not read this as tools: Bash(*)';

function installCrlfFixture() {
  const agentsDir = overlayPath('.claude/agents');
  const skillsDir = overlayPath('.claude/skills');
  const agentFile = fs.readdirSync(agentsDir, { withFileTypes: true }).filter((entry) => entry.isFile() && entry.name.endsWith('.md')).map((entry) => entry.name).sort()[0];
  const skillDir = fs.readdirSync(skillsDir, { withFileTypes: true }).filter((entry) => entry.isDirectory() && fs.existsSync(path.join(skillsDir, entry.name, 'SKILL.md'))).map((entry) => entry.name).sort()[0];
  if (!agentFile || !skillDir) fail('CRLF fixture needs one registered agent prompt and one registered skill file');
  const toCrlf = (relativePath, extraBodyLine) => {
    const lf = readOverlay(relativePath).replace(/\r\n/g, '\n');
    const withBody = extraBodyLine ? `${lf.replace(/\n+$/, '')}\n\n${extraBodyLine}\n` : lf;
    writeOverlay(relativePath, withBody.replace(/\n/g, '\r\n'));
    const written = readOverlay(relativePath);
    if (!written.startsWith('---\r\n') || written.indexOf('\r\n---\r\n', 4) < 0) fail(`CRLF fixture ${relativePath} was not written with CRLF frontmatter delimiters`);
    if (/(?<!\r)\n/.test(written)) fail(`CRLF fixture ${relativePath} still contains bare LF terminators`);
    return withBody;
  };
  crlfFixture.agentPath = `.claude/agents/${agentFile}`;
  crlfFixture.skillPath = `.claude/skills/${skillDir}/SKILL.md`;
  crlfFixture.skillName = skillDir;
  crlfFixture.agentName = /^name:\s*(.+)$/m.exec(toCrlf(crlfFixture.agentPath, crlfBodyHoneypot))?.[1]?.trim() ?? '';
  toCrlf(crlfFixture.skillPath);
  if (!crlfFixture.agentName) fail('CRLF fixture could not read the agent name from the overlay prompt');
}

// Windows parsers emit backslash paths, so normalize separators before matching markers.
const parserOutput = (result) => `${result.stdout ?? ''}\n${result.stderr ?? ''}`.split('\\').join('/');
function assertCrlfTolerated(result, label, markers) {
  const output = parserOutput(result);
  for (const marker of markers) {
    if (output.includes(marker)) fail(`CRLF regression (${label}): "${marker}" — the parser rejected CRLF line endings that a Windows checkout produces`);
  }
}
function run(cmd, args = []) { return spawnSync(cmd, args, { cwd: tempRoot, encoding: 'utf8' }); }
function expectStatus(result, expected, label) {
  if (result.status !== expected) fail(`${label}: expected exit ${expected}, got ${result.status}. stdout=${result.stdout?.trim()} stderr=${result.stderr?.trim()}`);
}
function writeJson(name, value) { fs.writeFileSync(path.join(tempRoot, name), `${JSON.stringify(value, null, 2)}\n`); }
function taskEvent(value, filename = 'task-event.json') { writeJson(filename, value); const r = runNode('scripts/record-task-event.mjs', [filename]); expectStatus(r, 0, `${value.eventType} task event`); }

try {
  copyOverlay();
  // The overlay is a copy of the live working tree, so the fixture must start from pristine
  // ledgers and must carry a CRLF checkout of its own; neither can be assumed from the host.
  seedPristineOperationalState();
  installCrlfFixture();
  run('git', ['init', '-b', 'main']);
  run('git', ['config', 'user.email', 'selftest@example.invalid']);
  run('git', ['config', 'user.name', 'Qarga Self Test']);

  // Completion contract -> evidence -> accepted closure.
  taskEvent({ eventId:'SELFTEST-TASK-CREATE-001', taskId:'SELFTEST-TASK-001', eventType:'created', title:'Deterministic agent-system self-test', lane:'standard', basePoints:5, ownerAgent:'qarga-backend-engineer', reviewerAgent:'qarga-qa-auditor', allowedFiles:['scripts/**'], forbiddenFiles:['.env*'], approvalGates:[], requirements:[{id:'REQ-1',text:'Fixture works',evidence:'passing deterministic output'},{id:'REQ-2',text:'Independent verification exists',evidence:'reviewer evidence'}], sensitiveDataIncluded:false });
  taskEvent({ eventId:'SELFTEST-TASK-EVIDENCE-001', taskId:'SELFTEST-TASK-001', eventType:'evidence', requirementId:'REQ-1', verifiedBy:'qarga-qa-auditor', evidence:['self-test fixture passed'], sensitiveDataIncluded:false }, 'task-evidence-1.json');
  taskEvent({ eventId:'SELFTEST-TASK-EVIDENCE-002', taskId:'SELFTEST-TASK-001', eventType:'evidence', requirementId:'REQ-2', verifiedBy:'qarga-qa-auditor', evidence:['independent reviewer fixture'], sensitiveDataIncluded:false }, 'task-evidence-2.json');
  taskEvent({ eventId:'SELFTEST-TASK-CLOSE-001', taskId:'SELFTEST-TASK-001', eventType:'closed', status:'accepted', closedBy:'qarga-qa-auditor', sensitiveDataIncluded:false }, 'task-close.json');
  let result = runNode('scripts/review-task-system.mjs'); expectStatus(result,0,'task system review');
  const taskReview = JSON.parse(fs.readFileSync(path.join(tempRoot,'.claude/tasks/review.json'),'utf8'));
  if (taskReview.tasks['SELFTEST-TASK-001']?.closed?.status !== 'accepted') fail('accepted completion contract was not summarized');

  const evaluation={ taskId:'SELFTEST-TASK-001', taskTitle:'Deterministic agent-system self-test', agent:'qarga-backend-engineer', reviewer:'qarga-coordinator', basePoints:5, status:'accepted', dimensions:{correctness:95,verification:100,scopeAdherence:95,safety:100,collaboration:90,clarity:90}, evidence:['self-test fixture','independent reviewer fixture'], strengths:['Deterministic fixture passed'], improvementAreas:[], notes:'Temporary self-test data only.' };
  writeJson('evaluation.json',evaluation); result=runNode('scripts/record-agent-performance.mjs',['evaluation.json']);expectStatus(result,0,'contract-backed performance evaluation');
  result=runNode('scripts/record-agent-performance.mjs',['evaluation.json']);if(result.status===0)fail('duplicate performance evaluation was accepted');

  // Self-evaluation remains forbidden even with a valid contract.
  taskEvent({ eventId:'SELFTEST-TASK-CREATE-002', taskId:'SELFTEST-TASK-002', eventType:'created', title:'Self-evaluation guard', lane:'fast', basePoints:2, ownerAgent:'qarga-backend-engineer', reviewerAgent:'qarga-qa-auditor', allowedFiles:['scripts/**'], forbiddenFiles:[], approvalGates:[], requirements:[{id:'REQ-1',text:'Guard fixture',evidence:'review evidence'}], sensitiveDataIncluded:false }, 'task2-create.json');
  taskEvent({ eventId:'SELFTEST-TASK-EVIDENCE-003', taskId:'SELFTEST-TASK-002', eventType:'evidence', requirementId:'REQ-1', verifiedBy:'qarga-qa-auditor', evidence:['guard evidence'], sensitiveDataIncluded:false }, 'task2-evidence.json');
  taskEvent({ eventId:'SELFTEST-TASK-CLOSE-002', taskId:'SELFTEST-TASK-002', eventType:'closed', status:'accepted', closedBy:'qarga-qa-auditor', sensitiveDataIncluded:false }, 'task2-close.json');
  const selfEvaluation={...evaluation,taskId:'SELFTEST-TASK-002',taskTitle:'Self evaluation guard',basePoints:2,reviewer:'qarga-backend-engineer'};writeJson('self-evaluation.json',selfEvaluation);result=runNode('scripts/record-agent-performance.mjs',['self-evaluation.json']);if(result.status===0)fail('agent self-evaluation was accepted');

  // Anti-spin detects repeated no-progress approach.
  taskEvent({ eventId:'SELFTEST-TASK-CREATE-003', taskId:'SELFTEST-TASK-003', eventType:'created', title:'Anti-spin fixture', lane:'fast', basePoints:3, ownerAgent:'qarga-frontend-engineer', reviewerAgent:'qarga-qa-auditor', allowedFiles:['src/**'], forbiddenFiles:[], approvalGates:[], requirements:[{id:'REQ-1',text:'Converge',evidence:'verified result'}], sensitiveDataIncluded:false }, 'task3-create.json');
  for (const [iteration,eventId] of [[1,'SELFTEST-PROGRESS-1'],[2,'SELFTEST-PROGRESS-2']]) { writeJson(`progress-${iteration}.json`,{eventId,taskId:'SELFTEST-TASK-003',agent:'qarga-frontend-engineer',iteration,approachKey:'same-broken-approach',summary:'No measurable progress in fixture.',measurableProgress:false,evidence:[],blockers:['fixture'],sensitiveDataIncluded:false});result=runNode('scripts/record-task-progress.mjs',[`progress-${iteration}.json`]);expectStatus(result,0,`anti-spin progress ${iteration}`); }
  result=runNode('scripts/review-task-system.mjs');expectStatus(result,0,'anti-spin review');
  const antiReview=JSON.parse(fs.readFileSync(path.join(tempRoot,'.claude/tasks/review.json'),'utf8'));if(!antiReview.blocked.some((x)=>x.taskId==='SELFTEST-TASK-003'))fail('anti-spin repeated no-progress task was not blocked');

  // Controlled learning aggregates repeated evidence.
  const observationBase={recordedBy:'qarga-coordinator',agent:'qarga-backend-engineer',category:'verification-gap',capability:'authorization-testing',summary:'The same authorization test requirement was missed in a completed task.',evidence:[{type:'test-output',reference:'temporary self-test evidence'}],impact:'A repeated omission could allow an authorization regression.',suggestedAction:'Evaluate a focused authorization checklist.',sensitiveDataIncluded:false};
  for(const [n,taskId] of [[1,'SELFTEST-TASK-101'],[2,'SELFTEST-TASK-102']]){writeJson(`observation-${n}.json`,{...observationBase,observationId:`SELFTEST-OBS-00${n}`,taskId});result=runNode('scripts/record-learning-observation.mjs',[`observation-${n}.json`]);expectStatus(result,0,`learning observation ${n}`)}
  result=runNode('scripts/review-learning-signals.mjs');expectStatus(result,0,'learning signal review');const learning=JSON.parse(fs.readFileSync(path.join(tempRoot,'.claude/learning/review.json'),'utf8'));const signal=learning.signals.find((x)=>x.capability==='authorization-testing');if(!signal||signal.confidence!=='repeated')fail('repeated learning signal was not aggregated');

  // Durable project memory keeps owner approval and release blockers.
  const decision={eventId:'SELFTEST-DEC-EVT-001',decisionId:'DEC-SELFTEST-001',eventType:'approved',status:'approved',title:'Self-test project decision',recordedBy:'qarga-coordinator',context:'Validate durable decision recording.',options:[{name:'Option A',benefits:['deterministic'],costs:[],risks:[]}],chosenOption:'Option A',rationale:'Temporary self-test.',evidence:['self-test evidence'],assumptions:[],unknowns:[],affectedAreas:['agent-system'],relatedTaskIds:['SELFTEST-TASK-001'],approvedBy:'project-owner',reviewTrigger:{type:'date',value:'2000-01-01T00:00:00.000Z'},sensitiveDataIncluded:false};writeJson('decision.json',decision);result=runNode('scripts/record-project-memory.mjs',['decision','decision.json']);expectStatus(result,0,'approved decision');
  writeJson('bad-decision.json',{...decision,eventId:'SELFTEST-DEC-EVT-002',decisionId:'DEC-SELFTEST-002',approvedBy:null});result=runNode('scripts/record-project-memory.mjs',['decision','bad-decision.json']);if(result.status===0)fail('unapproved approved-decision was accepted');
  const debt={eventId:'SELFTEST-DEBT-EVT-001',debtId:'DEBT-SELFTEST-001',eventType:'created',status:'open',title:'Self-test critical debt',recordedBy:'qarga-coordinator',category:'authorization-testing',severity:'critical',impact:'Temporary release blocker.',evidence:['self-test evidence'],affectedAreas:['backend'],rootCause:'fixture',remediation:'remove fixture',ownerAgent:'qarga-backend-engineer',relatedTaskIds:['SELFTEST-TASK-001'],reviewTrigger:{type:'date',value:'2000-01-01T00:00:00.000Z'},resolutionEvidence:[],sensitiveDataIncluded:false};writeJson('debt.json',debt);result=runNode('scripts/record-project-memory.mjs',['debt','debt.json']);expectStatus(result,0,'critical debt');result=runNode('scripts/review-project-memory.mjs');expectStatus(result,0,'project memory review');const memory=JSON.parse(fs.readFileSync(path.join(tempRoot,'.claude/project-memory/review.json'),'utf8'));if(!memory.crossSignals.releaseBlockers.some((x)=>x.type==='critical-technical-debt'))fail('critical debt release blocker was not surfaced');

  // System evolution enforces separation, approval, review, and three-task pilot.
  const research={eventId:'SELFTEST-EVO-R-1',researchId:'EVO-R-001',researchedBy:'qarga-system-researcher',problem:'Repeated authorization-test gap.',evidence:['SELFTEST-OBS-001','SELFTEST-OBS-002'],rootCauseHypotheses:['Missing focused checklist'],options:['documentation','skill'],recommendation:'Add a focused skill only if pilot evidence supports it.',rollback:'Remove the candidate skill and restore registry.',pilotPlan:'Validate on three relevant tasks.',sensitiveDataIncluded:false};writeJson('evo-research.json',research);result=runNode('scripts/record-system-evolution.mjs',['research','evo-research.json']);expectStatus(result,0,'system research');
  const proposal={eventId:'SELFTEST-EVO-P-1',proposalId:'EVO-P-001',researchId:'EVO-R-001',targetType:'skill',changeSummary:'Add a focused authorization checklist skill.',status:'approved',approvedBy:'project-owner',validationPlan:['validator','security scan','three relevant tasks'],sensitiveDataIncluded:false};writeJson('evo-proposal.json',proposal);result=runNode('scripts/record-system-evolution.mjs',['proposal','evo-proposal.json']);expectStatus(result,0,'approved system proposal');writeJson('evo-bad-proposal.json',{...proposal,eventId:'SELFTEST-EVO-P-2',proposalId:'EVO-P-002',approvedBy:null});result=runNode('scripts/record-system-evolution.mjs',['proposal','evo-bad-proposal.json']);if(result.status===0)fail('system proposal without owner approval was accepted');
  const change={eventId:'SELFTEST-EVO-C-1',changeId:'EVO-C-001',proposalId:'EVO-P-001',implementedBy:'qarga-system-improver',filesChanged:['.claude/skills/example/SKILL.md'],rollback:'Remove the example skill.',sensitiveDataIncluded:false};writeJson('evo-change.json',change);result=runNode('scripts/record-system-evolution.mjs',['change','evo-change.json']);expectStatus(result,0,'system change');
  const evoReview={eventId:'SELFTEST-EVO-V-1',reviewId:'EVO-V-001',changeId:'EVO-C-001',reviewedBy:'qarga-system-reviewer',verdict:'APPROVE_FOR_PILOT',evidence:['validator pass','security pass'],sensitiveDataIncluded:false};writeJson('evo-review.json',evoReview);result=runNode('scripts/record-system-evolution.mjs',['review','evo-review.json']);expectStatus(result,0,'system change review');
  const shortPilot={eventId:'SELFTEST-EVO-PL-1',pilotId:'EVO-PL-001',proposalId:'EVO-P-001',changeId:'EVO-C-001',outcome:'KEEP',taskIds:['T1','T2'],evidence:['two tasks'],approvedBy:'project-owner',sensitiveDataIncluded:false};writeJson('evo-short-pilot.json',shortPilot);result=runNode('scripts/record-system-evolution.mjs',['pilot','evo-short-pilot.json']);if(result.status===0)fail('short permanent pilot was accepted');const goodPilot={...shortPilot,eventId:'SELFTEST-EVO-PL-2',pilotId:'EVO-PL-002',taskIds:['T1','T2','T3'],evidence:['three-task pilot evidence']};writeJson('evo-good-pilot.json',goodPilot);result=runNode('scripts/record-system-evolution.mjs',['pilot','evo-good-pilot.json']);expectStatus(result,0,'three-task system pilot');result=runNode('scripts/review-system-evolution.mjs');expectStatus(result,0,'system evolution review');

  // Skill evolution enforces existing-skill research, independent holdout evaluation, pilot evidence, and owner-controlled promotion.
  const skillResearch={researchId:'SELFTEST-SKR-001',workTaskId:'SELFTEST-WORK-SKILL',researchedBy:'qarga-skill-researcher',targetAgent:'qarga-backend-engineer',signals:['SELFTEST-OBS-001','SELFTEST-OBS-002'],failurePattern:'Repeated authorization-testing omission.',existingSkillsInspected:['qarga-api-contract-design','qarga-test-first-development'],previousAttemptsInspected:[],rootCauseHypotheses:['Existing testing guidance does not foreground negative ownership cases.'],options:['Edit qarga-test-first-development','Create a narrow duplicate skill'],recommendedAction:'EDIT_EXISTING_SKILL',targetSkill:'qarga-test-first-development',proposedCapability:'Require reusable negative authorization cases for owned-resource mutations.',nonGoals:['Do not encode one route or file path.'],benchmarkCategories:['authorization','regression'],regressionRisks:['Excessive testing overhead on unrelated changes'],validationPlan:'Compare baseline and candidate on disjoint validation and hidden-holdout authorization cases.',rollback:'Restore the prior skill content.',ownerApprovalRequired:false};
  writeJson('skill-research.json',skillResearch); result=runNode('scripts/record-skill-evolution.mjs',['research','skill-research.json']);expectStatus(result,0,'skill research record');
  writeJson('skill-research-invalid.json',{...skillResearch,researchId:'SELFTEST-SKR-002',existingSkillsInspected:[]});result=runNode('scripts/record-skill-evolution.mjs',['research','skill-research-invalid.json']);if(result.status===0)fail('skill research without existing-skill inventory was accepted');
  const skillCandidate={candidateId:'SELFTEST-SKC-001',researchId:'SELFTEST-SKR-001',workTaskId:'SELFTEST-WORK-SKILL',targetType:'skill',targetName:'qarga-test-first-development',action:'edit',authoredBy:'qarga-system-improver',baselineVersion:'baseline',candidateVersion:'candidate',filesChanged:['.claude/skills/qarga-test-first-development/SKILL.md'],status:'CANDIDATE',rollback:'Restore baseline skill.'};
  writeJson('skill-candidate.json',skillCandidate);result=runNode('scripts/record-skill-evolution.mjs',['candidate','skill-candidate.json']);expectStatus(result,0,'skill candidate record');
  const skillEval={evaluationId:'SELFTEST-SKE-001',candidateId:'SELFTEST-SKC-001',workTaskId:'SELFTEST-WORK-SKILL',evaluatedBy:'qarga-evaluation-engineer',candidateAuthor:'qarga-system-improver',suiteId:'backend-core-safety-v1',diagnosticCaseIds:['D1'],validationCaseIds:['V1','V2','V3'],holdoutCaseIds:['H1','H2','H3'],results:[
    {caseId:'V1',set:'validation',category:'authorization',baselineScore:70,candidateScore:90,critical:true,baselineCriticalPass:true,candidateCriticalPass:true},
    {caseId:'V2',set:'validation',category:'regression',baselineScore:82,candidateScore:88,critical:false,baselineCriticalPass:true,candidateCriticalPass:true},
    {caseId:'V3',set:'validation',category:'authorization',baselineScore:72,candidateScore:91,critical:true,baselineCriticalPass:true,candidateCriticalPass:true},
    {caseId:'H1',set:'holdout',category:'authorization',baselineScore:71,candidateScore:89,critical:true,baselineCriticalPass:true,candidateCriticalPass:true},
    {caseId:'H2',set:'holdout',category:'regression',baselineScore:84,candidateScore:86,critical:false,baselineCriticalPass:true,candidateCriticalPass:true},
    {caseId:'H3',set:'holdout',category:'authorization',baselineScore:73,candidateScore:90,critical:true,baselineCriticalPass:true,candidateCriticalPass:true}
  ],cost:{baselineUsd:1.2,candidateUsd:1.25},durationMs:{baseline:1000,candidate:1050},notes:['deterministic fixture']};
  writeJson('skill-eval.json',skillEval);result=runNode('scripts/evaluate-skill-candidate.mjs',['skill-eval.json']);expectStatus(result,0,'skill candidate scoring');const scoredSkillEval=JSON.parse(fs.readFileSync(path.join(tempRoot,'skill-eval.scored.json'),'utf8'));if(scoredSkillEval.recommendation!=='ADVANCE_TO_PILOT')fail('improving skill candidate did not advance to pilot');writeJson('skill-eval-record.json',scoredSkillEval);result=runNode('scripts/record-skill-evolution.mjs',['evaluation','skill-eval-record.json']);expectStatus(result,0,'skill evaluation record');
  writeJson('skill-eval-overlap.json',{...skillEval,evaluationId:'SELFTEST-SKE-OVERLAP',holdoutCaseIds:['V1','H2','H3']});result=runNode('scripts/evaluate-skill-candidate.mjs',['skill-eval-overlap.json']);if(result.status===0)fail('overlapping benchmark sets were accepted');
  writeJson('skill-eval-self.json',{...skillEval,evaluationId:'SELFTEST-SKE-SELF',evaluatedBy:'qarga-system-improver'});result=runNode('scripts/evaluate-skill-candidate.mjs',['skill-eval-self.json']);if(result.status===0)fail('candidate author was allowed to evaluate own candidate');
  const pilot={pilotId:'SELFTEST-SKP-001',candidateId:'SELFTEST-SKC-001',outcome:'KEEP',reviewedBy:'qarga-system-reviewer',taskIds:['REAL-1','REAL-2','REAL-3'],evidence:['Three relevant tasks passed independent review.']};writeJson('skill-pilot.json',pilot);result=runNode('scripts/record-skill-evolution.mjs',['pilot','skill-pilot.json']);expectStatus(result,0,'skill real-task pilot');
  writeJson('skill-promotion-bad.json',{candidateId:'SELFTEST-SKC-001',outcome:'PROVEN',approvedBy:'qarga-coordinator'});result=runNode('scripts/record-skill-evolution.mjs',['promotion','skill-promotion-bad.json']);if(result.status===0)fail('skill was permanently promoted without project-owner approval');
  writeJson('skill-promotion.json',{candidateId:'SELFTEST-SKC-001',outcome:'PROVEN',approvedBy:'project-owner'});result=runNode('scripts/record-skill-evolution.mjs',['promotion','skill-promotion.json']);expectStatus(result,0,'skill permanent promotion');
  result=runNode('scripts/review-skill-evolution.mjs');expectStatus(result,0,'skill evolution review');result=runNode('scripts/audit-skill-structure.mjs');assertCrlfTolerated(result,'skill structure audit',['missing frontmatter','unclosed frontmatter']);expectStatus(result,0,'skill structure audit');

  // Lifecycle logger stores metadata only.
  result=runNode('.claude/hooks/agent-lifecycle-logger.mjs',[],{input:JSON.stringify({hook_event_name:'SubagentStart',session_id:'session-1',agent_id:'agent-1',agent_name:'qarga-backend-engineer',prompt:'must-not-be-logged',tool_input:{secret:'must-not-be-logged'}})});expectStatus(result,0,'lifecycle logger');const lifecycleLine=fs.readFileSync(path.join(tempRoot,'.claude/telemetry/agent-events.jsonl'),'utf8').trim().split(/\r?\n/).at(-1);const lifecycle=JSON.parse(lifecycleLine);if('prompt' in lifecycle||'tool_input' in lifecycle||JSON.stringify(lifecycle).includes('must-not-be-logged'))fail('lifecycle telemetry captured forbidden content');

  // Work OS keeps persistent parent tasks, dependency-aware agent subtasks, contract linkage, review, scoring, and owner-decision gates.
  result=runNode('scripts/work-os.mjs',['create-task','--title','Work OS deterministic fixture','--type','feature','--priority','high','--team','Engineering']);expectStatus(result,0,'Work OS parent task creation');
  result=runNode('scripts/work-os.mjs',['add-subtask','QW-0001','--title','Backend fixture','--agent','qarga-backend-engineer','--reviewer','qarga-qa-auditor','--points','4','--accept','Backend requirement::deterministic evidence','--accept','Regression requirement::deterministic regression evidence']);expectStatus(result,0,'Work OS first subtask creation');
  result=runNode('scripts/work-os.mjs',['add-subtask','QW-0001','--title','Frontend dependent fixture','--agent','qarga-frontend-engineer','--reviewer','qarga-qa-auditor','--points','3','--depends','QW-0001-S01','--accept','Frontend requirement::deterministic evidence']);expectStatus(result,0,'Work OS dependent subtask creation');
  let workState=JSON.parse(fs.readFileSync(path.join(tempRoot,'.claude/work-os/state.json'),'utf8'));let workTask=workState.tasks.find((x)=>x.id==='QW-0001');if(workTask.subtasks.find((x)=>x.id==='QW-0001-S01')?.status!=='ready')fail('Work OS first subtask was not READY');if(workTask.subtasks.find((x)=>x.id==='QW-0001-S02')?.status!=='waiting')fail('Work OS dependency did not keep second subtask WAITING');
  result=runNode('scripts/work-os.mjs',['start','QW-0001','QW-0001-S02','--agent','qarga-frontend-engineer']);if(result.status===0)fail('Work OS allowed a dependency-blocked subtask to start');
  result=runNode('scripts/work-os.mjs',['start','QW-0001','QW-0001-S01','--agent','qarga-backend-engineer']);expectStatus(result,0,'Work OS subtask start');
  result=runNode('scripts/work-os.mjs',['submit','QW-0001','QW-0001-S01','--agent','qarga-backend-engineer','--summary','Fixture complete','--evidence','REQ-1::work os deterministic evidence','--evidence','REQ-2::work os deterministic regression evidence']);expectStatus(result,0,'Work OS subtask submit');
  result=runNode('scripts/work-os.mjs',['review','QW-0001','QW-0001-S01','--reviewer','qarga-qa-auditor','--outcome','accepted','--correctness','95','--verification','100','--scope','95','--safety','100','--collaboration','90','--clarity','90','--strength','Dependency contract stayed intact']);expectStatus(result,0,'Work OS accepted independent review');
  workState=JSON.parse(fs.readFileSync(path.join(tempRoot,'.claude/work-os/state.json'),'utf8'));workTask=workState.tasks.find((x)=>x.id==='QW-0001');if(workTask.subtasks.find((x)=>x.id==='QW-0001-S01')?.status!=='done')fail('Work OS accepted subtask did not become DONE');if(workTask.subtasks.find((x)=>x.id==='QW-0001-S02')?.status!=='ready')fail('Work OS did not unlock dependent subtask');if(!(workTask.kpiEarnedPoints>0&&workTask.kpiMaxPoints===7))fail('Work OS KPI rollup is invalid');
  result=runNode('scripts/work-os.mjs',['decision-open','QW-0001','--summary','Owner fixture decision','--option','A','--option','B']);expectStatus(result,0,'Work OS owner decision open');workState=JSON.parse(fs.readFileSync(path.join(tempRoot,'.claude/work-os/state.json'),'utf8'));if(workState.tasks.find((x)=>x.id==='QW-0001')?.status!=='needs_decision')fail('Work OS owner decision did not move task to needs_decision');
  result=runNode('scripts/work-os.mjs',['decision-resolve','QW-0001','--summary','Owner selected A','--decision-id','DEC-SELFTEST-WORKOS']);expectStatus(result,0,'Work OS owner decision resolve');
  result=runNode('scripts/work-os.mjs',['validate']);expectStatus(result,0,'Work OS validation');result=runNode('scripts/review-work-os.mjs');expectStatus(result,0,'Work OS review');result=runNode('scripts/export-work-os-snapshot.mjs');expectStatus(result,0,'Work OS snapshot export');if(!fs.existsSync(path.join(tempRoot,'docs/work-os/BOARD-SNAPSHOT.md')))fail('Work OS snapshot was not generated');

  // Safety hook and staged-secret guard.
  result=runNode('.claude/hooks/block-dangerous-command.mjs',[],{input:JSON.stringify({tool_input:{command:'npm test'}})});expectStatus(result,0,'safe command');result=runNode('.claude/hooks/block-dangerous-command.mjs',[],{input:JSON.stringify({tool_input:{command:'git reset --hard HEAD~1'}})});expectStatus(result,2,'dangerous command');result=runNode('.claude/hooks/block-dangerous-command.mjs',[],{input:JSON.stringify({tool_input:{command:'git push origin main'}})});expectStatus(result,2,'direct protected-branch push');
  const fakeSecret='sk-'+'A'.repeat(40);fs.writeFileSync(path.join(tempRoot,'leak.txt'),`token=${fakeSecret}\n`);run('git',['add','leak.txt']);result=runNode('.claude/hooks/scan-staged-secrets.mjs',['--staged']);expectStatus(result,2,'staged secret detection');run('git',['reset','--','leak.txt']);fs.rmSync(path.join(tempRoot,'leak.txt'));

  // Local security, health, E2E readiness, and agent-ops reporting.
  result=runNode('scripts/scan-agent-config-security.mjs');assertCrlfTolerated(result,'agent config security scan',['agent requests unrestricted Bash(*)']);expectStatus(result,0,'agent config security scan');result=runNode('scripts/check-playwright-readiness.mjs');expectStatus(result,0,'Playwright structure readiness');result=runNode('scripts/generate-agent-ops-dashboard.mjs');expectStatus(result,0,'agent ops report');if(!fs.existsSync(path.join(tempRoot,'docs/agent-ops/dashboard.html')))fail('agent ops dashboard was not generated');
  result=runNode('scripts/validate-claude-config.mjs');assertCrlfTolerated(result,'full Claude config validator',['YAML frontmatter is missing','YAML frontmatter is not closed']);expectStatus(result,0,'full Claude config validator');result=runNode('scripts/system-health.mjs',['--ci']);expectStatus(result,0,'system health core gate');

  cleanup();
  console.log('Claude system self-test passed: completion contracts, anti-spin, contract-backed scoring, learning, project memory, system evolution separation/approval/pilot, skill research/holdout evaluation/pilot/promotion, telemetry privacy, safety hooks, secret scan, security scan, health, Work OS orchestration, E2E readiness, and Agent Ops reporting are correct.');
} catch (error) {
  fail(error.stack || error.message);
}
