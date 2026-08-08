import fs from 'node:fs';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const args=new Set(process.argv.slice(2)); const manual=args.has('--staged');
let command=''; if(!manual){let raw='';for await(const chunk of process.stdin)raw+=chunk;try{const input=JSON.parse(raw||'{}');command=String(input?.tool_input?.command??'')}catch{process.exit(0)}if(!/\bgit\s+commit\b/i.test(command))process.exit(0)}
const git=(argv)=>spawnSync('git',argv,{encoding:'utf8'}); const filesResult=git(['diff','--cached','--name-only','--diff-filter=ACMR']);
if(filesResult.status!==0){if(manual){console.error('Secret scan could not read staged files.');process.exit(1)}process.exit(0)}
const files=filesResult.stdout.split(/\r?\n/).map((s)=>s.trim()).filter(Boolean); if(files.length===0){console.log('Secret scan: no staged files.');process.exit(0)}
const blockedPath=(file)=>{const f=file.replaceAll('\\','/');if(/(^|\/)\.env(?:\.[^/]+)?$/i.test(f)&&!/(^|\/)\.env\.(example|sample|template)$/i.test(f))return 'environment file';if(/(^|\/)secrets\//i.test(f))return 'secrets directory';if(/\.(pem|key|p12|pfx)$/i.test(f))return 'private key/certificate material';if(/(^|\/)config\/credentials\.json$/i.test(f))return 'credential file';return null};
const patterns=[
 ['AWS access key',/AKIA[0-9A-Z]{16}/g],['Anthropic API key',/sk-ant-[A-Za-z0-9_-]{20,}/g],['OpenAI API key',/sk-(?:proj-)?[A-Za-z0-9_-]{32,}/g],['GitHub token',/(?:ghp|gho|ghs|ghr)_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{20,}/g],['Stripe secret key',/(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{20,}/g],['Google API key',/AIza[0-9A-Za-z_-]{35}/g],['Private key header',/-----BEGIN (?:RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----/g],['Database credential URL',/(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?)?:\/\/[^\s:'"/]+:[^\s@'"/]+@[^\s'"/]+/gi],['Generic hardcoded secret',/(?:api[_-]?key|secret[_-]?key|access[_-]?token|password)\s*[:=]\s*['"][A-Za-z0-9_\-\/+.=]{20,}['"]/gi]
];
const findings=[];
for(const file of files){const reason=blockedPath(file);if(reason){findings.push({file,line:null,type:reason});continue}const blob=git(['show',`:${file}`]);if(blob.status!==0)continue;const text=blob.stdout;if(text.includes('\u0000'))continue;const lines=text.split(/\r?\n/);for(let i=0;i<lines.length;i++){const line=lines[i];if(/example|placeholder|dummy|your[_-]/i.test(line))continue;for(const [type,re] of patterns){re.lastIndex=0;if(re.test(line))findings.push({file,line:i+1,type})}}}
if(findings.length){console.error(`Qarğa secret-safety scan blocked the commit: ${findings.length} potential issue(s).`);for(const f of findings)console.error(`- ${f.type}: ${f.file}${f.line?`:${f.line}`:''}`);console.error('Secret values are intentionally not printed. Remove the secret, unstage protected files, or use a secure environment/secret store.');process.exit(2)}
console.log(`Secret scan passed: ${files.length} staged file(s) checked.`);
