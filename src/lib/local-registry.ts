// The backend has no GET /startups or GET /deal-rooms list endpoint (only create +
// get-by-id). To make those sections usable in the UI, we remember which IDs this
// browser has created or opened, scoped per signed-in user. This is a client-side
// convenience only — the source of truth for each record is still the backend.

function storageKey(resource: string, userId: number): string {
  return `sp_registry_${resource}_${userId}`;
}

export function getRegistry(resource: string, userId: number): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(resource, userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "number") : [];
  } catch {
    return [];
  }
}

export function addToRegistry(resource: string, userId: number, id: number): void {
  if (typeof window === "undefined") return;
  const current = getRegistry(resource, userId);
  if (current.includes(id)) return;
  const next = [id, ...current].slice(0, 50);
  window.localStorage.setItem(storageKey(resource, userId), JSON.stringify(next));
}

export function removeFromRegistry(resource: string, userId: number, id: number): void {
  if (typeof window === "undefined") return;
  const current = getRegistry(resource, userId).filter((existing) => existing !== id);
  window.localStorage.setItem(storageKey(resource, userId), JSON.stringify(current));
}
