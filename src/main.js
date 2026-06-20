import { listTasks, addTask, updateTask, deleteTask, getTaskSummary } from './api.js'

const STATUSES = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
}

let tasks = []
let activeFilter = 'all'

const listEl = document.getElementById('task-list')
const emptyEl = document.getElementById('empty-state')
const formEl = document.getElementById('task-form')
const filtersEl = document.getElementById('filters')
const dashboardEl = document.getElementById('dashboard')

// --- Helpers ---------------------------------------------------------------

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]))
}

function isOverdue(task) {
  if (!task.due_date || task.status === 'done') return false
  const today = new Date().toISOString().slice(0, 10)
  return task.due_date < today
}

// --- Rendering -------------------------------------------------------------

function render() {
  const visible =
    activeFilter === 'all'
      ? tasks
      : tasks.filter((t) => t.status === activeFilter)

  emptyEl.hidden = visible.length > 0
  listEl.innerHTML = visible.map(renderCard).join('')
}

function renderCard(task) {
  const overdue = isOverdue(task)
  const statusOptions = Object.entries(STATUSES)
    .map(
      ([value, label]) =>
        `<option value="${value}" ${value === task.status ? 'selected' : ''}>${label}</option>`
    )
    .join('')

  return `
    <article class="task-card ${task.status === 'done' ? 'is-done' : ''}" data-id="${task.id}">
      <div class="task-title">${escapeHtml(task.title)}</div>
      ${task.description ? `<div class="task-desc">${escapeHtml(task.description)}</div>` : ''}
      <div class="task-meta">
        <span class="badge badge-priority-${task.priority}">${task.priority}</span>
        ${
          task.due_date
            ? `<span class="due ${overdue ? 'overdue' : ''}">Due ${task.due_date}${overdue ? ' (overdue)' : ''}</span>`
            : ''
        }
      </div>
      <div class="task-actions">
        <select data-action="status">${statusOptions}</select>
        <button class="btn btn-danger" data-action="delete">Delete</button>
      </div>
    </article>
  `
}

// Dashboard: 3 focused stats (Total, Overdue, Done).
// Overdue card is highlighted red when greater than zero.
function renderDashboard(summary) {
  const overdueAlert = summary.overdue > 0 ? ' overdue-alert' : ''
  dashboardEl.innerHTML = `
    <div class="stat">
      <div class="num">${summary.total}</div>
      <div class="label">Total</div>
    </div>
    <div class="stat${overdueAlert}">
      <div class="num">${summary.overdue}</div>
      <div class="label">Overdue</div>
    </div>
    <div class="stat">
      <div class="num">${summary.done}</div>
      <div class="label">Done</div>
    </div>
  `
  dashboardEl.hidden = false
}

// --- Data flow -------------------------------------------------------------

async function refresh() {
  try {
    tasks = await listTasks()
    render()
  } catch (err) {
    console.error('Failed to load tasks:', err)
    listEl.innerHTML = `<p class="empty-state">Could not load tasks. Check your Supabase config.</p>`
  }
  // Dashboard is best-effort: if the Edge Function isn't deployed yet,
  // the app still works without it.
  try {
    const summary = await getTaskSummary()
    renderDashboard(summary)
  } catch (err) {
    console.warn('Task summary unavailable (is the Edge Function deployed?):', err)
    dashboardEl.hidden = true
  }
}

// --- Events ----------------------------------------------------------------

formEl.addEventListener('submit', async (e) => {
  e.preventDefault()
  const fields = {
    title: document.getElementById('title').value.trim(),
    description: document.getElementById('description').value.trim() || null,
    due_date: document.getElementById('due_date').value || null,
    priority: document.getElementById('priority').value,
  }
  if (!fields.title) return
  try {
    await addTask(fields)
    formEl.reset()
    await refresh()
  } catch (err) {
    console.error('Failed to add task:', err)
    alert('Could not add task. See console for details.')
  }
})

filtersEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.filter')
  if (!btn) return
  activeFilter = btn.dataset.filter
  filtersEl.querySelectorAll('.filter').forEach((b) =>
    b.classList.toggle('is-active', b === btn)
  )
  render()
})

listEl.addEventListener('click', async (e) => {
  const card = e.target.closest('.task-card')
  if (!card) return
  const id = card.dataset.id
  if (e.target.dataset.action === 'delete') {
    try {
      await deleteTask(id)
      await refresh()
    } catch (err) {
      console.error('Failed to delete task:', err)
    }
  }
})

listEl.addEventListener('change', async (e) => {
  if (e.target.dataset.action !== 'status') return
  const card = e.target.closest('.task-card')
  const id = card.dataset.id
  try {
    await updateTask(id, { status: e.target.value })
    await refresh()
  } catch (err) {
    console.error('Failed to update status:', err)
  }
})

// --- Start -----------------------------------------------------------------
refresh()
