import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
const root=process.cwd(); const resolve=(p)=>path.resolve(root,p);
const readj=(p)=>JSON.parse(fs.readFileSync(p,'utf8')); const readl=(p)=>fs.existsSync(p)?fs.readFileSync(p,'utf8').split(/\r?\n/).filter(Boolean).map(JSON.parse):[];
const policy=readj(resolve('.claude/tasks/policy.json')); const contracts=readl(resolve('.claude/tasks/contracts.jsonl')); const progress=readl(resolve('.claude/tasks/progress.jsonl'));
const taskIds=[...new Set(contracts.map((r)=>r.taskId))]; const output={generatedAt:new Date().toISOString(),tasks:{},blocked:[],readyToClose:[]};
function derive(taskId){
 const rows=contracts.filter((r)=>r.taskId===taskId); const created=rows.find((r)=>r.eventType==='created'); if(!created) return null;
 let requirements=structuredClone(created.requirements??[]), ownerAgent=created.ownerAgent, reviewerAgent=created.reviewerAgent;
 for(const row of rows.filter((r)=>r.eventType==='amended')){if(Array.isArray(row.replaceRequirements))requirements=structuredClone(row.replaceRequirements);if(row.replaceOwnerAgent)ownerAgent=row.replaceOwnerAgent;if(row.replaceReviewerAgent)reviewerAgent=row.replaceReviewerAgent}
 const evidenceRows=rows.filter((r)=>r.eventType==='evidence'); const evidenceBy=new Map(); for(const e of evidenceRows){const list=evidenceBy.get(e.requirementId)??[];list.push(e);evidenceBy.set(e.requirementId,list)}
 const missing=requirements.filter((r)=>!evidenceBy.has(r.id)).map((r)=>r.id); const attempts=progress.filter((p)=>p.taskId===taskId).sort((a,b)=>a.iteration-b.iteration); const reasons=[]; const anti=policy.antiSpin??{};
 if(attempts.length>(anti.maxMaterialIterations??5))reasons.push('material-iteration-budget-exceeded');
 const n=anti.consecutiveNoProgressLimit??2,last=attempts.slice(-n); if(last.length>=n&&last.every((a)=>a.measurableProgress===false))reasons.push('consecutive-no-progress');
 const map=new Map(); for(const a of attempts){const key=String(a.approachKey??'').trim().toLowerCase();if(!key)continue;const arr=map.get(key)??[];arr.push(a);map.set(key,arr)}
 for(const [key,arr] of map){if(arr.filter((a)=>a.measurableProgress===false).length>=(anti.sameApproachWithoutNewEvidenceLimit??2))reasons.push(`repeated-approach:${key}`)}
 if(anti.detectFlipFlop&&attempts.length>=3){const a=attempts.slice(-3).map((x)=>String(x.approachKey??'').trim().toLowerCase());if(a[0]&&a[1]&&a[0]===a[2]&&a[0]!==a[1])reasons.push(`flip-flop:${a.join('>')}`)}
 const closed=rows.findLast?.((r)=>r.eventType==='closed')??[...rows].reverse().find((r)=>r.eventType==='closed')??null;
 return {title:created.title,lane:created.lane,basePoints:created.basePoints,ownerAgent,reviewerAgent,requirements:requirements.map((r)=>({id:r.id,text:r.text,evidenceExpected:r.evidence,verified:evidenceBy.has(r.id),evidenceEvents:evidenceBy.get(r.id)?.length??0})),missingRequirements:missing,iterations:attempts.length,lastIteration:attempts.at(-1)?.iteration??null,antiSpinBlocked:reasons.length>0,antiSpinReasons:reasons,closed:closed?{status:closed.status,recordedAt:closed.recordedAt}:null};
}
for(const id of taskIds){const state=derive(id); if(!state)continue;output.tasks[id]=state;if(!state.closed&&state.antiSpinBlocked)output.blocked.push({taskId:id,reasons:state.antiSpinReasons});if(!state.closed&&!state.antiSpinBlocked&&state.missingRequirements.length===0)output.readyToClose.push(id)}
fs.writeFileSync(resolve('.claude/tasks/review.json'),`${JSON.stringify(output,null,2)}\n`); console.log(`Task review: ${taskIds.length} task(s), ${output.blocked.length} blocked, ${output.readyToClose.length} ready to close.`);
