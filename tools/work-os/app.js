const board = document.querySelector('#board');
const summary = document.querySelector('#summary');
const taskDialog = document.querySelector('#taskDialog');
const taskDetail = document.querySelector('#taskDetail');
const activityPane = document.querySelector('#activityPane');
const createDialog = document.querySelector('#createDialog');
const searchInput = document.querySelector('#searchInput');
const agentFilter = document.querySelector('#agentFilter');
const priorityFilter = document.querySelector('#priorityFilter');
const typeFilter = document.querySelector('#typeFilter');
let data = null;
let activeTaskId = null;

const columns = [
  ['inbox', 'Inbox'],
  ['needs_decision', 'Needs decision'],
  ['ready', 'Ready'],
  ['in_progress', 'In progress'],
  ['review', 'Review'],
  ['blocked', 'Blocked'],
  ['routine', 'Routine'],
  ['done', 'Done']
];

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function initials(name) {
  return String(name || '?').replace(/^qarga-/, '').split(/[-_\s]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || '?';
}
function pct(task) { return task.progress?.percent ?? 0; }
function card(task) {
  const people = (task.participants || []).slice(0, 6);
  return `<article class="task-card" data-task-id="${esc(task.id)}" tabindex="0">
    <h3 class="card-title">${esc(task.title)}</h3>
    <div class="card-meta">
      <span class="pill ${esc(task.priority)}">${esc(task.priority)}</span>
      <span>${esc(task.id)}</span>
      <span>☑ ${task.progress?.completed ?? 0}/${task.progress?.total ?? 0}</span>
      ${task.decisionRequired?.open ? '<span class="pill high">owner decision</span>' : ''}
    </div>
    <progress class="progress" max="100" value="${pct(task)}">${pct(task)}%</progress>
    <div class="agent-row">
      <div class="avatars">${people.map((person) => `<span class="avatar" title="${esc(person)}">${esc(initials(person))}</span>`).join('')}</div>
      <span class="points">${task.kpiEarnedPoints ?? 0}/${task.kpiMaxPoints ?? 0} pts</span>
    </div>
  </article>`;
}
function filteredTasks() {
  const q = searchInput.value.trim().toLowerCase();
  const agent = agentFilter.value;
  const priority = priorityFilter.value;
  const type = typeFilter.value;
  return data.tasks.filter((task) => {
    if (q && !`${task.title} ${task.description} ${task.id}`.toLowerCase().includes(q)) return false;
    if (agent && !(task.participants || []).includes(agent)) return false;
    if (priority && task.priority !== priority) return false;
    if (type && task.type !== type) return false;
    return true;
  });
}
function renderBoard() {
  const tasks = filteredTasks();
  board.innerHTML = columns.map(([status, label]) => {
    const items = tasks.filter((task) => task.status === status);
    return `<section class="column" data-status="${status}">
      <div class="column-header"><span>${label}</span><span class="column-count">${items.length}</span></div>
      <div class="card-list">${items.length ? items.map(card).join('') : '<div class="empty">No tasks</div>'}</div>
    </section>`;
  }).join('');
  document.querySelectorAll('.task-card').forEach((el) => {
    const open = () => openTask(el.dataset.taskId);
    el.addEventListener('click', open);
    el.addEventListener('keydown', (event) => { if (event.key === 'Enter') open(); });
  });
}
function renderSummary() {
  const s = data.summary;
  const blocked = (s.byStatus?.blocked || 0) + (s.byStatus?.needs_decision || 0);
  summary.innerHTML = [
    ['Active tasks', (s.byStatus?.ready || 0) + (s.byStatus?.in_progress || 0) + (s.byStatus?.review || 0)],
    ['Owner decisions', s.ownerDecisions?.length || 0],
    ['Blocked', blocked],
    ['Done', s.byStatus?.done || 0],
    ['KPI points', `${s.totalKpiEarnedPoints}/${s.totalKpiMaxPoints}`]
  ].map(([label, value]) => `<div class="summary-card"><strong>${esc(value)}</strong><span>${esc(label)}</span></div>`).join('');
}
function renderFilters() {
  const currentAgent = agentFilter.value;
  agentFilter.innerHTML = '<option value="">All agents</option>' + data.agents.map((agent) => `<option value="${esc(agent.name)}">${esc(agent.name)}</option>`).join('');
  agentFilter.value = currentAgent;
  const currentType = typeFilter.value;
  const types = [...new Set(data.tasks.map((task) => task.type))].sort();
  typeFilter.innerHTML = '<option value="">All types</option>' + types.map((type) => `<option>${esc(type)}</option>`).join('');
  typeFilter.value = currentType;
  const createType = document.querySelector('#createType');
  createType.innerHTML = ['feature','bug','research','payment','security','operations','support','seo','analytics','experiment','technical_debt','release','routine'].map((type) => `<option>${type}</option>`).join('');
}
function openTask(taskId) {
  activeTaskId = taskId;
  const task = data.tasks.find((item) => item.id === taskId);
  if (!task) return;
  const decision = task.decisionRequired?.open ? `<div class="decision"><strong>Owner decision required</strong><p>${esc(task.decisionRequired.summary)}</p>${(task.decisionRequired.options || []).length ? `<ul>${task.decisionRequired.options.map((option) => `<li>${esc(option)}</li>`).join('')}</ul>` : ''}</div>` : '';
  taskDetail.innerHTML = `
    <h2 class="detail-title">${esc(task.title)}</h2>
    <div class="detail-id">${esc(task.id)} · ${esc(task.type)}</div>
    <div class="section"><div class="info-grid">
      <div class="info-box"><span>Status</span><strong>${esc(task.status)}</strong></div>
      <div class="info-box"><span>Priority</span><strong>${esc(task.priority)}</strong></div>
      <div class="info-box"><span>KPI score</span><strong>${task.kpiEarnedPoints}/${task.kpiMaxPoints}</strong></div>
      <div class="info-box"><span>Progress</span><strong>${task.progress?.percent ?? 0}%</strong></div>
      <div class="info-box"><span>Team</span><strong>${esc(task.team || '—')}</strong></div>
      <div class="info-box"><span>Sprint</span><strong>${esc(task.sprint || '—')}</strong></div>
    </div></div>
    ${decision}
    <div class="section"><h3>Description</h3><p>${esc(task.description || 'No description yet.')}</p></div>
    <div class="section"><h3>Participants</h3><div class="avatars">${(task.participants || []).map((person) => `<span class="avatar" title="${esc(person)}">${esc(initials(person))}</span>`).join('') || '<span class="empty">No assigned agents yet</span>'}</div></div>
    <div class="section"><h3>Subtasks</h3>${task.subtasks.length ? task.subtasks.map(renderSubtask).join('') : '<div class="empty">The coordinator has not decomposed this task yet.</div>'}</div>
    <div class="section"><h3>Linked memory</h3><p class="subtask-meta">Decisions: ${esc((task.links?.decisions || []).join(', ') || '—')} · Debt: ${esc((task.links?.technicalDebt || []).join(', ') || '—')} · Experiments: ${esc((task.links?.experiments || []).join(', ') || '—')}</p></div>
    <div class="section"><h3>Comments</h3>${task.comments.length ? task.comments.map((comment) => `<div class="comment"><strong>${esc(comment.author)}</strong>${esc(comment.text)}</div>`).join('') : '<div class="empty">No comments</div>'}
      <form id="commentForm"><textarea name="text" rows="3" placeholder="Add an owner comment" required></textarea><div class="dialog-actions"><button>Add comment</button></div></form>
    </div>`;
  const events = (data.recentEvents || []).filter((event) => event.taskId === task.id).slice().reverse();
  activityPane.innerHTML = `<h3 class="activity-title">Activity</h3>${events.length ? events.map((event) => `<div class="event"><strong>${esc(event.eventType)}</strong><p>${esc(event.actor || 'system')}${event.subtaskId ? ` · ${esc(event.subtaskId)}` : ''}${event.outcome ? ` · ${esc(event.outcome)}` : ''}</p><time>${esc(event.recordedAt || '')}</time></div>`).join('') : '<div class="empty">No activity recorded yet.</div>'}`;
  document.querySelector('#commentForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const text = new FormData(event.target).get('text');
    await api(`/api/tasks/${encodeURIComponent(task.id)}/comments`, { method: 'POST', body: { author: 'project-owner', text } });
    await load();
    openTask(task.id);
  });
  taskDialog.showModal();
}
function renderSubtask(subtask) {
  return `<div class="subtask">
    <div class="subtask-top"><div><div class="subtask-title">${esc(subtask.title)}</div><div class="subtask-meta">${esc(subtask.id)} · ${esc(subtask.assignedAgent)} → review by ${esc(subtask.reviewerAgent)} · ${subtask.earnedPoints ?? 0}/${subtask.basePoints} pts</div></div><span class="status">${esc(subtask.status)}</span></div>
    ${subtask.dependencies?.length ? `<div class="subtask-meta">Depends on: ${esc(subtask.dependencies.join(', '))}</div>` : ''}
    ${subtask.blocker ? `<div class="decision"><strong>Blocked</strong><p>${esc(subtask.blocker.reason)}</p></div>` : ''}
    <ul class="criteria">${subtask.acceptanceCriteria.map((criterion) => `<li>${esc(criterion.text)} ${criterion.evidenceRefs?.length ? '✓' : ''}</li>`).join('')}</ul>
  </div>`;
}
async function api(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, body: options.body ? JSON.stringify(options.body) : undefined });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || `Request failed: ${response.status}`);
  return payload;
}
async function load() {
  data = await api('/api/state');
  renderSummary();
  renderFilters();
  renderBoard();
}

for (const el of [searchInput, agentFilter, priorityFilter, typeFilter]) el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', renderBoard);
document.querySelector('#refreshBtn').addEventListener('click', load);
document.querySelector('#newTaskBtn').addEventListener('click', () => createDialog.showModal());
document.querySelector('#closeDialog').addEventListener('click', () => taskDialog.close());
document.querySelector('#cancelCreate').addEventListener('click', () => createDialog.close());
document.querySelector('#createTaskForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = Object.fromEntries(new FormData(event.target).entries());
  try {
    await api('/api/tasks', { method: 'POST', body: form });
    event.target.reset();
    createDialog.close();
    await load();
  } catch (error) { alert(error.message); }
});

load().catch((error) => {
  board.innerHTML = `<div class="column"><strong>Work OS failed to load</strong><p>${esc(error.message)}</p></div>`;
});
