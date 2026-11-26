// Full-screen story player shared by highlights and the avatar story.
// Tap right/left = next/prev slide, hold = pause, swipe = next/prev highlight, swipe down = close.
import { h, asset } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { avatar, cover, loadingImg } from '../lib/placeholder.js';
import { config } from '../lib/data.js';
import { navigate, linkTo } from '../lib/router.js';
import { storySeen, changed } from '../lib/state.js';
import { onHold, onSwipe } from '../lib/gestures.js';
import { createModal } from './modalBase.js';
import { share } from './toast.js';

const IMAGE_MS = 5000;

export function StoryViewer(startId, { onClose }) {
  const { profile, story, highlights } = config;
  const own = startId === 'story';
  const reels = own ? [{ id: 'story', title: '', slides: story.slides, own: true }] : highlights;

  let r = Math.max(0, reels.findIndex((x) => x.id === startId));
  let s = 0;
  let elapsed = 0;
  let duration = IMAGE_MS;
  let paused = false;
  let loading = false; // the timer waits until the slide's image has arrived
  let video = null;
  let raf = 0;
  let lastTs = 0;

  if (own) {
    storySeen.set();
    changed();
  }

  const modal = createModal({ className: 'story-overlay', label: 'Story', onRequestClose: onClose, onKey });
  const bars = h('div', { class: 'st-bars' });
  const headInfo = h('div', { class: 'st-head-info' });
  const pauseBtn = h('button', { class: 'icon-btn st-pause', onclick: () => setPaused(!paused) });
  const muteBtn = h('button', { class: 'icon-btn st-mute', hidden: true, onclick: toggleMute });
  const stage = h('div', { class: 'st-stage' });
  const likeBtn = h('button', { class: 'icon-btn st-like', 'aria-label': 'Like', onclick: () => likeBtn.classList.toggle('is-liked') }, icon('heart'));
  const prevBtn = h('button', { class: 'st-arrow st-arrow--prev', 'aria-label': 'Previous', onclick: prev }, icon('chevronLeft'));
  const nextBtn = h('button', { class: 'st-arrow st-arrow--next', 'aria-label': 'Next', onclick: next }, icon('chevronRight'));

  const card = h('div', { class: 'st-card' }, [
    stage,
    h('div', { class: 'st-top' }, [
      bars,
      h('div', { class: 'st-head' }, [
        headInfo,
        muteBtn,
        pauseBtn,
        h('button', { class: 'icon-btn st-close-inline', 'aria-label': 'Close', onclick: onClose }, icon('close')),
      ]),
    ]),
    h('div', { class: 'st-foot' }, [
      h('button', { class: 'st-reply', onclick: () => navigate('dm', { replace: true }) }, `Reply to ${profile.username}…`),
      likeBtn,
      h('button', { class: 'icon-btn', 'aria-label': 'Share', onclick: () => share({ title: profile.name, url: linkTo(own ? 'story' : `h/${reels[r].id}`) }) }, icon('share')),
    ]),
  ]);

  modal.root.append(
    h('div', { class: 'st-brand' }, h('img', { src: asset('logo/developer-white.png'), alt: 'Developer' })),
    h('button', { class: 'st-close', 'aria-label': 'Close', onclick: onClose }, icon('close')),
    h('div', { class: 'st-wrap' }, [prevBtn, card, nextBtn]),
  );

  // Tap zones (ignore the tap that ends a hold or a swipe, and taps on controls).
  const wasHold = onHold(stage, { start: () => setPaused(true, true), end: () => setPaused(false, true) });
  stage.addEventListener('click', (e) => {
    if (wasHold() || stage.dataset.swiped || e.target.closest('a, button')) return;
    const { left, width } = stage.getBoundingClientRect();
    e.clientX - left < width * 0.3 ? prev() : next();
  });
  onSwipe(stage, { left: () => jumpReel(1), right: () => jumpReel(-1), down: onClose });

  function onKey(e) {
    if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') prev();
    else if (e.key === ' ' && !e.target.matches('button')) {
      e.preventDefault();
      setPaused(!paused);
    }
  }

  function setPaused(on, fromHold = false) {
    paused = on;
    card.classList.toggle('is-held', on && fromHold);
    pauseBtn.replaceChildren(icon(on ? 'play' : 'pause'));
    pauseBtn.setAttribute('aria-label', on ? 'Play' : 'Pause');
    if (video) on ? video.pause() : video.play().catch(() => {});
  }

  function toggleMute() {
    if (!video) return;
    video.muted = !video.muted;
    muteBtn.textContent = video.muted ? '🔇' : '🔊';
  }

  function renderReel() {
    const reel = reels[r];
    bars.replaceChildren(...reel.slides.map(() => h('div', { class: 'st-bar' }, h('i'))));
    headInfo.replaceChildren(
      reel.own ? avatar('avatar--sm') : h('span', { class: 'st-head-cover' }, cover(reel.cover, reel.title)),
      h('span', { class: 'st-head-name' }, [profile.username, profile.verified && icon('verified', 'verified')]),
      reel.title && h('span', { class: 'st-head-sub' }, reel.title),
    );
    prevBtn.hidden = r === 0 && s === 0;
  }

  function renderSlide() {
    const slide = reels[r].slides[s];
    elapsed = 0;
    duration = slide.duration || IMAGE_MS;
    video = null;
    muteBtn.hidden = true;

    [...bars.children].forEach((bar, i) => {
      bar.firstChild.style.width = i < s ? '100%' : '0%';
    });

    let content;
    loading = false;
    if (slide.type === 'image') {
      loading = true;
      content = loadingImg({ class: 'st-media', src: asset(slide.src), alt: slide.caption || '', draggable: false }, () => {
        if (content.isConnected) loading = false;
        preloadNext();
      });
    } else if (slide.type === 'video') {
      video = h('video', { class: 'st-media', src: asset(slide.src), playsInline: true, muted: true, autoplay: true });
      video.addEventListener('ended', next);
      muteBtn.hidden = false;
      muteBtn.textContent = '🔇';
    } else {
      content = h('div', { class: 'st-text', style: { background: `linear-gradient(160deg, ${slide.bg?.[0] || '#4a5df9'}, ${slide.bg?.[1] || '#a855f7'})` } }, [
        slide.emoji && h('div', { class: 'st-emoji' }, slide.emoji),
        slide.title && h('div', { class: 'st-title' }, slide.title),
        slide.text && h('div', { class: 'st-body' }, slide.text),
      ]);
    }
    stage.replaceChildren(
      video || content,
      slide.caption && slide.type !== 'text' && h('div', { class: 'st-caption' }, slide.caption),
      slide.link &&
        h('a', { class: 'st-link', href: slide.link.url, target: '_blank', rel: 'noopener', onclick: () => setPaused(true) }, [
          icon('link'),
          h('span', null, slide.link.label || slide.link.url),
        ]),
    );
    prevBtn.hidden = r === 0 && s === 0;
    nextBtn.hidden = false;
    setPaused(false);
  }

  // Warm the cache for the next image slide so tapping forward feels instant
  function preloadNext() {
    const after = reels[r].slides[s + 1] || reels[r + 1]?.slides[0];
    if (after?.type === 'image') new Image().src = asset(after.src);
  }

  function next() {
    if (s < reels[r].slides.length - 1) {
      s++;
      renderSlide();
    } else if (r < reels.length - 1) jumpReel(1);
    else onClose();
  }

  function prev() {
    if (s > 0) {
      s--;
      renderSlide();
    } else if (r > 0) jumpReel(-1);
    else renderSlide();
  }

  function jumpReel(dir) {
    const n = r + dir;
    if (n < 0) return;
    if (n >= reels.length) return onClose();
    show(n);
    navigate(`h/${reels[r].id}`, { replace: true });
  }

  function show(index) {
    r = index;
    s = 0;
    renderReel();
    renderSlide();
  }

  function tick(ts) {
    const dt = Math.min(100, lastTs ? ts - lastTs : 0);
    lastTs = ts;
    if (!paused && !loading) {
      let progress;
      if (video) progress = video.duration ? video.currentTime / video.duration : 0;
      else {
        elapsed += dt;
        progress = elapsed / duration;
      }
      const bar = bars.children[s]?.firstChild;
      if (bar) bar.style.width = `${Math.min(1, progress) * 100}%`;
      if (!video && progress >= 1) next();
    }
    raf = requestAnimationFrame(tick);
  }

  show(r);
  raf = requestAnimationFrame(tick);

  return {
    update(id) {
      const i = reels.findIndex((x) => x.id === id);
      if (i >= 0 && i !== r) show(i);
    },
    close() {
      cancelAnimationFrame(raf);
      video?.pause();
      modal.destroy();
    },
  };
}
