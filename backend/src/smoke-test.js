/**
 * End-to-end API smoke test.
 * Usage: node src/smoke-test.js   (backend must have MONGODB_URI configured)
 *
 * Verifies the core requirement:
 *   doctor logs in -> creates prescription -> patient logs in -> sees it
 */
require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = 5050;
const BASE = `http://127.0.0.1:${PORT}/api`;

let failures = 0;

function check(name, cond, extra = "") {
  if (cond) {
    console.log(`  PASS  ${name}`);
  } else {
    failures += 1;
    console.log(`  FAIL  ${name} ${extra}`);
  }
}

async function main() {
  await connectDB();
  const server = app.listen(PORT);
  await new Promise((r) => server.on("listening", r));

  // 1. Health
  const health = await (await fetch(`${BASE}/health`)).json();
  check("GET /health", health.success === true);

  // 2. Patient login
  let res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "patient@healthsaathi.com",
      password: "patient123",
    }),
  });
  const patientAuth = await res.json();
  check("patient login", res.ok && !!patientAuth.token);

  const pToken = patientAuth.token;
  const pHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${pToken}`,
  };

  // 3. Patient profile
  res = await fetch(`${BASE}/patients/me`, { headers: pHeaders });
  const me = await res.json();
  check("GET /patients/me returns name", me.data?.name === "Ravi Kumar");
  check("GET /patients/me returns blood group", me.data?.bloodGroup === "B+");

  // 4. Patient endpoints all scoped to JWT
  for (const path of [
    "/patients/me/medical-history",
    "/patients/me/prescriptions",
    "/patients/me/medications",
    "/patients/me/appointments",
    "/patients/me/recommendations",
    "/patients/me/triage",
    "/patients/me/notifications",
  ]) {
    const r = await fetch(`${BASE}${path}`, { headers: pHeaders });
    const body = await r.json();
    check(`GET ${path}`, r.ok && Array.isArray(body.data));
  }

  // 5. No token -> rejected
  res = await fetch(`${BASE}/patients/me`);
  check("unauthenticated request rejected", res.status === 401);

  // 6. Doctor login + create prescription
  res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "doctor@healthsaathi.com",
      password: "doctor123",
    }),
  });
  const doctorAuth = await res.json();
  check("doctor login", res.ok && !!doctorAuth.token);

  const dHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${doctorAuth.token}`,
  };

  // Doctor-side flows use the Patient document id, not the User id
  res = await fetch(`${BASE}/doctors/me/patients`, {
    headers: dHeaders,
  });
  const patientsList = (await res.json()).data;
  const patientId = patientsList.find((p) => p.email === "patient@healthsaathi.com").id;
  check("doctor lists patients", !!patientId);
  res = await fetch(`${BASE}/doctors/me/prescriptions`, {
    method: "POST",
    headers: dHeaders,
    body: JSON.stringify({
      patientId,
      diagnosis: "Smoke Test Diagnosis",
      medicines: [
        {
          name: "Paracetamol",
          dosage: "650 mg",
          frequency: "Twice daily",
          timing: "08:00 AM, 08:00 PM",
          duration: "5 days",
          instructions: "Take after food.",
        },
      ],
      recommendations: "Drink water.\nRest well.",
    }),
  });
  const createdRx = await res.json();
  check(
    "doctor POST prescription",
    res.ok && createdRx.data?.medicines?.[0]?.name === "Paracetamol"
  );

  // 7. Patient sees the doctor-created prescription (DB sync)
  res = await fetch(`${BASE}/patients/me/prescriptions`, { headers: pHeaders });
  const rxList = (await res.json()).data;
  check(
    "patient sees doctor-created prescription",
    rxList.some((rx) => rx.diagnosis === "Smoke Test Diagnosis")
  );

  // 8. Medications derived from prescriptions
  res = await fetch(`${BASE}/patients/me/medications`, { headers: pHeaders });
  const meds = (await res.json()).data;
  check(
    "medications derived from prescriptions",
    meds.some((m) => m.name === "Paracetamol")
  );

  // 9. Doctor schedules appointment -> patient sees it
  res = await fetch(`${BASE}/doctors/me/appointments`, {
    method: "POST",
    headers: dHeaders,
    body: JSON.stringify({
      patientId,
      date: new Date(Date.now() + 3 * 86400000).toISOString(),
      time: "11:00 AM",
      reason: "Smoke test follow-up",
    }),
  });
  check("doctor POST appointment", res.ok);

  res = await fetch(`${BASE}/patients/me/appointments`, { headers: pHeaders });
  check(
    "patient sees doctor-created appointment",
    (await res.json()).data.some((a) => a.reason === "Smoke test follow-up")
  );

  // 10. Notifications generated
  res = await fetch(`${BASE}/patients/me/notifications`, { headers: pHeaders });
  const notifs = (await res.json()).data;
  check(
    "prescription notification created",
    notifs.some((n) => n.type === "prescription" && !n.read)
  );

  // 11. Role security: patient cannot call doctor endpoints
  res = await fetch(`${BASE}/doctors/me/patients`, { headers: pHeaders });
  check("patient blocked from doctor routes", res.status === 403);

  server.close();
  await require("mongoose").disconnect();

  console.log(failures === 0 ? "\nALL SMOKE TESTS PASSED" : `\n${failures} TEST(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
