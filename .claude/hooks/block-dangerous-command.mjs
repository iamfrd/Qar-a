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

// ---------------------------------------------------------------------------
// Argument-level git inspection.
//
// The regex entries above match raw command text. That is adequate for the
// patterns that carry their own distinguishing flag (`--hard`, `--force`), but
// it is not adequate for a guard whose entire value is that it cannot be
// bypassed. `\bgit\s+stash\b` requires the subcommand to be the literal next
// token after `git`, so every ordinary git invocation style defeats it:
// `git -C <path> ...`, `git -c k=v ...`, `git --git-dir=<path> ...`, and a
// quoted subcommand. Raw-text matching is also wrong in the other direction:
// it rejects a commit message or grep pattern that merely mentions the phrase,
// which teaches agents to split tokens to get legitimate work done and erodes
// the guard.
//
// The two destructive-workflow rules below therefore tokenise the command the
// way a shell would, resolve git's global options, and inspect the parsed
// subcommand. String literals inside `-m` messages and `--grep` patterns are
// arguments of another subcommand, so they can no longer trigger a block.
// ---------------------------------------------------------------------------

// Git global options that consume the following token as their value.
const GIT_VALUE_OPTIONS=new Set(['-C','-c','--git-dir','--work-tree','--namespace','--exec-path','--config-env','--super-prefix']);
// Prefixes that wrap another command without changing what is executed.
const COMMAND_WRAPPERS=new Set(['sudo','doas','env','command','builtin','exec','nohup','time','nice','stdbuf']);
// Interpreters that take the real command as a string argument.
const SHELL_WRAPPERS=new Set(['sh','bash','zsh','dash','ksh','ash','busybox','pwsh','powershell','cmd']);
const SHELL_COMMAND_FLAGS=new Set(['-c','--command','-command','-cmd','/c','/k']);
const MAX_SHELL_DEPTH=3;

const basename=(token)=>token.replace(/\\/g,'/').split('/').pop().replace(/\.(exe|cmd|bat)$/i,'').toLowerCase();

// Split a command line into shell segments of argv tokens. Quoting is resolved
// so `git "stash"` yields ['git','stash']; operators, command substitution and
// subshells start a new segment so `a && git stash` and `$(git stash)` are both
// inspected. A backslash is only treated as an escape before a shell-meaningful
// character, otherwise it stays literal so Windows paths such as
// `.claude\worktrees\x` survive tokenisation intact.
function splitSegments(text){
 const segments=[];let argv=[];let token='';let started=false;let quote=null;
 const endToken=()=>{if(started){argv.push(token);token='';started=false;}};
 const endSegment=()=>{endToken();if(argv.length){segments.push(argv);argv=[];}};
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(quote==="'"){if(c==="'"){quote=null;continue;}token+=c;started=true;continue;}
  if(quote==='"'){
   if(c==='\\'&&'"\\$`'.includes(text[i+1]??'')){token+=text[++i];started=true;continue;}
   if(c==='"'){quote=null;continue;}
   if(c==='`'||(c==='$'&&text[i+1]==='(')){endSegment();if(c==='$')i++;continue;}
   token+=c;started=true;continue;
  }
  if(c==='\\'&&' \t"\'\\$`&|;()'.includes(text[i+1]??'')){token+=text[++i];started=true;continue;}
  if(c==='"'||c==="'"){quote=c;started=true;continue;}
  if(c==='`'||c==='('||c===')'){endSegment();continue;}
  if(c==='$'&&text[i+1]==='('){endSegment();i++;continue;}
  if(c===';'||c==='\n'||c==='\r'){endSegment();continue;}
  if(c==='&'||c==='|'){endSegment();while('&|'.includes(text[i+1]??''))i++;continue;}
  if(c==='>'||c==='<'){endToken();continue;}
  if(c===' '||c==='\t'){endToken();continue;}
  token+=c;started=true;
 }
 endSegment();
 return segments;
}

// Drop leading environment assignments and transparent wrappers (`sudo git ...`).
function stripWrappers(argv){
 let i=0;
 while(i<argv.length){
  if(/^[A-Za-z_][A-Za-z0-9_]*=/.test(argv[i])){i++;continue;}
  if(COMMAND_WRAPPERS.has(basename(argv[i]))){i++;while(i<argv.length&&argv[i].startsWith('-'))i++;continue;}
  break;
 }
 return argv.slice(i);
}

// Resolve git's global options and return the real subcommand plus its arguments.
function parseGit(argv){
 let i=1;
 while(i<argv.length){
  const token=argv[i];
  if(!token.startsWith('-'))break;
  if(token==='--'){i++;break;}
  i+=GIT_VALUE_OPTIONS.has(token)?2:1;
 }
 return{subcommand:argv[i],args:argv.slice(i+1)};
}

const targetsClaudeDirectory=(value)=>/(?:^|[\\/])\.claude(?:[\\/]|$)/i.test(value);

const STASH_REASON='git '+'stash'+' removes uncommitted work from the worktree and has already destroyed a ledger here; commit to a branch instead, or copy the files to a scratch directory outside .claude/. Read-only "git stash list" and "git stash show" remain allowed. Global options such as -C, -c, --git-dir and quoting do not bypass this check.';
const WORKTREE_REASON='A worktree under .claude/ breaks npm run validate:claude and the agent-system self-test; create the worktree outside .claude/, for example a sibling scratch directory next to the repository. Worktrees elsewhere are not blocked. Global options such as -C, -c, --git-dir and quoting do not bypass this check.';

function inspectSegment(argv,depth){
 argv=stripWrappers(argv);
 if(!argv.length)return null;
 const program=basename(argv[0]);
 if(SHELL_WRAPPERS.has(program)){
  if(depth>=MAX_SHELL_DEPTH)return null;
  for(let i=1;i<argv.length-1;i++){
   if(!SHELL_COMMAND_FLAGS.has(argv[i].toLowerCase()))continue;
   const nested=inspectCommand(argv[i+1],depth+1);
   if(nested)return nested;
  }
  return null;
 }
 if(program!=='git')return null;
 const{subcommand,args}=parseGit(argv);
 if(subcommand==='stash')return args[0]==='list'||args[0]==='show'?null:STASH_REASON;
 if(subcommand==='worktree'&&args[0]==='add'&&args.slice(1).some(targetsClaudeDirectory))return WORKTREE_REASON;
 return null;
}

function inspectCommand(text,depth=0){
 for(const argv of splitSegments(text)){
  const reason=inspectSegment(argv,depth);
  if(reason)return reason;
 }
 return null;
}

let hit=blocked.find((x)=>x.pattern.test(command));
if(!hit){const reason=inspectCommand(command);if(reason)hit={reason};}
if(!hit&&/\bgit\s+push\b/i.test(command)){
 let branch='';try{branch=spawnSync('git',['branch','--show-current'],{encoding:'utf8'}).stdout.trim()}catch{}
 if(branch==='main'||/\bgit\s+push\s+(?:\S+\s+)?main(?:\s|$)/i.test(command)) hit={reason:'Direct push to protected branch main is blocked; use a reviewed pull request.'};
}
if(!hit)process.exit(0); process.stderr.write(`Qarğa safety hook blocked command: ${hit.reason}\nCommand: ${command}\n`); process.exit(2);
