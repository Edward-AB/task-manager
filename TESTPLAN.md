# PineTask Manual Test Plan

**Version:** 1.0
**Date:** 2026-04-11
**Application:** PineTask (React SPA)
**Total Items:** 171

---

## How to Use

Run through each row in sequence. Mark PASS / FAIL in a copy of this table. For failures, note the browser, viewport, and a brief description of the observed behaviour.

---

## 1. Authentication (15 items)

| # | Category | Test | Expected Result |
|---|----------|------|-----------------|
| 1 | Auth | Navigate to `/login` and submit valid email and password | User is redirected to `/dashboard`; JWT token is stored |
| 2 | Auth | Submit login form with incorrect password | Error message "Invalid email or password" is displayed; form remains on screen |
| 3 | Auth | Submit login form with empty fields | Browser native validation prevents submission; required-field hints appear |
| 4 | Auth | Navigate to `/signup` and register a new account with valid details | Account is created; user is redirected to `/onboarding` or `/dashboard` |
| 5 | Auth | Attempt signup with an already-registered email | Error message is displayed indicating the email is taken |
| 6 | Auth | Attempt signup with a weak or empty password | Appropriate validation error is shown |
| 7 | Auth | Click "Forgot password?" link on login page | User is navigated to `/reset-password` page |
| 8 | Auth | Submit password reset form with a registered email | Success message is displayed; reset email is sent |
| 9 | Auth | Open `/reset-password/:token` with a valid token and set a new password | Password is updated; user can log in with the new password |
| 10 | Auth | Open `/verify-email/:token` with a valid verification token | Email is verified; success message is shown |
| 11 | Auth | Open `/verify-email/:token` with an invalid or expired token | Error message is shown indicating the token is invalid |
| 12 | Auth | After login, close the tab, reopen the app, and navigate to `/dashboard` | User remains authenticated (token persisted); dashboard loads |
| 13 | Auth | Click the logout action from the profile dropdown | User is logged out; redirected to `/login`; token is removed from storage |
| 14 | Auth | With no active session, navigate directly to `/dashboard` | ProtectedRoute redirects the user to `/login` |
| 15 | Auth | With a non-admin account, navigate directly to `/admin` | AdminRoute redirects the user to `/dashboard` |

---

## 2. Onboarding (5 items)

| # | Category | Test | Expected Result |
|---|----------|------|-----------------|
| 16 | Onboarding | Step 1: Verify welcome screen shows username and "Let's set things up" button | Welcome message displays `@username`; progress bar shows Step 1 of 4 at 0% |
| 17 | Onboarding | Step 2: Select a role (Student, Professional, or Team Lead) | Role card is highlighted; work hours are pre-filled with the role's defaults; advances to Step 3 |
| 18 | Onboarding | Step 3: Adjust work-hour start and end selectors | Visual bar preview updates in real time to reflect the selected range; "Continue" button advances to Step 4 |
| 19 | Onboarding | Step 4: Enter a project name, choose a colour, and click "Get started" | Project is created via API; work-hour settings are saved; user is navigated to `/dashboard` |
| 20 | Onboarding | Step 4: Click "Skip for now" without entering a project name | No project is created; settings are saved; user is navigated to `/dashboard` |

---

## 3. Dashboard Layout (8 items)

| # | Category | Test | Expected Result |
|---|----------|------|-----------------|
| 21 | Layout | Open dashboard at >= 768 px wide viewport | Three-column layout is displayed: left (greeting, overview, deadlines), middle (day note, add task, task list), right (day schedule) |
| 22 | Layout | Resize viewport below the narrow breakpoint | Layout collapses to a single-column stacked layout; sidebar is hidden |
| 23 | Layout | Verify date header shows today's formatted date | The `<h2>` above the columns displays the current date in human-readable format |
| 24 | Layout | Click the date forward arrow in the GreetingCard | Date advances by one day; task list and schedule reload for the new date |
| 25 | Layout | Click the date backward arrow in the GreetingCard | Date goes back by one day; task list and schedule reload for the new date |
| 26 | Layout | Verify loading skeleton appears on initial load | Animated pulse skeleton placeholders render in the three-column grid while data is fetching |
| 27 | Layout | Toggle the calendar view (week strip) in the GreetingCard | The `calView` switches between available views; WeekStrip or MonthCalendar renders accordingly |
| 28 | Layout | Verify the OverviewCard displays task completion stats | MiniPie or StatsGrid shows done count vs total for the selected day |

