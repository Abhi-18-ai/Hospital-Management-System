# Hospital Management System — Frontend

React + Vite + Tailwind CSS frontend for the Hospital Management System backend.
Plain JavaScript (JSX), no TypeScript.

## Design

A functional clinical dashboard, not a marketing site — built around trust and
data-density rather than a templated SaaS look:

- **Deep clinical teal** (`brand-*` in `tailwind.config.js`) as the primary color,
  paired with a cool slate neutral scale (`ink-*`) instead of the generic
  indigo/violet SaaS default.
- **Consistent status-color coding** (green/amber/red/blue/slate) applied the same
  way everywhere — appointments, invoices, lab orders, admissions all read the
  same status vocabulary at a glance (`src/utils/constants.js`).
- **Monospace "record ID" chips** (`.id-chip` in `index.css`, `<IdChip>` component):
  every real-world identifier — MRN, invoice number, department code — renders the
  same way throughout the app. It's the one deliberate signature element, chosen
  because this product's entire job is being a system of record.

## Getting started

```bash
cd frontend
cp .env.example .env      # point VITE_API_BASE_URL at your running backend
npm install
npm run dev                # http://localhost:5173
```

Make sure the backend is running first (see the backend's own README) and that
its `CLIENT_ORIGIN` env var matches this app's origin (`http://localhost:5173`
by default) so CORS allows the requests through.

## Project structure

```
src/
├── main.jsx              # Entry point: router + toast provider
├── App.jsx                # Route table
├── api/                    # One thin wrapper file per backend module (axios calls only)
├── context/AuthContext.jsx # Login/register/logout + silent session bootstrap on reload
├── components/
│   ├── ui/                 # Design-system primitives: Button, Input, Table, Modal, Badge…
│   ├── layout/              # Sidebar, Topbar, DashboardLayout
│   └── ProtectedRoute.jsx   # Route guard (auth + optional role allow-list)
├── hooks/usePaginatedList.js  # Shared fetch+paginate+refresh logic for every list page
├── utils/                  # roles, formatters, constants, navigation config
└── pages/                  # One folder per domain, mirroring the backend's modules
```

## How authentication works here

- On login, the backend returns a short-lived **access token** (kept in memory only,
  never localStorage — see the comment in `src/api/axiosClient.js`) and sets an
  **HTTP-only refresh-token cookie** the browser can't read directly.
- On every page load, `AuthContext` silently calls `/auth/refresh` using that cookie
  to get a fresh access token, so a reload doesn't force a re-login.
- An axios response interceptor automatically retries any request that gets a 401
  by refreshing once and replaying the original call.
- Route-level and button-level role checks (`ProtectedRoute`, `hasRole()`) are a
  **UX convenience only** — hiding a button here is not a security boundary. The
  backend's RBAC middleware is the real enforcement point; the frontend just avoids
  showing actions a user's role can't perform anyway.

## Role-aware navigation

`src/utils/navigation.js` is the single source of truth for the sidebar — each item
lists which roles can see it, mirroring the backend's own RBAC matrix from the PRD.
Add a new page there and it appears for the right roles automatically.

## Notes on scope

- Medical record and prescription creation are reached from a patient's detail page
  (**Patients → [patient] → Medical Records / Prescriptions tab**), matching how a
  doctor actually works: pull up the patient, then document the encounter.
- Lab order status transitions, result submission, and result verification all live
  in one modal (`laboratory/LabOrderDetailModal.jsx`) since they're steps in a single
  workflow.
- Pharmacy dispensing calls the backend's FEFO-allocation transaction directly; if
  stock is insufficient, the backend's `INSUFFICIENT_STOCK` error surfaces as a toast
  with no partial deduction (the transaction guarantees that).
