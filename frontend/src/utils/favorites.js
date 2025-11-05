export const FAVORITES_KEY = 'favorites';

export function getFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setFavorites(ids) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(new Set(ids))));
}

export function isFavorite(id) {
  const ids = getFavorites();
  return ids.includes(Number(id));
}

export function toggleFavorite(id) {
  const ids = getFavorites();
  const n = Number(id);
  const next = ids.includes(n) ? ids.filter(x => x !== n) : [...ids, n];
  setFavorites(next);
  return next;
}

export function addFavorite(id) {
  const ids = getFavorites();
  const n = Number(id);
  if (!ids.includes(n)) setFavorites([...ids, n]);
}

export function removeFavorite(id) {
  const ids = getFavorites();
  const n = Number(id);
  if (ids.includes(n)) setFavorites(ids.filter(x => x !== n));
}
