Event Countdown

React 18 + Vite + React Router (unchanged architecture). This release adds real authentication,
a working notification system, live public holidays, one global search bar and a consistent design system.

## Run locally (Windows PowerShell or any shell)

```powershell
npm install
npm run dev        # http://localhost:5173
npm run build      # production build check
```

## Enable real authentication (Supabase)

The app uses **Supabase Auth** through the official `@supabase/supabase-js` client. No keys are included in this
project, so live sign-in is **not active until you add yours**:

1. Create a free project at <https://supabase.com>.
2. *Authentication → Providers → Email*: keep Email enabled. Decide whether "Confirm email" is on
   (on = new users must click a link before signing in; the app handles both).
3. *Authentication → URL Configuration*: add `http://localhost:5173` as Site URL / redirect URL
   (and your deployed URL later).
4. Copy `.env.example` to `.env` and paste *Project URL* and the *anon public* key
   (*Project Settings → API*). Restart `npm run dev`.

Until `.env` is filled in, the sign-in page says so and offers **Local mode**: no account, no password,
data stays in this browser. Local mode is clearly labelled and is *not* authentication.

What the auth layer does: sign-up, sign-in, sign-out, email/password validation (8+ chars, letter + number),
show/hide password, loading and error states, protected routes (everything except `/login`), persisted sessions
(supabase-js stores and auto-refreshes the session), a "your session expired" message when a session ends unexpectedly,
and profile display-name editing. Passwords never touch this app's storage — Supabase handles them.

### Per-account data and migration

* Each account's events, notifications and settings live under account-specific localStorage keys
  (`event-countdown:events::u-<userId>` etc.), and all per-user React state is discarded when the user changes.
* **Your existing events are not deleted or moved.** They stay under the original keys. The first time you sign in to an
  account the dashboard offers *"Import N events found on this device"* — a copy is made only if you click Import.
* Old records are migrated in memory on load (the old single `reminder` value becomes the new `reminders` list).
* **Limitations:** data is still stored in the browser, not in the cloud, so it does not sync between devices and
  clearing browser data removes it. Per-account separation here is logical (keys + state), not encryption; someone
  with access to the browser's developer tools could read local storage. Because the legacy events were never private,
  any account on the same browser can choose to import them. Cloud sync would need a Supabase table with Row Level
  Security — not implemented in this version.

## Notifications

* Types: reminders before events, events happening today, upcoming events (within 3 days), unfinished
  preparation tasks (max once per event per day) and public-holiday heads-ups.
* Notification centre at `/notifications` (+ bell dropdown): unread count, read/unread, mark all read, delete,
  clear read / clear all, filters, empty state; clicking one opens its event.
* Reminders are per event (1 day / 1 hour / 10 minutes / custom) with defaults in Settings. Times are computed from the
  event's stored instant by `src/lib/datetime.js`; editing or deleting an event re-evaluates reminders and removes
  notifications that no longer apply. A ledger keyed by *event + start time + interval* prevents duplicates, even after reloads.
* If you open the app after several reminder times have passed, only the most recent one is shown (no spam).
* Browser notifications use the Notifications API. Permission is requested **only** when you click
  *Enable browser notifications* in Settings; denied/unsupported states are explained; in-app toasts and the
  notification centre always work as a fallback.
* **Limits:** timers run only while Evently is open in a browser tab. A closed browser/tab (or a sleeping phone) cannot
  fire anything; missed reminders appear next time you open the app. Reliable background delivery needs a service worker +
  push service + a scheduled server job, which are not part of this local app. Some mobile browsers only allow
  notifications from service workers, so there you will see in-app notifications only.

## Public holidays

Data comes from the free [Nager.Date](https://date.nager.at) API (`/api/v3/AvailableCountries`, `/api/v3/PublicHolidays/{year}/{country}`), no key needed.

**Known service limitation:** Nager.Date answers some countries, **India included**, with an empty HTTP 204 response instead of a list
(a browser shows that as a blank page). Older versions of Evently tried to parse that empty body and showed
"The holiday service returned an unreadable response". Now:

* 204 / empty body / 404 = "no data for this country". For India only, a tiny built-in list is shown, clearly labelled
  *Not live data*: Republic Day (26 Jan), Independence Day (15 Aug) and Gandhi Jayanti (2 Oct). Festival dates that change every year
  are deliberately not included, and the page says the list is incomplete. Other countries without data show a plain message (no Retry, since retrying cannot help).
* Network errors, timeouts (12 s), HTTP errors, HTTP 429, HTML instead of JSON and malformed data each get their own message
  and a working **Retry**. Fallback data is never used to hide an outage.
* Loads happen when a page opens, when the country/year changes, and when you press **Refresh**. Obsolete requests are cancelled with
  `AbortController`, and the previous country's list is never shown for a new selection.

**Cache:** none. No localStorage/sessionStorage/IndexedDB, no in-memory result cache, no library. The only shared state is the set of
requests currently in flight, so the dashboard card, calendar and notification check asking for the same country/year at the same
moment make one request; it is forgotten as soon as it finishes. **Refresh** sends the request with `cache: 'no-cache'`, which makes the browser
revalidate with the server instead of reusing a stored copy (an unchanged answer costs a tiny 304). Normal loads use the browser default.
The old `event-countdown:holidays-cache` key is deleted from the browser automatically.

Calendar: public holidays are marked with a small dot; a holiday you imported as an event is shown once (as the event).
*Add to events* imports a holiday as an all-day event once (duplicates are blocked).

## Other changes

* One search bar in the top navigation (title + location) that works with the category/status filters, sorting and pagination
  on the Dashboard, with a clear button and a clear empty state. The duplicate dashboard search is gone.
* Every page now uses the same design system (CSS variables, light/dark). The Tailwind CDN script was removed; unused
  `HeroCountdown`, `MilestoneList`, `SyncPromo` components were deleted and `.ics` export moved to Settings.
* Analytics are computed from real events (plus task completion and reminder coverage).
* Known visual note: no reference screenshot was attached when this work was done, so the existing Evently
  look (light-first purple/pastel cards, left sidebar, top bar) was kept and extended; swap values in the `:root`
  variables in `src/index.css` to restyle.

## Manual test checklist

1. Sign up / sign in / wrong password / sign out / refresh (session persists) / open `/add` signed out (redirects to login).
2. Create an event with reminders 1 hour + custom 5 minutes; set it ~6 minutes ahead and keep the tab open.
3. Edit the event time: old reminder notifications disappear, new ones are scheduled. Delete it: its notifications go away.
4. Settings → enable browser notifications; deny in the browser prompt once and confirm the message shows.
5. Search "maldives" in the top bar, combine with category/status filters, sort, paginate, clear.
6. Public Holidays: change country/year, go offline and Retry, add a holiday twice (second time shows "Added").


### Public holidays in the calendar

The calendar now fetches the selected year's public holidays for the country configured in Settings, marks holiday dates with a teal dot (separate from user-event markers), and shows the holiday name when a date is selected. Holiday data uses the free Nager.Date public-holiday API and is not cached or stored. If the service is unavailable the calendar shows a small status message; events still work.

API reference: https://github.com/nager/nager.date
