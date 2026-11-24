// Instagram "Notes" bubble. Text-only, or a song that plays when tapped.
import { h, asset } from '../lib/dom.js';
import { toast } from './toast.js';

export function NoteBubble(note) {
  if (!note || (!note.text && !note.song)) return null;
  const { song } = note;

  if (!song) {
    return h('div', { class: 'note' }, h('span', { class: 'note-text' }, note.text));
  }

  let audio = null;
  const el = h(
    'button',
    { class: 'note note--song', 'aria-label': `Play ${song.title} by ${song.artist}`, onclick: toggle },
    note.text && h('span', { class: 'note-text' }, note.text),
    h('span', { class: 'note-song' }, [
      h('span', { class: 'eq', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')),
      h('span', { class: 'note-song-name' }, h('span', null, `${song.title} · ${song.artist}`)),
    ]),
  );

  function setPlaying(on) {
    el.classList.toggle('is-playing', on);
    el.setAttribute('aria-label', `${on ? 'Pause' : 'Play'} ${song.title} by ${song.artist}`);
  }

  function toggle() {
    if (!audio) {
      audio = new Audio(asset(song.src));
      audio.loop = true;
      audio.volume = 0.6;
      audio.addEventListener('pause', () => setPlaying(false));
      audio.addEventListener('play', () => setPlaying(true));
    }
    if (audio.paused) {
      audio.play().catch(() => toast('Could not play the song'));
      toast(`♫ ${song.title} — ${song.artist}`);
    } else audio.pause();
  }

  return el;
}
