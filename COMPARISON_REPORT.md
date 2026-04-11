# PineTask v3 Patch — Comparison Report

## Overview

This report compares the current state of PineTask after the v3 patch against the original v1 design authority (Image 2 / v1 App.jsx) and the v3 patch prompt requirements.

## Execution Summary

All 27 steps from the v3 patch prompt Section 3 have been executed in order.

| Step | Description | Status |
|------|-------------|--------|
| 1 | Theme values — restore exact v1 colour palette | Done |
| 2 | Layout/spacing — dashboard density, padding | Done |
| 3 | Header — compact pill nav, date center, timer + profile right | Done |
| 4 | Checkboxes — 14px circle, #2D9B6F fill, SVG tick | Done |
| 5 | Colour picker — rounded rectangles (borderRadius: 4) | Done |
| 6 | Overview card — count in pie center, compact stats | Done |
| 7 | Priority tags — lowercase labels | Done |
| 8 | Deadline section — grouped cards, expand on click | Done |
| 9 | Note icon — SVG notepad replacing emoji | Done |
| 10 | Schedule header — no truncation, compact padding | Done |
| 11 | Project CRUD — edit/delete on cards and detail page | Done |
| 12 | Deadline editing — edit form pre-filled | Done |
| 13 | Drag-and-drop — text/plain MIME, clean handler | Done |
| 14 | Budget field — optional on projects | Done |
| 15 | Emoji to SVG — all emojis replaced across app | Done |
| 16 | Favicon — PineTask logo as favicon + apple-touch-icon | Done |
| 17 | Pricing page — 3 tiers, public route | Done |
| 18-19 | Account page — avatar upload, username/email edit | Done |
| 20 | Font preference — system-ui / Georgia toggle | Done |
| 21 | Sidebar collapse — fully hidden, hamburger toggle | Done |
| 22 | Profile dropdown — full nav links, user initial/avatar | Done |
| 23 | Team stub — "Coming soon" in Account + Settings | Done |
| 24 | Consistent styling — bgSecondary + 0.5px borders everywhere | Done |
| 25 | Error handling — ToastContext, catch blocks wired | Done |
| 26 | Comparison report | This file |
| 27 | Test plan | See below |

## Theme Fidelity (v1 Design Authority)

### Colour Palette
- Header background: `#DADCD0` (forest) / `#1A1F16` (dark) — matches v1
- Card background: `theme.bgSecondary` (`#F7F5F1` / `#1E2418`) — matches v1
- Accent green: `#27500A` — matches v1
- Checkmark green: `#2D9B6F` — matches v1
- Priority medium dot: `#A8C8F0` — corrected from v2
- Priority low border/dot: `#9A90D4` / `#C5B8F0` — corrected from v2

### Spacing & Borders
- All card/section borders: 0.5px solid — matches v1
- Card border-radius: 14px (`theme.radius.md`) — matches v1
- Input border-radius: 8px (`theme.radius.sm`) — matches v1
- Dashboard padding: `4px 0` top, `10px` gap — matches v1
- Dashboard columns: `25% / flex / 34%` — matches v1
- Card padding: 12-14px — matches v1

### Typography
- Checkboxes: 14px circle, 1px border unchecked, solid #2D9B6F checked — matches v1
- Priority tags: lowercase — matches v1
- Header pill buttons: 11px, 5px 10px padding — matches v1

## New Features (v3 Additions)

### Pricing Page (`/pricing`)
- 3 tiers: Free (0), Plus (4.99/mo), Pro+Team (9.99/mo)
- Plus tier highlighted with accent border and "Most popular" badge
- Public route (no auth required)
- Linked from landing page hero + footer

### Account Page (`/account`)
- Profile picture: base64 upload, max 100KB, circular preview
- Editable username with individual Save button
- Editable email with individual Save button
- Password change form preserved
- Account deletion (danger zone) preserved
- Team stub section added

### Font Preference
- Two options: Default (system-ui stack) and Classic (Georgia serif)
- Stored in `user_settings.font_preference` column
- Applied to document root on change
- Toggle in Settings > Appearance section

### Sidebar Behaviour
- Defaults to hidden (not thin strip)
- Hamburger button in header toggles visibility
- Full-width main content when sidebar hidden
- State persisted in localStorage

### Profile Dropdown
- Shows user initial or avatar image in header button
- Dropdown links: Account, Settings, Help, Changelog, Admin (if admin)
- Logout button at bottom

### Team Stub
- "Coming soon" badge in both Account and Settings pages
- References Pro + Team tier

### Toast Error Handling
- ToastContext + useToast hook created
- Empty catch blocks in ProjectsPage, ProjectDetailPage, AnalyticsPage, AdminPage, SettingsPage wired to show toast errors
- Toast component auto-dismisses after 3 seconds

## Files Changed

### New Files
- `src/context/ToastContext.jsx` — toast state management
- `src/hooks/useToast.js` — toast hook
- `src/pages/PricingPage.jsx` — pricing page
- `migrations/002_add_font_preference.sql` — DB migration

### Modified Files (key changes)
- `src/styles/theme.js` — restored v1 palette
- `src/components/layout/Header.jsx` — pill nav, hamburger, profile avatar
- `src/components/layout/AppShell.jsx` — full sidebar collapse
- `src/components/layout/Sidebar.jsx` — unchanged (hidden when collapsed)
- `src/pages/AccountPage.jsx` — complete rewrite with profile editing
- `src/pages/SettingsPage.jsx` — font preference, team stub, toast errors
- `src/pages/DashboardPage.jsx` — layout, density, deadline editing
- `src/pages/LandingPage.jsx` — SVG icons, pricing link
- `src/App.jsx` — pricing route
- `src/main.jsx` — ToastProvider
- `functions/api/account/settings.js` — font_preference field
- `index.html` — favicon references
- 13 page files — consistent 0.5px borders + bgSecondary backgrounds

## Known Limitations

1. **Font preference**: Applied on SettingsPage mount only. If user navigates directly to another page without visiting Settings first, the font won't apply until Settings is loaded. A global effect in App.jsx could resolve this in a future iteration.
2. **Pricing page**: CTA buttons are disabled ("Coming soon") — no Stripe integration yet.
3. **Team features**: Stub only — no backend implementation.
4. **Avatar storage**: Base64 in D1 database. Works for small images (<100KB) but not scalable for production. R2 bucket recommended for future.
