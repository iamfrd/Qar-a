import fs from 'node:fs'; import path from 'node:path'; import process from 'node:process'; import { spawnSync } from 'node:child_process';
const root=process.cwd(), quiet=process.argv.includes('--quiet'), resolve=(p)=>path.join(root,p), findings=[]; const add=(severity,file,message)=>findings.push({severity,file,message});
// Normalize CRLF to LF once at the read boundary. Without this, a Windows (CRLF) checkout
// makes the '\n---\n' frontmatter split below miss, so the frontmatter-scoped Bash(*) check
// silently widens to the whole file body. Normalizing restores correct frontmatter isolation.
const read=(p)=>fs.readFileSync(resolve(p),'utf8').replace(/\r\n/g,'\n'); const exists=(p)=>fs.existsSync(resolve(p));
let settings=null; try{settings=JSON.parse(read('.claude/settings.json'))}catch(e){add('critical','.claude/settings.json',`invalid JSON: ${e.message}`)}
if(settings){const pre=settings?.hooks?.PreToolUse??[];const commands=pre.flatMap((x)=>x.hooks??[]).map((h)=>String(h.command??''));if(!commands.some((x)=>x.includes('block-dangerous-command.mjs')))add('high','.claude/settings.json','dangerous-command PreToolUse hook is missing');if(!commands.some((x)=>x.includes('scan-staged-secrets.mjs')))add('high','.claude/settings.json','staged-secret PreToolUse hook is missing');const denies=new Set(settings?.permissions?.deny??[]);for(const required of ['Read(./.env)','Write(./.env)','Edit(./.env)'])if(!denies.has(required))add('high','.claude/settings.json',`protected environment permission deny is missing: ${required}`);for(const item of settings?.permissions?.allow??[])if(/Bash\(\*\)|Read\(\*\)|Write\(\*\)/.test(item))add('high','.claude/settings.json',`overly broad allow permission: ${item}`);if(settings?.permissions?.disableBypassPermissionsMode!=='disable')add('critical','.claude/settings.json','bypass-permissions mode is not disabled')}
// .claude/settings.local.json is a real permission surface but was previously read by no gate, so an
// unreviewed allow list could silently supersede the ask/deny gates declared in .claude/settings.json.
const localFile='.claude/settings.local.json';
if(exists(localFile)){let local=null;try{local=JSON.parse(read(localFile))}catch(e){add('critical',localFile,`invalid JSON: ${e.message}`)}
 if(local){const parseRule=(rule)=>{const m=/^([A-Za-z]+)\(([\s\S]*)\)$/.exec(String(rule).trim());return m?{tool:m[1],arg:m[2].trim()}:null};
  const gated=[...(settings?.permissions?.ask??[]),...(settings?.permissions?.deny??[])];
  const interpreter=/^(?:node|npx|bun|deno|bash|sh|zsh|powershell|pwsh|python3?|perl|ruby)$/i;
  const riskyBinary=/^(?:node|npx|npm|pnpm|yarn|bun|deno|bash|sh|zsh|powershell|pwsh|python3?|perl|ruby|git|docker|kubectl|curl|wget|env|eval)$/i;
  const destructiveGit=/^git\s+(?:checkout|restore|reset|clean|stash|worktree|rm|branch|push|filter-branch)$/i;
  for(const item of local?.permissions?.allow??[]){
   if(/^(?:Bash|Read|Write|Edit)\(\s*\*\s*\)$/.test(String(item).trim())){add('critical',localFile,`unrestricted allow permission: ${item}`);continue}
   const parsed=parseRule(item);if(!parsed)continue;
   if(parsed.tool==='Bash'){const wildcard=/^([\s\S]*?)\*$/.exec(parsed.arg);
    if(wildcard){const prefix=wildcard[1].trim();const tokens=prefix.split(/\s+/).filter(Boolean);
     if(tokens.length&&interpreter.test(tokens[0])&&tokens.slice(1).some((t)=>/^(?:-e|-c|-p|--eval|--command|--print)$/i.test(t)))add('critical',localFile,`allow permission grants arbitrary inline code execution: ${item}`);
     else if(tokens.length===1&&riskyBinary.test(tokens[0]))add('high',localFile,`overly broad allow permission grants every argument to "${tokens[0]}": ${item}`);
     else if(destructiveGit.test(prefix))add('high',localFile,`allow permission grants an unrestricted git operation that can discard committed or uncommitted work: ${item}`);
     for(const gate of gated){const g=parseRule(gate);if(g&&g.tool===parsed.tool&&prefix&&g.arg.startsWith(prefix))add('high',localFile,`allow permission ${item} supersedes the gate declared in .claude/settings.json: ${gate}`)}}}
   if(/^(?:Read|Write|Edit)$/.test(parsed.tool)&&/^(?:\*|\*\*|[/\\]\*)/.test(parsed.arg))add('high',localFile,`overly broad ${parsed.tool} allow permission: ${item}`)}}}
const walk=(base)=>{const out=[];if(!exists(base))return out;for(const ent of fs.readdirSync(resolve(base),{withFileTypes:true})){const rel=path.join(base,ent.name);if(ent.isDirectory())out.push(...walk(rel));else out.push(rel)}return out};
for(const file of walk('.claude/agents').filter((f)=>f.endsWith('.md'))){const text=read(file);const fm=text.split('\n---\n')[0]??'';if(/tools:\s*.*Bash\(\*\)/i.test(fm))add('high',file,'agent requests unrestricted Bash(*)');if(/--dangerously-skip-permissions|bypass permissions/i.test(text))add('critical',file,'agent prompt references permission bypass behavior')}
for(const file of walk('.claude/hooks').filter((f)=>/\.(?:mjs|js)$/.test(f))){const result=spawnSync(process.execPath,['--check',resolve(file)],{encoding:'utf8'});if(result.status!==0)add('critical',file,'hook has a JavaScript syntax error');const text=read(file);if(/execSync\s*\(\s*(?:input|command|raw)|exec\s*\(\s*(?:input|command|raw)/.test(text))add('high',file,'hook may pass untrusted input directly to a shell execution API')}
for(const file of ['CLAUDE.md',...walk('.claude/skills').filter((f)=>f.endsWith('SKILL.md')),...walk('.claude/commands').filter((f)=>f.endsWith('.md'))]){if(!exists(file))continue;const text=read(file);if(/curl\s+[^\n|]+\|\s*(?:sh|bash)|wget\s+[^\n|]+\|\s*(?:sh|bash)/i.test(text))add('high',file,'contains a pipe-to-shell installation pattern');}
const rank={critical:4,high:3,medium:2,low:1}; findings.sort((a,b)=>rank[b.severity]-rank[a.severity]||a.file.localeCompare(b.file));
if(!quiet){if(findings.length===0)console.log('Claude security scan passed: no deterministic findings.');else{console.log(`Claude security scan: ${findings.length} finding(s).`);for(const f of findings)console.log(`${f.severity.toUpperCase()}: ${f.file} — ${f.message}`)}}
if(findings.some((f)=>f.severity==='critical'||f.severity==='high'))process.exit(1);
