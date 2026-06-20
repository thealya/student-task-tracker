// Edge Function: task-summary
// Returns a JSON summary of the tasks table:
//   { total, todo, in_progress, done, overdue }
// Runs server-side in Supabase's Deno runtime.

import { createClient } from 'jsr:@supabase/supabase-js@2'

// CORS so the browser frontend (different origin) can call this.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

Deno.serve(async (req) => {
  // Handle the browser's CORS preflight request.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // SUPABASE_URL / SUPABASE_ANON_KEY are injected automatically
    // into every Edge Function's environment.
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data, error } = await supabase
      .from('tasks')
      .select('status, due_date')
    if (error) throw error

    const today = new Date().toISOString().slice(0, 10)
    const summary = { total: data.length, todo: 0, in_progress: 0, done: 0, overdue: 0 }

    for (const task of data) {
      if (task.status in summary) summary[task.status]++
      if (task.due_date && task.status !== 'done' && task.due_date < today) {
        summary.overdue++
      }
    }

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
