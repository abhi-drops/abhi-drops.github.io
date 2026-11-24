import { h, asset } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { config } from '../lib/data.js';
import { getTheme, setTheme, onChange } from '../lib/state.js';

export function Header() {
  const { resume, name } = config.profile;

  const themeBtn = h('button', {
    class: 'icon-btn theme-toggle',
    onclick: () => setTheme(getTheme() === 'dark' ? 'light' : 'dark'),
  });
  const syncTheme = () => {
    const dark = getTheme() === 'dark';
    themeBtn.replaceChildren(icon(dark ? 'sun' : 'moon'));
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  };
  syncTheme();
  onChange(syncTheme);

  return h(
    'header',
    { class: 'header' },
    h('div', { class: 'header-inner' }, [
      h(
        'a',
        { class: 'logo', href: '#', 'aria-label': `${name} — home`, onclick: (e) => (e.preventDefault(), window.scrollTo({ top: 0, behavior: 'smooth' })) },
        h('img', { class: 'logo-img logo-img--white', src: asset('logo/developer-white.png'), alt: 'Developer' }),
        h('img', { class: 'logo-img logo-img--black', src: asset('logo/developer-black.png'), alt: '' }),
      ),
      h('div', { class: 'header-actions' }, [
        themeBtn,
        h('a', { class: 'btn btn-primary resume-btn', href: asset(resume.url), download: resume.filename }, [
          icon('download'),
          h('span', { class: 'resume-long' }, 'Download Resume'),
          h('span', { class: 'resume-short' }, 'Resume'),
        ]),
      ]),
    ]),
  );
}
