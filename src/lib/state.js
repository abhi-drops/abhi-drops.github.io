// App-wide persisted state + a tiny change signal.
import { idSet, load, save } from './storage.js';

export const likes = idSet('likes');
export const saved = idSet('saved');

const listeners = new Set();
export const onChange = (fn) => listeners.add(fn);
export const changed = () => listeners.forEach((fn) => fn());

export function getTheme() {
  return document.documentElement.dataset.theme || 'dark';
}

export function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  save('theme', theme);
  changed();
}

export const storySeen = {
  get: () => load('storySeen', false),
  set: () => save('storySeen', true),
};
