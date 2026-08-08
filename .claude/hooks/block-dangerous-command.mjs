import process from 'node:process';
import { spawnSync } from 'node:child_process';
let raw=''; for await(const chunk of process.stdin)raw+=chunk; let input={}; try{input=JSON.parse(raw||'{}')}catch{process.exit(0)}
const command=String(input?.tool_input?.command??'').trim(); if(!command)process.exit(0);
const blocked=[
 {pattern:/\brm\s+(?:(?=-[^\s]*r)(?=-[^\s]*f)-[^\s]+|(?=[^\n]*--recursive)(?=[^\n]*--force)[^\n]*)/i,reason:'Recursive force deletion requires human review.'},
 {pattern:/\b(?:dd\s+(?:if|of)=\/dev|mkfs(?:\.|\s)|mkswap\s|fdisk\s)/i,reason:'Raw disk/filesystem mutation is forbidden.'},
 {pattern:/\bgit\s+reset\s+--hard\b/i,reason:'Hard reset can destroy uncommitted work.'},
 {pattern:/\bgit\s+clean\s+-[^\n]*f/i,reason:'Git clean can permanently remove untracked files.'},
 {pattern:/\bgit\s+push\b[^\n]*(--force(?:-with-lease)?|-f)\b/i,reason:'Force push is not allowed from an autonomous agent.'},
 {pattern:/\bgit\s+branch\s+-D\b/i,reason:'Forced branch deletion requires human approval.'},
 {pattern:/\bgit\s+checkout\s+--\s+[^\n]+/i,reason:'Checkout with a path can discard uncommitted changes.'},
 {pattern:/\bgit\s+restore\b(?![^\n]*--staged\b)[^\n]*/i,reason:'Restoring the worktree can discard uncommitted changes.'},
 {pattern:/\bgit\s+reflog\s+expire\b/i,reason:'Reflog expiration can remove recovery history.'},
 {pattern:/\bDROP\s+(?:TABLE|DATABASE)\b/i,reason:'Destructive database operations require explicit human approval and a backup plan.'},
 {pattern:/\bTRUNCATE\s+TABLE\b/i,reason:'Data truncation requires explicit human approval.'},
 {pattern:/\bterraform\s+(?:apply|destroy)\b/i,reason:'Infrastructure mutation requires explicit human approval.'},
 {pattern:/\bhelm\s+(?:upgrade|install|uninstall|delete)\b/i,reason:'Cluster release changes require explicit human approval.'},
 {pattern:/\b(?:vercel(?:\s+deploy)?\s+--prod|netlify\s+deploy\b[^\n]*--prod|firebase\s+deploy|wrangler\s+deploy|railway\s+up|fly\s+deploy|npm\s+publish|pnpm\s+publish|yarn\s+npm\s+publish|docker\s+push|kubectl\s+(?:apply|delete|replace|patch))\b/i,reason:'Production publication or deployment requires explicit human approval.'},
 {pattern:/\b(?:curl|wget)\b[^\n|]*\|\s*(?:sh|bash|zsh|powershell|pwsh)\b/i,reason:'Pipe-to-shell execution is blocked; inspect and pin installers explicitly.'}
];
let hit=blocked.find((x)=>x.pattern.test(command));
if(!hit&&/\bgit\s+push\b/i.test(command)){
 let branch='';try{branch=spawnSync('git',['branch','--show-current'],{encoding:'utf8'}).stdout.trim()}catch{}
 if(branch==='main'||/\bgit\s+push\s+(?:\S+\s+)?main(?:\s|$)/i.test(command)) hit={reason:'Direct push to protected branch main is blocked; use a reviewed pull request.'};
}
if(!hit)process.exit(0); process.stderr.write(`Qarğa safety hook blocked command: ${hit.reason}\nCommand: ${command}\n`); process.exit(2);
