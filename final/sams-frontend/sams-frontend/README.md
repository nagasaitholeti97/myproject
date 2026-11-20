# SAMS - Student Attendance Management System

React + TypeScript + Tailwind CSS front end (built with Vite) for the student and faculty portals.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check and production build into dist/
```

Needs Node.js 18 or newer.

## Demo logins (password for every sample account: demo123)

- Student: `24ECE3002` (Ananya Rao, 3rd Year ECE-A)
- Faculty: `F101` (Dr. Anjali Rao, Digital Electronics)

## Structure

```
src/
  main.tsx                 entry point
  App.tsx                  top bar, theme toggle, picks Auth / Student / Faculty
  index.css                Tailwind import, light/dark theme tokens, faculty green accent, logo watermark
  types.ts                 types that mirror the ER diagram tables
  lib.ts                   dates, percentage rules (75% minimum), helpers
  api.ts                   all calls to the Spring Boot backend
  store.tsx                React context: loads data from the API, sign-in, register, navigation + Back, attendance saving
  components/
    ui.tsx                 buttons, fields, cards, rings, hero banner, tabs, toast
    PasswordModal.tsx      three-step change password pop-up
  pages/
    Auth.tsx               sign in, register, forgot password
    student/               StudentPortal, Profile, Attendance (subjects, exam eligibility, hourly record), Calendar
    faculty/               FacultyPortal (profile, class list), ClassDetail (attendance update, student list)
public/logo.png            SAMS logo
```

## Backend

This app talks to the Spring Boot API in `sams-backend`. Start the backend first (`mvn spring-boot:run`, port 8080),
then run this app. To use another address, copy `.env.example` to `.env` and change `VITE_API_URL`.

- `src/api.ts` is the only file that makes HTTP calls. It keeps the login token in memory and in sessionStorage, so a reload keeps you signed in.
- `src/store.tsx` loads the signed-in person's data and calls the API for sign-in, register, password changes, profile edits and saving attendance.
- Percentages are still worked out in the screens from the attendance rows the API returns.
- The demo treats 2026-11-11 as "today" (`TODAY` in `src/lib.ts`, `sams.demo-today` in the backend). Change both together.
- Demo logins: student `24ECE3002`, faculty `F101`, password `demo123`.