---

## 4. Tasks (25 items)

| # | Category | Test | Expected Result |
|---|----------|------|-----------------|
| 29 | Tasks | Type a task name in AddTaskForm and press Enter / click "Add task" | New task appears in the TaskList for the current date |
| 30 | Tasks | Attempt to add a task with empty text | Nothing happens; form does not submit |
| 31 | Tasks | Click the checkbox on an incomplete task | Task is marked done; checkbox fills with accent colour and checkmark; text gets strikethrough; tick sound plays |
| 32 | Tasks | Click the checkbox on a completed task | Task is unmarked; checkbox returns to empty; strikethrough is removed |
| 33 | Tasks | Hover over a task item and click the delete button (x) | Task is removed from the list; API DELETE call is sent |
| 34 | Tasks | Set priority to High before adding a task | Task appears with a red-tinted priority tag labelled "High" and a coloured left border |
| 35 | Tasks | Set priority to Medium before adding a task | Task appears with an amber/yellow priority tag labelled "Medium" |
| 36 | Tasks | Set priority to Low before adding a task | Task appears with a blue/green priority tag labelled "Low" |
| 37 | Tasks | Toggle priority off (click active priority again) before adding a task | Task is created with no priority tag |
| 38 | Tasks | Use the colour picker to select a non-default colour before adding a task | Task row background and border adopt the chosen colour from the TaskColorPicker |
| 39 | Tasks | Change the duration dropdown to 60m (4 slots) before adding a task | Task shows "60m" label; when scheduled, it spans 4 quarter-hour slots in the day schedule |
| 40 | Tasks | Select a deadline from the dropdown before adding a task | Task is linked to the deadline; deadline badge appears on the task item |
| 41 | Tasks | Select a project from the dropdown before adding a task | Task is linked to the project; appears in the project detail page |
| 42 | Tasks | Double-click a task's text | Inline edit input appears with the current text; cursor is in the field |
| 43 | Tasks | Edit the inline text and press Enter | Task text is updated; input closes; API PATCH is sent with the new text |
| 44 | Tasks | Edit the inline text and click away (blur) | Task text is updated on blur; input closes |
| 45 | Tasks | Hover over a task and click the "move to tomorrow" arrow button | Task disappears from today's list; slot is cleared; task date is set to tomorrow |
| 46 | Tasks | Hover over a task and click the note icon button | NoteModal opens for that task |
| 47 | Tasks | In the NoteModal, type a note and click save | Note is saved; note icon appears on the task item; modal closes |
| 48 | Tasks | Drag a task from the task list onto the day schedule panel | Task is scheduled at the drop position; `slot` is set; task appears as a block in the schedule |
| 49 | Tasks | Drag a scheduled task from the day schedule back to the unscheduled task list area | Task's `slot` is set to null; task reappears as unscheduled in the task list |
| 50 | Tasks | Drag a task item to begin the drag operation | `dataTransfer` is set with the task ID; drag preview is visible |
| 51 | Tasks | Verify DayNoteCard displays and saves the day note | Typing in the DayNoteCard textarea and saving persists the note via the `/api/day-notes` endpoint |
| 52 | Tasks | Switch to a different date and back | Tasks reload for each date; previously added tasks appear on their respective dates |
| 53 | Tasks | Add multiple tasks and verify ordering | Tasks appear in creation order in the task list |

---

## 5. Day Schedule (20 items)

