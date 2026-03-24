/**
 * Opt-in debug logging for ambient / atmosphere components (no noise in production by default).
 * Enable: `?vexAmbient=1` or `localStorage.setItem('vex:ambient:debug', '1')`.
 */

function isAmbientDebugEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.localStorage.getItem("vex:ambient:debug") === "1") return true;
    return new URLSearchParams(window.location.search).get("vexAmbient") === "1";
  } catch {
    return false;
  }
}

export type AmbientLogPayload = Record<string, unknown> | undefined;

export const ambientLog = {
  debug(scope: string, message: string, payload?: AmbientLogPayload): void {
    if (!isAmbientDebugEnabled()) return;
    if (payload !== undefined) {
      console.debug(`[vex:ambient:${scope}] ${message}`, payload);
    } else {
      console.debug(`[vex:ambient:${scope}] ${message}`);
    }
  },
};
