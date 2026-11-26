// Designer placeholders: gradient tiles that stand in for real images.
// A media item that is a string becomes an <img>; an object becomes a tile.
import { h, asset } from './dom.js';
import { config } from './data.js';

const DEFAULT_GRADIENT = ['#4a5df9', '#a855f7'];
const bg = (gradient = DEFAULT_GRADIENT) => `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`;

// <img> that shows a shimmering skeleton until it loads, then fades in.
// onLoad also fires on error, so callers waiting on it never stall.
export function loadingImg(props, onLoad) {
  const img = h('img', { ...props, class: `${props.class || ''} img-loading` });
  img.addEventListener('load', () => {
    img.classList.replace('img-loading', 'img-loaded');
    onLoad?.();
  }, { once: true });
  img.addEventListener('error', () => {
    img.classList.replace('img-loading', 'img-error');
    onLoad?.();
  }, { once: true });
  return img;
}

export function media(item, { variant = 'slide', alt = '' } = {}) {
  if (typeof item === 'string') {
    return loadingImg({ class: 'media-img', src: asset(item), alt, loading: 'lazy', draggable: false });
  }
  return h(
    'div',
    { class: `ph ph--${variant}`, style: { background: bg(item.gradient) }, role: 'img', 'aria-label': alt || item.title },
    h('div', { class: 'ph-inner' }, [
      item.icon && h('div', { class: 'ph-icon' }, item.icon),
      item.title && h('div', { class: 'ph-title' }, item.title),
      variant === 'tile'
        ? item.lines?.[0] && h('div', { class: 'ph-sub' }, item.lines[0])
        : item.lines?.length && h('ul', { class: 'ph-lines' }, item.lines.map((l) => h('li', null, l))),
    ]),
  );
}

// Grid tile: first media item, in the compact tile layout.
export const tile = (post) =>
  typeof post.media[0] === 'string'
    ? media(post.media[0], { alt: post.title })
    : media({ ...post.media[0], lines: [post.subtitle || post.media[0].lines?.[0]] }, { variant: 'tile', alt: post.title });

export function avatar(size = '') {
  const { avatar: src, avatarPosition, initials, name } = config.profile;
  if (src) return loadingImg({ class: `avatar ${size}`, src: asset(src), alt: name, draggable: false, style: avatarPosition && `object-position: ${avatarPosition}` });
  return h('div', { class: `avatar avatar--ph ${size}`, role: 'img', 'aria-label': name }, h('span', null, initials));
}

export function cover(c, label) {
  if (typeof c === 'string') return loadingImg({ class: 'hl-cover', src: asset(c), alt: label, draggable: false });
  return h('div', { class: 'hl-cover hl-cover--ph', style: { background: bg(c?.gradient) } }, c?.icon || label[0]);
}
