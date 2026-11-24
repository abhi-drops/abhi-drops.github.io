import { h } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { tile } from '../lib/placeholder.js';
import { posts } from '../lib/data.js';
import { navigate } from '../lib/router.js';
import { likes, saved } from '../lib/state.js';

export function Grid() {
  const el = h('section', { class: 'grid', role: 'tabpanel' });
  let tab = null;

  function render(nextTab = tab) {
    tab = nextTab;
    el.replaceChildren(...(posts[tab] || []).map(Tile));
  }

  return { el, render, refresh: () => render() };
}

function Tile(post) {
  const badges = [likes.has(post.id) && icon('heartFill', 'tile-badge-liked'), saved.has(post.id) && icon('bookmarkFill')];
  return h(
    'a',
    {
      class: 'tile',
      href: `#p/${post.id}`,
      'aria-label': post.title,
      onclick: (e) => {
        e.preventDefault();
        navigate(`p/${post.id}`);
      },
    },
    [
      tile(post),
      post.media.length > 1 && icon('carousel', 'tile-corner'),
      h('div', { class: 'tile-hover' }, [
        h('div', { class: 'tile-hover-title' }, post.title),
        h(
          'div',
          { class: 'tile-hover-stats' },
          post.hover.map((s) => h('span', null, icon(s.icon), s.text)),
        ),
        badges.some(Boolean) && h('div', { class: 'tile-hover-badges' }, badges),
      ]),
    ],
  );
}
