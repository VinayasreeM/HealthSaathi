# HealthSaathi — Patient Dashboard Integration Guide

This document describes everything the **Patient Dashboard** needs from the
shared backend / auth so all parts work together after merging.

---

## 1. What the patient dashboard owns

```
frontend/src/pages/patient/*        (9 pages)
frontend/src/components/patient/*   (sidebar, navbar, layout, 8 cards)
backend/src/routes/patients.js      (patient /me endpoints)
```

Everything else (Login page, Register page, Doctor pages, auth backend,
doctor routes) can come from other members. As long as the contracts below
hold, merging will not break the patient side.

---

## 2. Authentication contract (shared)

The patient dashboard reuses the existing `AuthContext` — it does NOT create
its own auth system. Any login implementation must:

1. Store the JWT at:
   ```
   localStorage.setItem("token", token);
   ```
2. Store the user object at:
   ```
   localStorage.setItem("user", JSON.stringify({ id, name, email, role }));
   ```
3. Send the token as a header on API calls (already done by
   `frontend/src/services/api.js`):
   ```
   Authorization: Bearer <token>
   ```

`role` is optional — if the login backend does not return a `role`, the
route guards let the user through instead of redirecting.

After login, navigate to `/patient` for patients (or `/doctor` for doctors).

---

## 3. API endpoints the patient dashboard calls

All via the existing `api.js` service. Base URL comes from
`VITE_API_URL` (falls back to `http://localhost:5000/api`).

| Method | Endpoint                              | Used by                  |
|--------|---------------------------------------|--------------------------|
| GET    | `/patients/me`                        | Dashboard, Profile       |
| GET    | `/patients/me/medical-history`        | MedicalHistory           |
| GET    | `/patients/me/prescriptions`          | Prescriptions            |
| GET    | `/patients/me/medications`            | Medications              |
| GET    | `/patients/me/appointments`           | Appointments             |
| GET    | `/patients/me/recommendations`        | Recommendations          |
| GET    | `/patients/me/triage`                 | AI Health Assessment     |
| GET    | `/patients/me/notifications`          | Notifications, bell icon |
| PATCH  | `/patients/me/notifications/:id/read` | Mark notification read   |

The reference implementation of all of these lives in
`backend/src/routes/patients.js`. If the team's final backend uses different
endpoint names, only `routes/patients.js` + these calls need adjusting — no
patient UI component needs to change.

**Security rule:** every endpoint must derive the patient identity from the
JWT (`req.user.id`), never from a query/body parameter.

---

## 4. Response shapes

The frontend unwraps responses tolerantly (`utils/format.js → unwrap`),
so ALL of these work:

```json
[ ... ]                                // plain array
{ "success": true, "data": [ ... ] }   // wrapped array
{ "success": true, "prescriptions": [...] }  // named array field
```

Single-object responses (e.g. `/patients/me`) may be plain objects or
wrapped in `data`.

### Expected fields

- **Profile:** `{ id, name, email, age?, gender?, phone?, bloodGroup?, allergies?[], address? }`
- **Medical record:** `{ _id, visitDate, doctor: { name }, symptoms[], diagnosis, vitals: { bp?, temperature?, heartRate? }, testReports?, notes? }`
- **Prescription:** `{ _id, createdAt, doctor: { name }, diagnosis, medicines: [{ name, dosage?, frequency?, timing?, duration?, instructions? }], recommendations?, nextVisitDate? }`
- **Medication** (may be derived from prescriptions): `{ name, dosage?, frequency?, timing?, duration?, instructions?, startDate?, endDate? }`
- **Appointment:** `{ _id, date, time?, reason?, status?, doctor: { name } }`
- **Recommendation:** `{ _id, createdAt, items[] , doctor: { name } }`
- **Triage:** `{ _id, createdAt, priority: LOW|MEDIUM|HIGH, symptoms[], possibleConditions?, recommendation? }`
- **Notification:** `{ _id, type, title?, message?, read, createdAt }`

Missing optional fields are handled gracefully (shown as "—").

---

## 5. Doctor → Patient data flow (the core requirement)

The patient dashboard is read-only. All data must originate from records the
doctor creates, stored in MongoDB with a `patient` field referencing the
patient's User id:

```
Doctor creates prescription ──> MongoDB { patient: <userId>, medicines[] }
                                        │
Patient logs in ──> GET /patients/me/prescriptions  (JWT-derived filter)
                                        │
                          Only THAT patient's prescriptions returned
```

Reference doctor-side implementation: `backend/src/routes/doctors.js`
(create prescription / appointment / medical record; auto-creates
notifications). If the team builds richer doctor dashboards, they should
insert into the same collections:

```
users, patientprofiles, medicalrecords, prescriptions,
appointments, recommendations, triages, notifications
```

(Exact collection names are defined by the models in `backend/src/models/`.)

---

## 6. Environment variables

Backend (`backend/.env`, gitignored — see `.env.example`):

```
PORT=5000
MONGODB_URI=<Atlas connection string>
JWT_SECRET=<secret>
```

Frontend (`frontend/.env.local`, gitignored):

```
VITE_API_URL=http://localhost:5000/api
```

No secrets (Mongo URI, JWT secret, Gemini key, Twilio credentials) belong in
the frontend.

---

## 7. Merge notes

- Shared files touched by this feature (kept minimal):
  - `backend/src/app.js` — mounts `/api/auth`, `/api/patients`, `/api/doctors`
  - `backend/src/server.js` — calls `connectDB()` before listening
  - `frontend/src/App.jsx` — renders `<AppRoutes />` (was Vite starter)
  - `frontend/src/index.css` / `App.css` — replaced Vite starter styles with the app theme
  - `frontend/src/services/api.js` — one-line URL fallback added
  - `frontend/src/routes/AppRoutes.jsx` — same routes as before + guards + new patient routes
- If another member also modifies these files, keep their logic and merge
  carefully — nothing in the patient feature depends on removing their code.
- To reset demo data: `npm run seed` inside `backend/`.
