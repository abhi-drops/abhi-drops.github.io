import './styles/tokens.css';
import './styles/base.css';
import './styles/header.css';
import './styles/profile.css';
import './styles/note.css';
import './styles/grid.css';
import './styles/modal.css';
import './styles/story.css';
import './styles/dm.css';

import { h } from './lib/dom.js';
import { config, findPost } from './lib/data.js';
import { onRoute, navigate, back, start } from './lib/router.js';
import { onChange } from './lib/state.js';
import { Header } from './components/header.js';
import { ProfileHeader } from './components/profileHeader.js';
import { Highlights } from './components/highlights.js';
import { Tabs } from './components/tabs.js';
import { Grid } from './components/grid.js';
import { PostModal } from './components/postModal.js';
import { StoryViewer } from './components/storyViewer.js';
import { DMModal } from './components/dmModal.js';

document.title = config.site.title;
document.querySelector('meta[name="description"]')?.setAttribute('content', config.site.description);

const tabIds = config.tabs.map((t) => t.id);
let activeTab = tabIds[0];

const tabs = Tabs({ onSelect: (id) => navigate(id, { replace: true }) });
const grid = Grid();

function setTab(id) {
  activeTab = id;
  tabs.setActive(id);
  grid.render(id);
}

const profile = ProfileHeader({
  onStat: (id) => {
    navigate(id, { replace: true });
    tabs.el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },
});

document.getElementById('app').append(
  Header(),
  h('main', { class: 'main' }, [profile, Highlights(), tabs.el, grid.el]),
  h('footer', { class: 'footer' }, `© ${new Date().getFullYear()} ${config.profile.name} · Built with Vite`),
);

// One overlay at a time, driven entirely by the URL hash.
let overlay = null;
const closeToTab = () => back(activeTab);

function closeOverlay() {
  overlay?.ctrl.close();
  overlay = null;
}

function open(type, id, create) {
  if (overlay?.type === type) return overlay.ctrl.update(id);
  closeOverlay();
  overlay = { type, ctrl: create() };
}

onRoute((route) => {
  const [kind, id] = route.split('/');
  const post = kind === 'p' && findPost(id);

  if (post) {
    if (post.tab !== activeTab) setTab(post.tab);
    open('post', id, () => PostModal(id, { onClose: closeToTab }));
  } else if (kind === 'h' && config.highlights.some((x) => x.id === id)) {
    open('highlight', id, () => StoryViewer(id, { onClose: closeToTab }));
  } else if (kind === 'story' && config.story.active) {
    open('story', 'story', () => StoryViewer('story', { onClose: closeToTab }));
  } else if (kind === 'dm') {
    open('dm', null, () => DMModal({ onClose: closeToTab }));
  } else {
    closeOverlay();
    if (tabIds.includes(kind) && kind !== activeTab) setTab(kind);
  }
});

onChange(() => grid.refresh());
setTab(activeTab);
start();
