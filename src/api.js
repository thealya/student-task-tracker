import { supabase } from './supabaseClient.js'

// All database access for the `tasks` table lives here.

// List every task, newest-due first (nulls last), then by creation.
export async function listTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// Create a new task. `fields` = { title, description, due_date, priority }.
export async function addTask(fields) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([fields])
    .select()
    .single()
  if (error) throw error
  return data
}

// Update an existing task by id with a partial set of fields.
export async function updateTask(id, fields) {
  const { data, error } = await supabase
    .from('tasks')
    .update(fields)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// Delete a task by id.
export async function deleteTask(id) {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}

// Call the task-summary Edge Function. Returns
// { total, todo, in_progress, done, overdue }. The client adds the
// anon key + auth headers automatically.
export async function getTaskSummary() {
  const { data, error } = await supabase.functions.invoke('task-summary')
  if (error) throw error
  return data
}
