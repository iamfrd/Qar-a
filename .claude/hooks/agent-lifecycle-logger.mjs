import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
let raw=''; for await (const chunk of process.stdin) raw+=chunk;
let input={}; try{input=raw.trim()?JSON.parse(raw):{}}catch{process.exit(0)}
const projectDir=process.env.CLAUDE_PROJECT_DIR||process.cwd(); const out=path.join(projectDir,'.claude','telemetry','agent-events.jsonl');
fs.mkdirSync(path.dirname(out),{recursive:true});
const event=String(input.hook_event_name||input.event||process.env.CLAUDE_HOOK_EVENT||'SubagentLifecycle');
const agentName=String(input.agent_name||input.agent_type||input.subagent_type||process.env.CLAUDE_AGENT_NAME||'unknown').slice(0,120);
const agentId=String(input.agent_id||input.subagent_id||'').slice(0,160); const sessionId=String(input.session_id||process.env.CLAUDE_SESSION_ID||'').slice(0,160);
const record={event,timestamp:new Date().toISOString(),sessionId,agentId,agentName,agentType:String(input.agent_type||input.subagent_type||'').slice(0,120),source:'claude-hook'};
fs.appendFileSync(out,`${JSON.stringify(record)}\n`); process.exit(0);
