// Instagram post view: carousel on the left, caption + "comments" on the right.
// On phones the same markup reflows into a full-screen post page.
import { h, reducedMotion } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { media, avatar } from '../lib/placeholder.js';
import { config, findPost, posts } from '../lib/data.js';
import { linkTo, navigate } from '../lib/router.js';
import { likes, saved, changed } from '../lib/state.js';
import { onDoubleTap, onSwipe } from '../lib/gestures.js';
import { createModal } from './modalBase.js';
import { share, toast } from './toast.js';

export function PostModal(id, { onClose }) {
  const { profile } = config;
  let post = findPost(id);
  let slide = 0;

  const modal = createModal({ className: 'post-overlay', label: 'Post', onRequestClose: onClose, onKey });
  const article = h('article', { class: 'pm' });
  const prevBtn = h('button', { class: 'pm-nav pm-nav--prev', 'aria-label': 'Previous post', onclick: () => step(-1) }, icon('chevronLeft'));
  const nextBtn = h('button', { class: 'pm-nav pm-nav--next', 'aria-label': 'Next post', onclick: () => step(1) }, icon('chevronRight'));
  modal.root.append(
    h('button', { class: 'pm-close', 'aria-label': 'Close', onclick: onClose }, icon('close')),
    prevBtn,
    article,
    nextBtn,
  );
  modal.root.addEventListener('click', (e) => e.target === modal.root && onClose());

  const siblings = () => posts[post.tab];
  function step(dir) {
    const list = siblings();
    const next = list[list.indexOf(post) + dir];
    if (next) navigate(`p/${next.id}`, { replace: true });
  }

  function onKey(e) {
    if (e.target.matches?.('input, textarea')) return;
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  }

  function render() {
    const list = siblings();
    const i = list.indexOf(post);
    prevBtn.hidden = i <= 0;
    nextBtn.hidden = i >= list.length - 1;
    slide = 0;

    const userLine = (extra) =>
      h('div', { class: 'pm-user' }, [
        avatar('avatar--sm'),
        h('div', { class: 'pm-user-text' }, [
          h('div', { class: 'pm-user-name' }, [profile.username, profile.verified && icon('verified', 'verified')]),
          extra,
        ]),
      ]);

    const comment = (text, extra) =>
      h('li', { class: 'pm-comment' }, [
        avatar('avatar--sm'),
        h('div', null, [
          h('p', null, [h('strong', null, profile.username), ' ', text]),
          extra,
          h('div', { class: 'pm-comment-meta' }, post.date || ''),
        ]),
      ]);

    const hashtags = post.tags.length && !post.skills
      ? h('p', { class: 'pm-tags' }, post.tags.map((t) => h('span', null, `#${t.toLowerCase().replace(/[^a-z0-9+#.]+/g, '')} `)))
      : null;
    const chips = post.skills ? h('ul', { class: 'pm-chips' }, post.skills.map((s) => h('li', null, s))) : null;

    const likeBtn = h('button', { class: 'icon-btn pm-like', onclick: () => toggleLike() });
    const saveBtn = h('button', { class: 'icon-btn pm-save', onclick: () => toggleSave() });
    const likeText = h('div', { class: 'pm-likes' });
    const syncActions = () => {
      const liked = likes.has(post.id);
      likeBtn.replaceChildren(icon(liked ? 'heartFill' : 'heart'));
      likeBtn.classList.toggle('is-liked', liked);
      likeBtn.setAttribute('aria-label', liked ? 'Unlike' : 'Like');
      const isSaved = saved.has(post.id);
      saveBtn.replaceChildren(icon(isSaved ? 'bookmarkFill' : 'bookmark'));
      saveBtn.setAttribute('aria-label', isSaved ? 'Remove from saved' : 'Save');
      likeText.textContent = liked ? 'Liked by you' : 'Double-tap to like';
    };

    function toggleLike(force) {
      const on = likes.toggle(post.id, force);
      if (on && !reducedMotion()) likeBtn.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], 300);
      syncActions();
      changed();
    }
    function toggleSave() {
      const on = saved.toggle(post.id);
      toast(on ? 'Saved' : 'Removed from saved');
      syncActions();
      changed();
    }

    const body = h('div', { class: 'pm-body' }, [
      h('ul', { class: 'pm-comments' }, [
        comment(post.caption || post.title, [chips, hashtags]),
        ...post.comments.map((c) => comment(c)),
      ]),
    ]);

    article.replaceChildren(
      h('div', { class: 'pm-mobilebar' }, [
        h('button', { class: 'icon-btn', 'aria-label': 'Back', onclick: onClose }, icon('back')),
        h('div', { class: 'pm-mobilebar-title' }, post.title),
        h('span', { class: 'pm-mobilebar-spacer' }),
      ]),
      h('header', { class: 'pm-head' }, [
        userLine(h('div', { class: 'pm-location' }, post.location || post.subtitle || '')),
        post.url && h('a', { class: 'pm-visit', href: post.url, target: '_blank', rel: 'noopener' }, ['Visit', icon('external')]),
      ]),
      Carousel(post, {
        onIndex: (n) => (slide = n),
        onDoubleTap: () => toggleLike(true),
      }),
      h('div', { class: 'pm-actions' }, [
        likeBtn,
        h('button', { class: 'icon-btn', 'aria-label': 'Comments', onclick: () => body.scrollTo({ top: 0, behavior: 'smooth' }) }, icon('comment')),
        h('button', { class: 'icon-btn', 'aria-label': 'Share', onclick: () => share({ title: post.title, url: linkTo(`p/${post.id}`) }) }, icon('share')),
        h('span', { class: 'pm-actions-spacer' }),
        saveBtn,
      ]),
      h('div', { class: 'pm-meta' }, [likeText, h('div', { class: 'pm-date' }, [post.title, post.date && ` · ${post.date}`])]),
      body,
      h('button', { class: 'pm-add', onclick: () => navigate('dm') }, [
        icon('message'),
        h('span', null, `Message ${profile.username}…`),
      ]),
    );
    syncActions();
    article.scrollTop = 0;
  }

  render();

  return {
    update(nextId) {
      const next = findPost(nextId);
      if (!next || next === post) return;
      post = next;
      render();
    },
    close: () => modal.destroy(),
  };
}

