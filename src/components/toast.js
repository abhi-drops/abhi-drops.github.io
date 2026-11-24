import { h } from '../lib/dom.js';

let el;
let timer;

export function toast(message) {
  if (!el) {
    el = h('div', { class: 'toast', role: 'status', 'aria-live': 'polite' });
    document.body.append(el);
  }
  el.textContent = message;
  el.classList.add('is-visible');
  clearTimeout(timer);
  timer = setTimeout(() => el.classList.remove('is-visible'), 2200);
}

export async function copyText(text, message = 'Copied to clipboard') {
  try {
    await navigator.clipboard.writeText(text);
    toast(message);
  } catch {
    toast(text); // clipboard blocked: at least show the value
  }
}

// Native share sheet where available, clipboard otherwise.
export async function share({ title, url }) {
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
      return;
    } catch (e) {
      if (e.name === 'AbortError') return;
    }
  }
  copyText(url, 'Link copied');
}
