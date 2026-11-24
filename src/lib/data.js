// Derives everything the UI needs from the raw config.
import config from '../config/profile.config.js';

const monthsBetween = (from, to = new Date()) => {
  const [y, m] = from.split('-').map(Number);
  return (to.getFullYear() - y) * 12 + (to.getMonth() + 1 - m);
};

export function formatDuration(start, end) {
  const months = Math.max(1, monthsBetween(start, end ? new Date(`${end}-01`) : new Date()));
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y && `${y}y`, m && `${m}m`].filter(Boolean).join(' ');
}

const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

// Every post gets: media[], tags[], comments[], hover[] — whatever tab it came from.
function normalize(post, tab) {
  const tile = { icon: post.tile?.icon, gradient: post.tile?.gradient, title: post.title, lines: [post.subtitle].filter(Boolean) };
  let media = post.media?.length ? post.media : [tile];
  let tags = post.tags || [];
  if (post.skills) {
    // Skill posts: cover slide + slides listing the skills.
    tags = post.skills;
    if (!post.media?.length) {
      media = [tile, ...chunk(post.skills, 6).map((lines) => ({ icon: post.tile?.icon, gradient: post.tile?.gradient, title: post.title, lines }))];
    }
  }
  const hover = [];
  if (post.start) hover.push({ icon: 'clock', text: formatDuration(post.start, post.end) });
  else if (post.date) hover.push({ icon: 'clock', text: post.date });
  if (tags.length) hover.push({ icon: 'layers', text: `${tags.length} ${post.skills ? 'skills' : 'tech'}` });
  return { ...post, tab, media, tags, comments: post.comments || [], hover };
}

export const posts = Object.fromEntries(
  Object.entries(config.posts).map(([tab, list]) => [tab, list.map((p) => normalize(p, tab))]),
);

export const findPost = (id) => Object.values(posts).flat().find((p) => p.id === id);

export const skillCount = config.posts.skills.reduce((n, p) => n + (p.skills?.length || 0), 0);

export function statValue(key) {
  if (key === 'skills') return String(skillCount);
  if (key === 'years') {
    const months = monthsBetween(config.profile.careerStart);
    const years = Math.floor(months / 12);
    return years < 1 ? `${months}mo` : `${years}${months % 12 ? '+' : ''}`;
  }
  return '';
}

export { config };
