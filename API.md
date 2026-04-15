# PineTask Public API

A small REST API over PineTask's schedule and tasks, intended for external
tools (LLMs, custom scripts, dashboards) to read what's on your plate and
add new work.

**Base URL:** `https://pinetask.com`
(or `http://localhost:8788` when running locally via `wrangler pages dev`)

---

## Authentication

All endpoints require a personal API key passed as a bearer token:

```
Authorization: Bearer ptk_...
```

### Managing your key

Keys are generated from the PineTask UI:

1. Sign in to PineTask.
2. Open **Settings** (profile menu → Settings).
3. Scroll to the **API Key** section.
4. Click **Generate key**. The plaintext key is shown **once** — copy it.
5. To rotate, click **Regenerate**. The old key stops working immediately.
6. To disable, click **Revoke**.

Only a logged-in session (not another API key) can create, regenerate, or
revoke a key.

### Error codes

| Status | Meaning |
|--------|---------|
| `400` | Malformed request body or invalid query params |
| `401` | Missing, invalid, or revoked API key |
| `403` | Action not allowed with this auth method (e.g. rotating the key via an API-key call) |
| `404` | Resource not found |
| `500` | Server error |

---

## Endpoints

### `GET /api/schedule/today`

Returns today's scheduled tasks and the free blocks inside your working
hours. "Today" is resolved in your configured timezone (Settings → Work
Hours uses the same date key).

**Response:**

```json
{
  "date": "2026-04-15",
  "working_hours": { "start": "08:00", "end": "17:00" },
  "scheduled_tasks": [
    {
      "id": "b1e8…",
      "title": "Write API docs",
      "priority": "high",
      "start_time": "09:00",
      "end_time": "09:30",
      "duration_minutes": 30,
      "project": "PineTask",
      "completed": false
    }
  ],
  "free_blocks": [
    { "start": "09:30", "end": "12:00", "duration_minutes": 150 },
    { "start": "13:00", "end": "17:00", "duration_minutes": 240 }
  ]
}
```

**Notes**
- Tasks without a `slot` (not yet time-blocked) still appear in
  `scheduled_tasks` with `start_time: null` and `end_time: null` — they
  don't subtract from the free blocks.
- Completed tasks don't subtract from free blocks either.
- `priority` may be `"high"`, `"medium"`, `"low"`, or `null`.

**Example**

```bash
curl -s https://pinetask.com/api/schedule/today \
  -H "Authorization: Bearer ptk_YOUR_KEY_HERE"
```

---

### `POST /api/schedule/tasks`

Bulk-adds tasks to today's schedule. Optional `suggested_time` places a
task in a specific 15-minute slot; without it, the task is added
unscheduled (it'll show up in the task list but not on the day grid).

**Request body:**

```json
{
  "tasks": [
    {
      "title": "Reply to outstanding emails",
      "priority": "medium",
      "duration_minutes": 30,
      "suggested_time": "09:30",
      "project": "Admin",
      "deadline": "2026-04-18"
    }
  ]
}
```

**Fields**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | ✓ | trimmed; must be non-empty |
| `priority` | `"high"` \| `"medium"` \| `"low"` | | |
| `duration_minutes` | number | | 1..1440. Defaults to 30. Rounded up to the nearest 15. |
| `suggested_time` | `"HH:MM"` | | Rounded down to the nearest 15 minutes |
| `project` | string | | Matched against an existing project by **name**. If no match, the task is created without a project (no error). |
| `deadline` | `"YYYY-MM-DD"` | | Matched against an existing deadline's `due_date`. If no match, the task is created without a deadline. |

Up to **50 tasks per request**.

**Response (`201 Created`):**

```json
{
  "data": [
    {
      "id": "a7c2…",
      "title": "Reply to outstanding emails",
      "priority": "medium",
      "start_time": "09:30",
      "end_time": "10:00",
      "duration_minutes": 30,
      "project": "Admin",
      "deadline": "2026-04-18",
      "date": "2026-04-15",
      "completed": false
    }
  ]
}
```

**Example**

```bash
curl -s -X POST https://pinetask.com/api/schedule/tasks \
  -H "Authorization: Bearer ptk_YOUR_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "tasks": [
      {
        "title": "Write stand-up notes",
        "priority": "low",
        "duration_minutes": 15,
        "suggested_time": "09:00"
      }
    ]
  }'
```

---

### `GET /api/tasks?status=pending|completed|all`

Returns tasks filtered by status across all dates. Defaults to `pending`
when the query param is present but empty (explicit values recommended).

**Query params**

| Param | Values | Default | Notes |
|-------|--------|---------|-------|
| `status` | `pending` \| `completed` \| `all` | (required for the public shape) | |

> The same route also supports the app's internal date-bounded shape
> (`?from=YYYY-MM-DD&to=YYYY-MM-DD`), which remains available with either
> auth method.

**Response:**

```json
{
  "data": [
    {
      "id": "…",
      "text": "Reply to outstanding emails",
      "priority": "medium",
      "date": "2026-04-15",
      "slot": 38,
      "duration": 2,
      "done": 0,
      "project_id": "…",
      "deadline_id": null,
      "team": { "id": "…", "name": "Design", "color": "#5B8C6A" },
      "created_at": 1744716000000,
      "updated_at": 1744716000000
    }
  ]
}
```

The public task shape mirrors the internal schema for simplicity:
`duration` is in 15-minute slots, `slot` is the starting 15-minute block
from midnight (`slot=32` = 08:00), and `done` is `0`/`1`.

**Examples**

```bash
# Pending tasks only
curl -s "https://pinetask.com/api/tasks?status=pending" \
  -H "Authorization: Bearer ptk_YOUR_KEY_HERE"

# Everything I've done
curl -s "https://pinetask.com/api/tasks?status=completed" \
  -H "Authorization: Bearer ptk_YOUR_KEY_HERE"

# Everything, done or not
curl -s "https://pinetask.com/api/tasks?status=all" \
  -H "Authorization: Bearer ptk_YOUR_KEY_HERE"
```

---

## Data model cheat sheet

- **Slots** — PineTask stores times as 15-minute slots from midnight.
  `slot * 15 / 60` = hour, `(slot % 4) * 15` = minutes past the hour.
- **Duration** — number of slots. A 45-minute task has `duration: 3`.
- **Working hours** — configured in Settings → Work Hours. Stored as slot
  indices (`32` = 08:00, `68` = 17:00 by default).

## Out of scope (for now)

- No OAuth — API keys only.
- No rate limiting.
- No webhooks or streaming.
- No multi-user / per-scope keys — one key per user, full account access.
