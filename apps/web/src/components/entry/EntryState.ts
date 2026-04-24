export const ENTRY_SESSION_KEY = "vex.entry.seen";

export function hasSeenEntry() {
  if (typeof window === "undefined") return true;
  return window.sessionStorage.getItem(ENTRY_SESSION_KEY) === "true";
}

export function markEntrySeen() {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(ENTRY_SESSION_KEY, "true");
}