| # | Category | Test | Expected Result |
|---|----------|------|-----------------|
| 54 | Schedule | Open the dashboard and verify the schedule panel scrolls to 6:00 AM | On mount, the scroll position is set so 06:00 is near the top of the visible area |
| 55 | Schedule | Verify hour labels are displayed from 00:00 to 23:00 | All 24 hour labels appear on the left side of the timeline with horizontal rule lines |
| 56 | Schedule | Verify working hours are highlighted | The time range defined by `DEFAULT_WORK_START` to `DEFAULT_WORK_END` has a distinct background colour |
| 57 | Schedule | Verify the "now line" appears on today's schedule | A horizontal accent-coloured line is positioned at the current time; it is not visible on other dates |
| 58 | Schedule | Navigate to a date that is not today | The now line does not render on the schedule |
| 59 | Schedule | Drop a task onto the 09:00 slot | Task block appears at 09:00 with the correct height based on its duration |
| 60 | Schedule | Drop a task onto the 14:30 slot | Task block snaps to the 14:30 position (slot 58) correctly |
| 61 | Schedule | Drop two non-overlapping tasks (e.g., 09:00 and 11:00) | Both blocks render in full width, side by side is not needed |
| 62 | Schedule | Schedule two tasks with overlapping time slots | `computeColumns` places them in separate columns; both blocks are visible and narrower |
| 63 | Schedule | Schedule three overlapping tasks | All three render in their own columns; column widths are evenly divided |
| 64 | Schedule | Click on a scheduled task's checkbox in the calendar | Task is toggled done/undone; the CalendarTask block reflects the new state |
| 65 | Schedule | Verify blocked times are displayed | BlockedTimeSlot renders with a distinct hatched or dimmed appearance for each blocked-time entry |
| 66 | Schedule | Verify recurring blocked times appear on every day | Blocked times with `recurring: true` display regardless of the selected date |
| 67 | Schedule | Verify the schedule header shows the correct scheduled-task count | The header reads "N tasks" matching the number of tasks with a non-null slot for the current day |
| 68 | Schedule | Scroll the schedule fully to the top (00:00) | The scroll reaches the very top; 00:00 label is visible |
| 69 | Schedule | Scroll the schedule fully to the bottom (23:00) | The scroll reaches the bottom of the 24-hour timeline |
| 70 | Schedule | Click inside the schedule area (not on a task) | `onSlotClick` is called with the correct slot number based on click Y position |
| 71 | Schedule | Click inside the hour-label gutter (left of the timeline) | No slot click fires (guarded by `x < CALENDAR_LABEL_WIDTH` check) |
| 72 | Schedule | Verify a task's colour in the schedule matches its deadline colour | `getTaskColor` returns the deadline theme colour; CalendarTask block uses it for background and border |
| 73 | Schedule | Verify events appear on the schedule via CalendarEvent | Events fetched for the week render as blocks in their time slots with their assigned colour |

---

## 6. Deadlines (10 items)

| # | Category | Test | Expected Result |
|---|----------|------|-----------------|
| 74 | Deadlines | Click the "+" button in the deadline list header | DeadlineForm appears inline below the header |
| 75 | Deadlines | Fill out the deadline form (title, start date, due date, colour) and submit | New deadline appears in the list with the chosen colour; API POST is sent |
| 76 | Deadlines | Delete a deadline by expanding it and clicking the "Delete" button | Deadline is removed from the list; API DELETE is sent |
| 77 | Deadlines | Create deadlines under different projects | Deadlines are grouped by project name in the list; ungrouped deadlines appear separately |
| 78 | Deadlines | Link tasks to a deadline and verify progress pie | The mini pie/circle icon fills proportionally to the done/total task ratio |
| 79 | Deadlines | Mark all linked tasks as done | The deadline pie shows 100% complete with a checkmark icon |
| 80 | Deadlines | Verify an overdue deadline (past due date, incomplete tasks) | "OVERDUE" label appears in red on the deadline item |
| 81 | Deadlines | Verify deadline colour matches the chosen colour index | Background, border, and text use the `theme.deadline[color_idx]` palette |
| 82 | Deadlines | Click a deadline item to expand it | Expanded view shows date range, linked tasks with done/undone indicators, and Edit/Delete buttons |
| 83 | Deadlines | Click an expanded deadline item again | The expanded section collapses; only the summary row is visible |

---

## 7. Events (5 items)

| # | Category | Test | Expected Result |
|---|----------|------|-----------------|
| 84 | Events | Open the event form and create an event with title, date, start time, end time, and colour | Event appears in the event list and on the day schedule as a coloured block |
| 85 | Events | Attempt to create an event with end time before start time | Error "End time must be after start time" is displayed; form does not submit |
| 86 | Events | Edit an existing event (hover and click the edit pencil icon) | EventForm populates with current values; submitting updates the event |
| 87 | Events | Delete an event (hover and click the delete x icon) | Event is removed from the list and the schedule; API DELETE is sent |
| 88 | Events | Verify that events do not have a checkbox | EventItem renders a calendar icon but no toggle/checkbox control |

---

## 8. Projects (10 items)

