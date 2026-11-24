// Instagram DM window: typing dots → intro bubbles → social cards.
import { h, reducedMotion } from '../lib/dom.js';
import { icon, BRAND } from '../lib/icons.js';
import { avatar } from '../lib/placeholder.js';
import { config } from '../lib/data.js';
import { createModal } from './modalBase.js';
import { copyText } from './toast.js';

const TYPING_MS = 750;

export function DMModal({ onClose }) {
  const { profile, socials, dm } = config;
  const modal = createModal({ className: 'dm-overlay', label: `Message ${profile.name}`, onRequestClose: onClose });
  modal.root.addEventListener('click', (e) => e.target === modal.root && onClose());

  const thread = h('div', { class: 'dm-thread' }, [
    h('div', { class: 'dm-intro' }, [
      avatar('avatar--lg'),
      h('div', { class: 'dm-intro-name' }, [profile.name, profile.verified && icon('verified', 'verified')]),
      h('div', { class: 'dm-intro-user' }, `${profile.username} · ${profile.category}`),
      h('button', { class: 'btn btn-secondary btn-sm', onclick: onClose }, 'View profile'),
    ]),
  ]);

  const input = h('input', { class: 'dm-input', type: 'text', placeholder: 'Message…', 'aria-label': 'Message', enterkeyhint: 'send' });
  const sendBtn = h('button', { class: 'dm-send', type: 'submit', hidden: true }, 'Send');
  input.addEventListener('input', () => (sendBtn.hidden = !input.value.trim()));
  const composer = h(
    'form',
    {
      class: 'dm-composer',
      onsubmit: (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        const email = socials.find((s) => s.icon === 'gmail')?.value;
        thread.append(h('div', { class: 'dm-row dm-row--me' }, h('div', { class: 'dm-bubble dm-bubble--me' }, text)));
        thread.scrollTop = thread.scrollHeight;
        input.value = '';
        sendBtn.hidden = true;
        if (email) window.location.href = `mailto:${email}?subject=${encodeURIComponent(dm.mailSubject)}&body=${encodeURIComponent(text)}`;
      },
    },
    [icon('message', 'dm-composer-icon'), input, sendBtn],
  );

  modal.root.append(
    h('div', { class: 'dm' }, [
      h('header', { class: 'dm-head' }, [
        h('button', { class: 'icon-btn dm-back', 'aria-label': 'Close', onclick: onClose }, icon('back')),
        h('div', { class: 'dm-head-avatar' }, [avatar('avatar--md'), h('span', { class: 'dm-online' })]),
        h('div', { class: 'dm-head-text' }, [
          h('div', { class: 'dm-head-name' }, [profile.name, profile.verified && icon('verified', 'verified')]),
          h('div', { class: 'dm-head-status' }, dm.status),
        ]),
        h('button', { class: 'icon-btn dm-x', 'aria-label': 'Close', onclick: onClose }, icon('close')),
      ]),
      thread,
      composer,
    ]),
  );

  // Play the conversation in.
  const timers = [];
  const wait = (ms) => new Promise((res) => timers.push(setTimeout(res, reducedMotion() ? 0 : ms)));
  let closed = false;

  function received(content, cls = '') {
    const row = h('div', { class: 'dm-row' }, [h('span', { class: 'dm-row-avatar' }, avatar('avatar--xs')), h('div', { class: `dm-bubble ${cls}` }, content)]);
    thread.querySelectorAll('.dm-row-avatar.is-last').forEach((a) => a.classList.remove('is-last'));
    row.firstChild.classList.add('is-last');
    thread.append(row);
    thread.scrollTo({ top: thread.scrollHeight, behavior: 'smooth' });
    return row;
  }

  (async () => {
    await wait(300);
    for (const text of dm.messages) {
      if (closed) return;
      const typing = received(h('span', { class: 'dm-typing' }, h('i'), h('i'), h('i')), 'dm-bubble--typing');
      await wait(TYPING_MS);
      typing.remove();
      if (closed) return;
      received(text);
      await wait(250);
    }
    if (closed) return;
    received(h('div', { class: 'dm-socials' }, socials.map(SocialCard)), 'dm-bubble--card');
  })();

  setTimeout(() => input.focus({ preventScroll: true }), 50);

  return {
    update() {},
    close() {
      closed = true;
      timers.forEach(clearTimeout);
      modal.destroy();
    },
  };
}

function SocialCard(s) {
  const external = /^https?:/.test(s.href);
  return h('div', { class: 'social' }, [
    h('span', { class: 'social-icon', style: { background: BRAND[s.icon] || BRAND.web } }, icon(s.icon)),
    h('div', { class: 'social-text' }, [h('div', { class: 'social-label' }, s.label), h('div', { class: 'social-value' }, s.value)]),
    h('button', { class: 'icon-btn social-btn', 'aria-label': `Copy ${s.label}`, onclick: () => copyText(s.value, `${s.label} copied`) }, icon('copy')),
    h(
      'a',
      { class: 'icon-btn social-btn', href: s.href, 'aria-label': `Open ${s.label}`, target: external ? '_blank' : null, rel: external ? 'noopener' : null },
      icon('external'),
    ),
  ]);
}
