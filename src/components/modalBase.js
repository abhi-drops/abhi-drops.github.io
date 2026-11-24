// Shared overlay plumbing: scroll lock, Esc, focus trap, focus restore.
import { h } from '../lib/dom.js';

let openCount = 0;

export function createModal({ className, label, onRequestClose, onKey }) {
  const previouslyFocused = document.activeElement;
  const root = h('div', { class: `overlay ${className}`, role: 'dialog', 'aria-modal': 'true', 'aria-label': label, tabindex: '-1' });

  function keydown(e) {
    if (e.key === 'Escape') return onRequestClose();
    if (e.key === 'Tab') trapFocus(e);
    else onKey?.(e);
  }
  function trapFocus(e) {
    const items = [...root.querySelectorAll('button, a[href], input, textarea, [tabindex]:not([tabindex="-1"])')].filter(
      (el) => el.offsetParent !== null,
    );
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  document.body.append(root);
  if (openCount++ === 0) {
    document.body.style.setProperty('--scrollbar', `${window.innerWidth - document.documentElement.clientWidth}px`);
    document.body.classList.add('scroll-locked');
  }
  document.addEventListener('keydown', keydown);
  requestAnimationFrame(() => {
    root.classList.add('is-open');
    root.focus({ preventScroll: true });
  });

  return {
    root,
    destroy() {
      document.removeEventListener('keydown', keydown);
      root.classList.remove('is-open');
      root.classList.add('is-closing');
      setTimeout(() => root.remove(), 160);
      if (--openCount === 0) document.body.classList.remove('scroll-locked');
      previouslyFocused?.focus?.({ preventScroll: true });
    },
  };
}
