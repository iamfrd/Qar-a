import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
const root=process.cwd(); const kind=process.argv[2]; const inputPath=process.argv[3];
const kinds=new Set(['research','proposal','change','review','pilot']);
if(!kinds.has(kind)||!inputPath){console.error('Usage: npm run evolution:record -- <research|proposal|change|review|pilot> <event.json>');process.exit(1)}
const resolve=(p)=>path.resolve(root,p); const fail=(m)=>{console.error(`Evolution record rejected: ${m}`);process.exit(1)};
const readj=(p)=>JSON.parse(fs.readFileSync(p,'utf8')); const readl=(p)=>fs.existsSync(p)?fs.readFileSync(p,'utf8').split(/\r?\n/).filter(Boolean).map(JSON.parse):[];
const policy=readj(resolve('.claude/evolution/policy.json')); const registry=readj(resolve('.claude/capability-registry.json')); const event=readj(resolve(inputPath)); const ledger=resolve(`.claude/evolution/${kind==='proposal'?'proposals':kind==='change'?'changes':kind==='review'?'reviews':kind==='pilot'?'pilots':'research'}.jsonl`);
const all={research:readl(resolve('.claude/evolution/research.jsonl')),proposal:readl(resolve('.claude/evolution/proposals.jsonl')),change:readl(resolve('.claude/evolution/changes.jsonl')),review:readl(resolve('.claude/evolution/reviews.jsonl')),pilot:readl(resolve('.claude/evolution/pilots.jsonl'))};
for(const rows of Object.values(all)) if(rows.some((r)=>r.eventId===event.eventId)) fail(`duplicate eventId: ${event.eventId}`);
if(!event.eventId||!/^[A-Za-z0-9._-]+$/.test(event.eventId)) fail('eventId is missing or invalid'); if(event.sensitiveDataIncluded===true) fail('evolution ledgers must not contain secrets or personal data');
const agents=new Set(registry.agents.map((a)=>a.name)); const owner=registry.ownerRole;
if(kind==='research'){
 if(event.researchedBy!==policy.roles.researcher) fail(`research must be recorded by ${policy.roles.researcher}`);
 for(const key of ['researchId','problem','evidence','rootCauseHypotheses','options','recommendation','rollback','pilotPlan']) if(event[key]===undefined) fail(`${key} is required`);
 if(!Array.isArray(event.evidence)||event.evidence.length===0) fail('research requires evidence');
}
if(kind==='proposal'){
 if(!event.proposalId||!event.researchId||!event.targetType||!event.changeSummary) fail('proposalId, researchId, targetType, and changeSummary are required');
 if(!all.research.some((r)=>r.researchId===event.researchId)) fail(`unknown researchId: ${event.researchId}`);
 if(event.status==='approved'&&event.approvedBy!==owner) fail(`approved proposal requires ${owner} approval`);
 if(!new Set(['draft','approved','rejected']).has(event.status)) fail('proposal status must be draft, approved, or rejected');
 if(!Array.isArray(event.validationPlan)||event.validationPlan.length===0) fail('validationPlan is required');
}
if(kind==='change'){
 if(event.implementedBy!==policy.roles.improver) fail(`changes must be implemented by ${policy.roles.improver}`);
 const proposal=all.proposal.find((r)=>r.proposalId===event.proposalId&&r.status==='approved'); if(!proposal) fail('change requires an approved proposal');
 if(!event.changeId||!Array.isArray(event.filesChanged)||event.filesChanged.length===0) fail('changeId and filesChanged are required');
 if(!event.rollback||typeof event.rollback!=='string') fail('rollback is required');
}
if(kind==='review'){
 if(event.reviewedBy!==policy.roles.reviewer) fail(`system review must be performed by ${policy.roles.reviewer}`);
 const change=all.change.find((r)=>r.changeId===event.changeId); if(!change) fail('review requires a recorded change');
 if(change.implementedBy===event.reviewedBy) fail('reviewer cannot review its own change');
 if(!new Set(['APPROVE_FOR_PILOT','REVISE','REJECT']).has(event.verdict)) fail('invalid review verdict');
 if(!Array.isArray(event.evidence)||event.evidence.length===0) fail('review evidence is required');
}
if(kind==='pilot'){
 const proposal=all.proposal.find((r)=>r.proposalId===event.proposalId&&r.status==='approved'); if(!proposal) fail('pilot requires an approved proposal');
 const change=all.change.find((r)=>r.changeId===event.changeId); if(!change) fail('pilot requires a recorded change');
 const review=all.review.find((r)=>r.changeId===event.changeId&&r.verdict==='APPROVE_FOR_PILOT'); if(!review) fail('pilot requires APPROVE_FOR_PILOT review');
 if(!Array.isArray(event.taskIds)) fail('taskIds must be an array');
 if(new Set(['KEEP','REVISE','REVERT']).has(event.outcome)){
   if(event.outcome==='KEEP'&&event.taskIds.length<(policy.pilot.defaultRelevantTasks??3)) fail(`KEEP requires at least ${policy.pilot.defaultRelevantTasks??3} relevant pilot tasks`);
   if(event.outcome==='KEEP'&&event.approvedBy!==owner) fail(`permanent KEEP requires ${owner} approval`);
 } else fail('pilot outcome must be KEEP, REVISE, or REVERT');
 if(!Array.isArray(event.evidence)||event.evidence.length===0) fail('pilot evidence is required');
}
fs.appendFileSync(ledger,`${JSON.stringify({...event,schemaVersion:1,recordedAt:new Date().toISOString()})}\n`); console.log(`Recorded system evolution ${kind}: ${event.eventId}`);
