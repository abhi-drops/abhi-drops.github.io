import { h } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { config } from '../lib/data.js';

export function Tabs({ onSelect }) {
  const buttons = config.tabs.map((t) =>
    h('button', { class: 'tab', role: 'tab', 'data-tab': t.id, 'aria-label': t.label, onclick: () => onSelect(t.id) }, [
      icon(t.icon),
      h('span', { class: 'tab-label' }, t.label),
    ]),
  );
  const el = h('nav', { class: 'tabs', role: 'tablist' }, buttons);
  return {
    el,
    setActive(id) {
      buttons.forEach((b) => {
        const on = b.dataset.tab === id;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', String(on));
      });
    },
  };
}
