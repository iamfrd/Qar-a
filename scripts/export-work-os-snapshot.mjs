import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { publicState } from './work-os-core.mjs';

const root = process.cwd();
const outDir = path.resolve(root, 'docs/work-os');
const state = publicState();
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'board-snapshot.json'), `${JSON.stringify(state, null, 2)}\n`);

const rows = state.tasks.map((task) => `| ${task.id} | ${task.title.replace(/\|/g,'\\|')} | ${task.status} | ${task.priority} | ${task.progress.percent}% | ${task.kpiEarnedPoints}/${task.kpiMaxPoints} | ${(task.participants || []).join(', ')} |`).join('\n');
const md = `# Qarğa Work OS Snapshot\n\nGenerated: ${new Date().toISOString()}\n\n## Operational summary\n\n- Tasks: ${state.summary.taskCount}\n- Active subtasks: ${state.summary.activeSubtasks}\n- Owner decisions: ${state.summary.ownerDecisions.length}\n- KPI points: ${state.summary.totalKpiEarnedPoints}/${state.summary.totalKpiMaxPoints}\n\n## Tasks\n\n| ID | Task | Status | Priority | Progress | KPI | Participants |\n|---|---|---|---|---:|---:|---|\n${rows || '| — | No tasks yet | — | — | — | — | — |'}\n\nThis snapshot is generated. The canonical operational state remains in \`.claude/work-os/state.json\`.\n`;
fs.writeFileSync(path.join(outDir, 'BOARD-SNAPSHOT.md'), md);
console.log('Exported docs/work-os/board-snapshot.json and docs/work-os/BOARD-SNAPSHOT.md');