function Carousel(post, { onIndex, onDoubleTap: onDouble }) {
  const count = post.media.length;
  let index = 0;
  const track = h('div', { class: 'car-track' }, post.media.map((m, i) => h('div', { class: 'car-slide' }, media(m, { alt: `${post.title} — ${i + 1} of ${count}` }))));
  const prev = h('button', { class: 'car-btn car-btn--prev', 'aria-label': 'Previous image', onclick: () => go(index - 1) }, icon('chevronLeft'));
  const next = h('button', { class: 'car-btn car-btn--next', 'aria-label': 'Next image', onclick: () => go(index + 1) }, icon('chevronRight'));
  const dots = h('div', { class: 'car-dots' }, post.media.map(() => h('i')));
  const heart = h('div', { class: 'car-heart' }, icon('heartFill'));
  const el = h('div', { class: 'pm-media car' }, [track, count > 1 && [prev, next, dots], heart]);

  function go(n) {
    index = Math.max(0, Math.min(count - 1, n));
    track.style.transform = `translateX(${-index * 100}%)`;
    prev.hidden = index === 0;
    next.hidden = index === count - 1;
    [...dots.children].forEach((d, i) => d.classList.toggle('is-active', i === index));
    onIndex(index);
  }

  onSwipe(el, { left: () => go(index + 1), right: () => go(index - 1) });
  onDoubleTap(track, () => {
    onDouble();
    heart.classList.remove('is-popping');
    void heart.offsetWidth; // restart the animation
    heart.classList.add('is-popping');
  });
  go(0);
  return el;
}
