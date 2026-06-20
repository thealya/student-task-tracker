# Edge Function — task-summary

Returns a JSON summary of your tasks:

```json
{ "total": 5, "todo": 2, "in_progress": 1, "done": 2, "overdue": 1 }
```

## Deploy (you run these)

You need the Supabase CLI: https://supabase.com/docs/guides/cli

```bash
# 1. Log in (opens a browser)
supabase login

# 2. Link this folder to your project (find the ref in the dashboard URL
#    or Project Settings -> General -> Reference ID)
supabase link --project-ref hfphxfgrwzqyylodaots

# 3. Deploy the function
supabase functions deploy task-summary
```

After deploying, the function is reachable at:

```
https://hfphxfgrwzqyylodaots.supabase.co/functions/v1/task-summary
```

## Test it from the terminal

```bash
curl -i "https://hfphxfgrwzqyylodaots.supabase.co/functions/v1/task-summary" \
  -H "Authorization: Bearer YOUR-ANON-KEY"
```

The frontend (Step 5 Part B) calls this same URL using your anon key.
