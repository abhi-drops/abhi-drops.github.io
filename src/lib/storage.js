// localStorage wrapper that never throws (private mode, blocked storage, etc.).
const PREFIX = 'ip:';

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage unavailable — state lives for this page view only */
  }
}

// A persisted set of ids (likes, saves). Returns helpers bound to one key.
export function idSet(key) {
  const ids = new Set(load(key, []));
  return {
    has: (id) => ids.has(id),
    toggle(id, force) {
      const on = force ?? !ids.has(id);
      on ? ids.add(id) : ids.delete(id);
      save(key, [...ids]);
      return on;
    },
  };
}
