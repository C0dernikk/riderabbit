/**
 * API base for fetch calls.
 * - Leave VITE_API_URL unset in dev: requests use `/api/...` and Vite proxies to the backend.
 * - In production, set VITE_API_URL to the backend origin (e.g. https://api.example.com).
 * VITE_PRODUCTION_BACKEND_URL is still read for backwards compatibility.
 */
function normalizeOrigin(raw) {
  return String(raw ?? "")
    .trim()
    .replace(/\/$/, "");
}

export function getApiOrigin() {
  return normalizeOrigin(
    import.meta.env.VITE_API_URL ?? import.meta.env.VITE_PRODUCTION_BACKEND_URL,
  );
}

/** Build the full request URL for an API path (must start with `/api` or `/`). */
export function apiUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const origin = getApiOrigin();
  return origin ? `${origin}${p}` : p;
}

/** fetch() with credentials so httpOnly refresh cookies work when the API is same-site or CORS allows it. */
export function apiFetch(path, init = {}) {
  return fetch(apiUrl(path), {
    credentials: "include",
    ...init,
  });
}
