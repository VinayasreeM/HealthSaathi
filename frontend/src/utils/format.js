const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const hours = d.getHours();
  const mins = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 || 12;
  return `${formatDate(d)}, ${h12}:${mins} ${ampm}`;
}

/**
 * Tolerant response unwrapper - works with whatever backend shape is merged in:
 *   [ ... ]                          -> as-is
 *   { success, data: [...] }         -> .data
 *   { success, prescriptions: [...] } -> first array-valued field
 *   { ...single object }             -> as-is
 */
export function unwrap(result, fallback = null) {
  if (result == null) return fallback;
  if (Array.isArray(result)) return result;
  if (typeof result === "object") {
    if ("data" in result && result.data != null) return result.data;
    const firstArray = Object.values(result).find((v) => Array.isArray(v));
    if (firstArray) return firstArray;
    return result;
  }
  return fallback;
}

export function initials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

/** True when the date is today or later (ignoring time-of-day). */
export function isUpcoming(dateValue) {
  if (!dateValue) return false;
  const d = new Date(dateValue);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return !Number.isNaN(d.getTime()) && d >= today;
}
