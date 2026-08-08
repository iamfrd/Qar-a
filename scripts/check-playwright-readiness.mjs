import fs from 'node:fs'; import process from 'node:process'; import { createRequire } from 'node:module';
const require=createRequire(import.meta.url); const checks=[]; const push=(name,status,detail)=>checks.push({name,status,detail});
push('policy',fs.existsSync('.claude/e2e/policy.json')?'ready':'missing','.claude/e2e/policy.json');push('config',fs.existsSync('tests/e2e/playwright.config.mjs')?'ready':'missing','tests/e2e/playwright.config.mjs');
let installed=false;try{require.resolve('@playwright/test');installed=true}catch{}push('dependency',installed?'ready':'not-configured',installed?'@playwright/test is installed':'Install @playwright/test only after project-owner approval and update the lockfile.');
for(const c of checks)console.log(`${c.status.toUpperCase()}: ${c.name} — ${c.detail}`);if(checks.some((c)=>c.status==='missing'))process.exit(1);
