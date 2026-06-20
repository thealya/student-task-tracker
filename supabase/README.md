# Supabase Setup — Student Task Tracker

This folder holds the database setup. Steps 1 & 2 of the project.

## What you do in the Supabase dashboard

1. Go to https://supabase.com and sign in (create a free account if needed).
2. Click **New project**. Pick a name (e.g. `student-task-tracker`),
   set a database password, choose a region, and create it.
3. Wait for the project to finish provisioning (~1–2 min).
4. In the left sidebar open **SQL Editor** → **New query**.
5. Open [`migrations/0001_init.sql`](migrations/0001_init.sql), copy its
   entire contents, paste into the editor, and click **Run**.
   - You should see "Success. No rows returned."
6. Verify: left sidebar → **Table Editor** → you should see a `tasks` table.

## Keys you'll need for the frontend (Step 4)

In the dashboard: **Project Settings → API**. Copy these two values:

- **Project URL** → e.g. `https://xxxxxxxx.supabase.co`
- **anon public** key (a long token)

Keep them handy — we'll put them in the frontend `.env` file in Step 4.

> Security note: with no login, the anon key + permissive RLS policies
> mean anyone who has the URL + anon key can read/write tasks. That's
> acceptable for a personal/learning project only.
