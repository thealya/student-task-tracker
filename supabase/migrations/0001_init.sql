-- ============================================================
-- Student Task Tracker — Initial schema
-- Steps 1 & 2: data model + table, constraints, index, RLS
-- Single-user app (no login): the anon key is the only "user".
-- ============================================================

-- ---------- STEP 1: Data model ----------
-- The single core table that stores every task.
create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  due_date    date,
  status      text not null default 'todo',
  priority    text not null default 'medium',
  created_at  timestamptz not null default now()
);

-- ---------- STEP 2a: Constraints (backend logic) ----------
-- Reject any status/priority value outside the allowed set,
-- so bad data can never enter the table even via direct inserts.
alter table public.tasks
  add constraint tasks_status_check
  check (status in ('todo', 'in_progress', 'done'));

alter table public.tasks
  add constraint tasks_priority_check
  check (priority in ('low', 'medium', 'high'));

-- ---------- STEP 2b: Index ----------
-- Speeds up the most common query: list/sort tasks by due date.
create index if not exists tasks_due_date_idx
  on public.tasks (due_date);

-- ---------- STEP 2c: Row Level Security ----------
-- RLS is ON. With no login, we grant the anon role full CRUD.
-- NOTE: this means anyone with the project URL + anon key can
-- read/write tasks. Fine for a personal/learning app, not prod.
alter table public.tasks enable row level security;

create policy "anon can read tasks"
  on public.tasks for select
  to anon
  using (true);

create policy "anon can insert tasks"
  on public.tasks for insert
  to anon
  with check (true);

create policy "anon can update tasks"
  on public.tasks for update
  to anon
  using (true)
  with check (true);

create policy "anon can delete tasks"
  on public.tasks for delete
  to anon
  using (true);
