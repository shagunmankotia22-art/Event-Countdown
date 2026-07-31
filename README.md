# Event Countdown

A React (Vite) app for tracking milestones and events with live countdowns.

## Setup

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually http://localhost:5173).

## What's implemented

- **Component architecture** — Navbar, Sidebar, HeroCountdown, EventCard, StatsCards,
  MilestoneList, ProtectedRoute, all built as reusable, prop-driven components.
- **Hooks**
  - `useState` — form inputs, search query, event list state
  - `useEffect` — countdown ticking, localStorage sync
  - `useRef` — interval id inside the countdown hook
  - `useMemo` — derived upcoming/past event lists and stats
  - `useCallback` — stable handlers passed down to children (add/delete event, form input change)
  - Custom hooks: `useCountdown`, `useLocalStorage`
- **React Router**
  - Static route: `/`
  - Dynamic route with params: `/events/:id`
  - Protected route: `/add` (redirects to `/login` if not authenticated)
  - Catch-all 404 route: `*`
- **Forms & controlled components** — `AddEvent` page with validation
- **State management** — Context API (`EventsContext`, `AuthContext`)
- **Persistence** — events + auth state saved to `localStorage` as JSON

## Project structure

```
src/
  components/   Reusable UI components
  context/      EventsContext + AuthContext (Context API state)
  hooks/        useCountdown, useLocalStorage
  pages/        Route-level components
  data/         Seed data
  App.jsx       Route definitions
  main.jsx      Entry point (providers + router)
```