| # | Category | Test | Expected Result |
|---|----------|------|-----------------|
| 89 | Projects | Navigate to `/projects` and verify the project list loads | Project cards display with name, description, task count, deadline count, and progress bar |
| 90 | Projects | Click "New project" and fill out the form (name, description, colour) | New project card appears in the grid; API POST is sent |
| 91 | Projects | Attempt to create a project with an empty name | Form does not submit; project is not created |
| 92 | Projects | Click a project card to navigate to `/projects/:id` | ProjectDetailPage loads with the project name, colour dot, and description |
| 93 | Projects | On the project detail page, verify the "manage" tab is active by default | ProjectSidebar and ProjectDetail components render |
| 94 | Projects | Switch to the "analytics" tab on the project detail page | ProjectAnalytics and GanttChart components render |
| 95 | Projects | Verify the Gantt chart renders deadline timelines | GanttChart shows horizontal bars for each deadline within the project |
| 96 | Projects | Use the search input on the projects page to filter by name | Only projects whose name contains the search string are displayed |
| 97 | Projects | Clear the search input | All projects are shown again |
| 98 | Projects | Delete a project (confirm dialog appears) | Project is removed after confirmation; API DELETE is sent; card disappears |

---

## 9. Timer (10 items)

| # | Category | Test | Expected Result |
|---|----------|------|-----------------|
| 99 | Timer | Click the timer clock icon in the header | TimerPopup appears below the button with preset buttons (5m, 15m, 25m, 30m, 1h, 2h) |
| 100 | Timer | Select the 25m preset and click "Start Timer" | Timer begins counting down from 25:00; header button shows a green countdown with pulsing dot |
| 101 | Timer | Click "Pause" while the timer is running | Timer pauses; countdown freezes; button text changes to "Resume"; colour changes to warning/yellow |
| 102 | Timer | Click "Resume" while the timer is paused | Timer resumes counting down from where it was paused; colour returns to green |
| 103 | Timer | Click "+1m" while the timer is running | 60 seconds are added to the remaining time |
| 104 | Timer | Click "+5m" while the timer is running | 300 seconds are added to the remaining time |
| 105 | Timer | Use the minus/plus buttons to adjust minutes before starting | Timer preset value decreases or increases by 5; minimum is 1 minute |
| 106 | Timer | Double-click the minute number to enter custom value, type a number, and press Enter | Custom minute value is accepted; timer can be started with that value |
| 107 | Timer | Let the timer reach 0:00 | TimerAlarmModal appears with "Time's up!" heading; alarm sound plays repeatedly every 3 seconds; header button shows red pulsing "Timer Done!" badge |
| 108 | Timer | In the alarm modal, click "Repeat" | Timer restarts with the same duration; alarm stops; modal closes |

---

## 10. Celebration (3 items)

| # | Category | Test | Expected Result |
|---|----------|------|-----------------|
| 109 | Celebration | Complete the last remaining task for the current day | CelebrationOverlay activates: confetti particles animate on a full-screen canvas; celebration sound plays |
| 110 | Celebration | Wait for the celebration animation to finish (~3 seconds) | Canvas fades out and is removed; `onDone` callback fires; overlay disappears |
| 111 | Celebration | In Settings, toggle "Celebrations" off, then complete all tasks for a day | No celebration overlay or sound plays (behaviour respects the setting) |

---

## 11. Theme (5 items)

| # | Category | Test | Expected Result |
|---|----------|------|-----------------|
| 112 | Theme | On the Settings page, click the theme toggle button | Theme switches between "forest" (light) and "dark" modes; all surfaces, text, and borders update |
| 113 | Theme | After toggling theme, refresh the page | The selected theme persists (read from localStorage under the THEME_KEY) |
| 114 | Theme | In dark mode, verify all page elements are styled | Backgrounds are dark; text is light; borders, inputs, buttons, and cards use dark-mode palette |
| 115 | Theme | In light/forest mode, verify all page elements are styled | Backgrounds are light earthy tones; text is dark; accent colours are forest green |
| 116 | Theme | Toggle the theme and observe CSS transitions | Background and colour changes animate smoothly using the `theme.transition` timing |

---

## 12. Analytics (3 items)

