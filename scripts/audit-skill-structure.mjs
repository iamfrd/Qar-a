import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
const root = process.cwd();
const base = path.join(root, '.claude/skills');
let errors = 0;
let warnings = 0;
if (!fs.existsSync(base)) {
  console.error('No .claude/skills directory');
  process.exit(2);
}
for (const entry of fs.readdirSync(base, { withFileTypes: true }).filter((item) => item.isDirectory())) {
  const dir = path.join(base, entry.name);
  const skill = path.join(dir, 'SKILL.md');
  if (!fs.existsSync(skill)) {
    console.error(`${entry.name}: missing SKILL.md`);
    errors += 1;
    continue;
  }
  // Normalize CRLF to LF once at the read boundary so a Windows checkout parses
  // identically to an LF checkout. Structural assertions below are unchanged.
  const text = fs.readFileSync(skill, 'utf8').replace(/\r\n/g, '\n');
  if (!text.startsWith('---\n')) {
    console.error(`${entry.name}: missing frontmatter`);
    errors += 1;
    continue;
  }
  const end = text.indexOf('\n---\n', 4);
  if (end < 0) {
    console.error(`${entry.name}: unclosed frontmatter`);
    errors += 1;
    continue;
  }
  const frontmatter = text.slice(4, end).split(/\r?\n/).filter(Boolean);
  const keys = frontmatter.map((line) => line.slice(0, line.indexOf(':')).trim()).filter(Boolean);
  for (const required of ['name', 'description']) {
    if (!keys.includes(required)) {
      console.error(`${entry.name}: missing ${required}`);
      errors += 1;
    }
  }
  const extra = keys.filter((key) => !['name', 'description'].includes(key));
  if (extra.length) {
    console.error(`${entry.name}: unsupported frontmatter fields: ${extra.join(', ')}`);
    errors += 1;
  }
  const nameLine = frontmatter.find((line) => line.startsWith('name:')) || '';
  const name = nameLine.slice(5).trim();
  if (name !== entry.name) {
    console.error(`${entry.name}: frontmatter name mismatch (${name})`);
    errors += 1;
  }
  const bodyLines = text.slice(end + 5).split(/\r?\n/).length;
  if (bodyLines > 220) {
    console.warn(`${entry.name}: SKILL.md is ${bodyLines} lines; consider progressive disclosure into references/`);
    warnings += 1;
  }
  for (const subdir of ['references', 'scripts', 'assets']) {
    const target = path.join(dir, subdir);
    if (fs.existsSync(target) && !fs.statSync(target).isDirectory()) {
      console.error(`${entry.name}: ${subdir} must be a directory`);
      errors += 1;
    }
  }
}
console.log(`Skill structure audit: ${errors} error(s), ${warnings} warning(s).`);
if (errors) process.exit(2);
