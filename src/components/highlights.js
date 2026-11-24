import { h } from '../lib/dom.js';
import { cover } from '../lib/placeholder.js';
import { config } from '../lib/data.js';
import { navigate } from '../lib/router.js';

export function Highlights() {
  if (!config.highlights.length) return null;
  return h(
    'section',
    { class: 'highlights', 'aria-label': 'Story highlights' },
    h(
      'ul',
      { class: 'hl-list' },
      config.highlights.map((hl) =>
        h(
          'li',
          null,
          h('button', { class: 'hl', onclick: () => navigate(`h/${hl.id}`), 'aria-label': `Open ${hl.title} highlight` }, [
            h('span', { class: 'hl-ring' }, cover(hl.cover, hl.title)),
            h('span', { class: 'hl-title' }, hl.title),
          ]),
        ),
      ),
    ),
  );
}
