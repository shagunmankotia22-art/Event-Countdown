<div align="center">

# ⏳ Event Countdown

**Never miss a moment that matters.**

A sleek React (Vite) app for tracking milestones and events with live, ticking countdowns.

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-Build-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-Routing-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![Context API](https://img.shields.io/badge/State-Context_API-black?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</div>

---

## ✨ Overview

**Event Countdown** lets you create, organize, and watch the clock tick down on the moments that matter — birthdays, launches, deadlines, anniversaries, you name it. Built as a hands-on showcase of modern React patterns: hooks, context, protected routing, and persistent local state.

---

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Then open the local URL Vite prints — usually **http://localhost:5173**.

---

## 🧩 Features

| | |
|---|---|
| ⏱️ **Live Countdowns** | Real-time ticking timers down to the second |
| 🗂️ **Milestone Tracking** | Organize events into upcoming and past |
| 🔍 **Search & Filter** | Quickly find the event you're looking for |
| 🔐 **Protected Routes** | Auth-gated event creation |
| 💾 **Persistent State** | Events and auth survive a page refresh via `localStorage` |
| 📱 **Component-Driven UI** | Clean, reusable, prop-driven building blocks |

---

## 🏗️ Architecture

### Components
`Navbar` · `Sidebar` · `HeroCountdown` · `EventCard` · `StatsCards` · `MilestoneList` · `ProtectedRoute`

All built as **reusable, prop-driven components** — no tangled logic, just clean composition.

### Hooks in Action

| Hook | Used For |
|---|---|
| `useState` | Form inputs, search query, event list state |
| `useEffect` | Countdown ticking, localStorage sync |
| `useRef` | Interval ID inside the countdown hook |
| `useMemo` | Derived upcoming/past event lists and stats |
| `useCallback` | Stable handlers passed to children (add/delete event, input change) |
| `useCountdown` *(custom)* | Encapsulated countdown logic |
| `useLocalStorage` *(custom)* | Encapsulated persistence logic |

### Routing

```
/            → Home
/events/:id  → Dynamic event detail (route params)
/add         → Protected — redirects to /login if unauthenticated
*            → 404 catch-all
```

### State Management
Global state lives in **Context API**:
- `EventsContext` — event CRUD + derived stats
- `AuthContext` — auth state + protected route gating

### Persistence
Events and auth state are serialized to **`localStorage`** as JSON, so your countdowns survive a refresh.

---

## 📁 Project Structure

```
src/
├── components/   # Reusable UI components
├── context/      # EventsContext + AuthContext
├── hooks/        # useCountdown, useLocalStorage
├── pages/        # Route-level components
├── data/         # Seed data
├── App.jsx       # Route definitions
└── main.jsx      # Entry point (providers + router)
```

---

## 🛣️ Roadmap Ideas

- [ ] Recurring events (weekly / yearly)
- [ ] Push/browser notifications on milestone day
- [ ] Theming (light/dark toggle)
- [ ] Shareable countdown links

---

<div align="center">

Made with ⚛️ React and a little bit of urgency.

</div>