| # | Category | Test | Expected Result |
|---|----------|------|-----------------|
| 117 | Analytics | Navigate to `/analytics` with existing task data | Stats grid shows Total Tasks, Completed, Completion Rate, Current Streak, Longest Streak, and Tasks This Week; 30-Day Productivity chart renders bars; Activity Heatmap renders coloured cells; Priority Breakdown chart and Task Distribution chart render |
| 118 | Analytics | Verify charts render correctly with data | ProductivityChart shows a bar for each day; CompletionHeatmap shows colour-coded squares; PriorityBreakdown shows proportional segments for High/Medium/Low/None; ProjectProgress shows progress bars per project |
| 119 | Analytics | Navigate to `/analytics` with a new account (no tasks) | Empty states or zero-value displays render gracefully; no errors in the console |

---

## 13. Account & Settings (5 items)

| # | Category | Test | Expected Result |
|---|----------|------|-----------------|
| 120 | Account | Navigate to `/account` and verify profile card | Username, email, and "Member since" date are displayed correctly |
| 121 | Account | Fill out the change-password form with matching new passwords and correct current password | "Password changed successfully" message appears; fields are cleared |
| 122 | Account | Fill out the change-password form with mismatched new passwords | "Passwords do not match" error is displayed; API call is not made |
| 123 | Account | Click "Delete my account", type the username to confirm, and click "Permanently delete" | Account is deleted; user is logged out and redirected to the landing page |
| 124 | Settings | On the Settings page, change work hours, toggle sounds, toggle celebrations, and change default task duration | Each setting is saved to the API; "Saved" indicator appears briefly after each change |

---

## 14. Admin (4 items)

| # | Category | Test | Expected Result |
|---|----------|------|-----------------|
| 125 | Admin | Log in as an admin user and navigate to `/admin` | Admin page loads; stats cards show Total Users, Total Tasks, Active (7d), and Signups This Week |
| 126 | Admin | Verify the users table displays username, email, task count, join date, and admin status | Table renders all columns; admin users show "Yes" in the Admin column |
| 127 | Admin | Type in the search input on the admin page | User table filters to show only users matching the search query; page resets to 1 |
| 128 | Admin | If more than 20 users exist, click "Next" pagination button | Table loads the next page of users; "Previous" button becomes enabled; page number increments |

---

## 15. Routing (5 items)

| # | Category | Test | Expected Result |
|---|----------|------|-----------------|
| 129 | Routing | Type `/dashboard` directly in the browser address bar while authenticated | Dashboard page loads without errors (SPA catch-all serves index.html) |
| 130 | Routing | Type `/projects/some-id` directly in the browser address bar while authenticated | ProjectDetailPage loads for the given project ID |
| 131 | Routing | Navigate to a non-existent route (e.g., `/this-does-not-exist`) | NotFoundPage renders with "Page not found" message and a "Go home" link |
| 132 | Routing | While unauthenticated, navigate to `/settings` | ProtectedRoute redirects to `/login` |
| 133 | Routing | After login, use browser back/forward buttons to navigate | React Router handles history correctly; pages render without full-page reloads |

---

## 16. Teams (20 items)

