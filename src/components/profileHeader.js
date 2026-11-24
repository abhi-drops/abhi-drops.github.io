import { h, asset } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { avatar } from '../lib/placeholder.js';
import { config, statValue } from '../lib/data.js';
import { navigate, linkTo } from '../lib/router.js';
import { storySeen, onChange, getTheme, setTheme } from '../lib/state.js';
import { NoteBubble } from './noteBubble.js';
import { createModal } from './modalBase.js';
import { copyText, share } from './toast.js';

export function ProfileHeader({ onStat }) {
  const { profile, stats, story, note } = config;
  const openDM = () => navigate('dm');
  const messageBtn = (cls) => h('button', { class: `btn btn-secondary ${cls}`, onclick: openDM }, 'Message');

  const hasStory = story.active && story.slides.length > 0;
  const avatarBtn = h(
    hasStory ? 'button' : 'div',
    {
      class: 'avatar-ring',
      'aria-label': hasStory ? `View ${profile.username}'s story` : null,
      onclick: hasStory ? () => navigate('story') : null,
    },
    avatar('avatar--xl'),
  );
  const syncRing = () => {
    avatarBtn.classList.toggle('has-story', hasStory && !storySeen.get());
    avatarBtn.classList.toggle('story-seen', hasStory && storySeen.get());
  };
  syncRing();
  onChange(syncRing);

  return h('section', { class: 'profile' }, [
    h('div', { class: 'p-avatar' }, h('div', { class: 'avatar-wrap' }, NoteBubble(note), avatarBtn)),

    h('div', { class: 'p-top' }, [
      h('div', { class: 'p-userrow' }, [
        h('h1', { class: 'p-username' }, profile.username),
        profile.verified && icon('verified', 'verified'),
        h('button', { class: 'icon-btn p-more', 'aria-label': 'Options', onclick: openOptions }, icon('more')),
      ]),
      h('div', { class: 'p-stats' }, [
        h(
          'ul',
          { class: 'p-stat-list' },
          stats.map((s) =>
            h('li', null, h('button', { class: 'p-stat', onclick: () => onStat(s.tab) }, [h('strong', null, statValue(s.key)), ` ${s.label}`])),
          ),
        ),
        messageBtn('p-message-desktop'),
      ]),
    ]),

    h('div', { class: 'p-bio' }, [
      h('div', { class: 'p-name' }, profile.name),
      profile.category && h('div', { class: 'p-category' }, profile.category),
      profile.bio.map((line) => h('div', null, line)),
      profile.link &&
        h('a', { class: 'p-link', href: profile.link.url, target: '_blank', rel: 'noopener' }, [icon('link'), profile.link.label]),
    ]),

    h('div', { class: 'p-actions' }, [
      messageBtn('p-message-mobile'),
      h('a', { class: 'btn btn-secondary', href: asset(profile.resume.url), download: profile.resume.filename }, 'Resume'),
    ]),
  ]);
}

// "⋯" → Instagram-style options sheet.
function openOptions() {
  const { profile } = config;
  const modal = createModal({ className: 'sheet-overlay', label: 'Profile options', onRequestClose: close });
  function close() {
    modal.destroy();
  }
  const row = (label, fn, cls = '') =>
    h('button', { class: `sheet-row ${cls}`, onclick: () => (close(), fn?.()) }, label);
  modal.root.addEventListener('click', (e) => e.target === modal.root && close());
  modal.root.append(
    h('div', { class: 'sheet' }, [
      row('Message', () => navigate('dm'), 'sheet-row--accent'),
      row('Copy profile link', () => copyText(linkTo(''), 'Profile link copied')),
      row('Share profile', () => share({ title: profile.name, url: linkTo('') })),
      row('Download resume', () => {
        const a = h('a', { href: asset(profile.resume.url), download: profile.resume.filename });
        a.click();
      }),
      row(getTheme() === 'dark' ? 'Light theme' : 'Dark theme', () => setTheme(getTheme() === 'dark' ? 'light' : 'dark')),
      row('Cancel'),
    ]),
  );
}
