// Hash router. Routes: '' | '<tabId>' | 'p/<postId>' | 'h/<highlightId>' | 'story' | 'dm'
const listeners = new Set();
let last = null;

export const current = () => decodeURIComponent(location.hash.replace(/^#\/?/, ''));

function emit() {
  const route = current();
  if (route === last) return;
  last = route;
  listeners.forEach((fn) => fn(route));
}

export function onRoute(fn) {
  listeners.add(fn);
}

export function navigate(path, { replace = false } = {}) {
  const url = path ? `#${path}` : location.pathname + location.search;
  if (replace) history.replaceState(history.state, '', url);
  else history.pushState({ pushed: true }, '', url); // marks entries we created
  emit();
}

// Close an overlay: step back if we pushed this entry, otherwise replace with the fallback
// (e.g. the page was opened directly on a #p/<id> deep link).
export function back(fallback) {
  if (history.state?.pushed) history.back();
  else navigate(fallback, { replace: true });
}

export function start() {
  window.addEventListener('popstate', emit);
  window.addEventListener('hashchange', emit);
  emit();
}

export const linkTo = (path) => `${location.origin}${location.pathname}#${path}`;