| # | Category | Test | Expected Result |
|---|----------|------|-----------------|
| 134 | Teams | Navigate to `/teams` with no teams yet | EmptyTeams card displays with "Create your first team" CTA and a teams-intro illustration |
| 135 | Teams | Create a new team with a name, description, and colour | Team appears in the TeamSelector; current user is listed as `owner` in the member list |
| 136 | Teams | Attempt to create a team with an empty name | Submit button is disabled or form shows a validation error; no API POST is made |
| 137 | Teams | From an existing team, click "Invite" and generate an invitation link | A share-able `/invite/:token` URL is produced and shown with a Copy button |
| 138 | Teams | Open the invite link `/invite/:token` in a signed-out browser | Page loads publicly, shows team info; clicking "Accept" redirects to `/login?invite=:token` |
| 139 | Teams | Open the invite link while signed in as a non-member | Page shows team name, inviter, member count, and Accept / Decline buttons |
| 140 | Teams | Click "Accept" on a valid invite as a signed-in user | User is added as a member (role `member`); redirected to `/teams?selected=:id` |
| 141 | Teams | Click "Decline" on a valid invite | Invitation is marked declined; redirected to `/dashboard` without joining |
| 142 | Teams | Open an expired or already-used invite link | Page shows "Invitation unavailable" with an explanation |
| 143 | Teams | As team owner, change a member's role from `member` to `admin` | Member's RoleBadge updates to "admin"; PATCH request is sent |
| 144 | Teams | As team owner, remove a member from the team | Member disappears from the list; confirmation prompt appears before removal |
| 145 | Teams | As non-owner member, verify role-change and remove actions are hidden | Role select and remove button do not render for a `member` viewing the list |
| 146 | Teams | Leave a team as a non-owner member | Member is removed from the team; team disappears from selector; redirect to `/teams` empty state if it was the last team |
| 147 | Teams | Attempt to leave a team as the sole owner | Action is blocked with a message like "Transfer ownership first"; team remains |
| 148 | Teams | Delete a team as the owner (from Team Info card) | Team is removed; selector shows remaining teams; confirmation modal requires explicit confirm |
| 149 | Teams | Assign a team to a project via ProjectTeamSection `+ Assign` button | Team appears in the assigned list; `/api/projects/:id/team` POST succeeds |
| 150 | Teams | Unassign a team from a project (click the × on the assignment row) | Team is removed from the list; DELETE request succeeds |
| 151 | Teams | Create a task with an assigned team via AddTaskForm's team select | Task is created, then `POST /api/tasks/:id/assign` runs; team pill appears on the task in TaskList |
| 152 | Teams | Open `/teams/:id/schedule` as a team member | SchedulingAssistant loads the week view with shared members' tasks, respecting private-task privacy |
| 153 | Teams | Drag-and-drop a task onto a time slot in the scheduling assistant | Task is scheduled (API PATCH on slot + date); view updates immediately |

---

## 17. Messaging (15 items)

| # | Category | Test | Expected Result |
|---|----------|------|-----------------|
| 154 | Messaging | Click the Messages button in the header with no unread | Drawer slides in from the right (250ms ease); no badge on the button |
| 155 | Messaging | Click the Messages button while unread messages exist | Badge shows unread total (capped at `9+`); drawer opens on click |
| 156 | Messaging | With the drawer open, press `Escape` | Drawer closes via transform slide-out; backdrop fades out |
| 157 | Messaging | Click a team-mate avatar in the ContactSidebar (no prior convo) | A new conversation is created and opened; ChatView shows "No messages yet. Say hi!" |
| 158 | Messaging | Click an avatar that already has a conversation | Existing conversation opens; no duplicate is created |
| 159 | Messaging | Type a message and press Enter in MessageInput | Message is appended optimistically; bubble shows at 70% opacity, then solid when the POST resolves |
| 160 | Messaging | Force a network error on send (offline / blocked) | Message bubble shows "Failed to send" with a "Retry" link under the timestamp |
| 161 | Messaging | Click the "Retry" link on a failed message | Bubble returns to optimistic state and re-POSTs; becomes permanent on success |
| 162 | Messaging | Receive a new message while the drawer is open and conversation is active | New bubble appends within 5s (polling); list auto-scrolls to bottom if user was near bottom |
| 163 | Messaging | Receive a new message while scrolled up | "New message ↓" floating button appears; clicking it scrolls to bottom |
| 164 | Messaging | Receive a new message with the drawer closed | NewMessageToast slides in from the bottom-right, auto-dismisses after 4.5s; clicking opens the conversation |
| 165 | Messaging | Open the drawer, collapse the conversation list using the chevron button | List hides; ChatView takes the full width of the drawer body |
| 166 | Messaging | Scroll to the top of a long conversation | `onLoadMore` fires with `?before=:oldestId`; older messages prepend without scroll jump |
| 167 | Messaging | Send a message containing a URL (e.g. `https://example.com`) | URL renders as an underlined link that opens in a new tab with `rel="noopener noreferrer"` |
| 168 | Messaging | Send an emoji-only message (e.g. `🎉🎉`) | Bubble renders the emojis at 28 px font size with reduced padding (`4px 8px`) |

---

## 18. Cross-Browser (3 items)

| # | Category | Test | Expected Result |
|---|----------|------|-----------------|
| 169 | Cross-Browser | Run full test plan in latest Google Chrome | All tests pass; no layout or rendering issues |
| 170 | Cross-Browser | Run full test plan in latest Mozilla Firefox | All tests pass; no layout or rendering issues; CSS transitions and flexbox behave identically |
| 171 | Cross-Browser | Run full test plan in latest Apple Safari | All tests pass; no layout or rendering issues; date inputs and scroll behaviour work correctly |
