// Brand-style carousels for Experience, Skills and Education posts.
// Usage: node scripts/slides/posts.mjs [postId | skills]
// Writes public/images/projects/<postId>/01.jpg, 02.jpg, …
import { W, M, ROOT, SRC, txt, chip, chipRow, shot, browser, phone, imgBox, panel, logo, logoHex, heading, postChrome, renderSvg, theme, writeSet, textW, id } from './lib.mjs';

const [, , ONLY] = process.argv;
const OUT = `${ROOT}public/images/projects`;
const H = 1440;

// ---------- helpers ----------
const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const arrow = (x1, y1, x2, y2, c, w = 4) => {
  const a = Math.atan2(y2 - y1, x2 - x1), s = 16;
  return `<line x1="${x1}" y1="${y1}" x2="${x2 - Math.cos(a) * 6}" y2="${y2 - Math.sin(a) * 6}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>
    <path d="M${x2} ${y2} L${x2 - s * Math.cos(a - 0.45)} ${y2 - s * Math.sin(a - 0.45)} L${x2 - s * Math.cos(a + 0.45)} ${y2 - s * Math.sin(a + 0.45)} Z" fill="${c}"/>`;
};
const bars = (x, y, w, n, c, h = 14, gap = 22, r = rng(n * 7 + 3)) =>
  Array.from({ length: n }, (_, i) => `<rect x="${x}" y="${y + i * gap}" width="${w * (0.45 + r() * 0.55)}" height="${h}" rx="${h / 2}" fill="${c}"/>`).join('');
const star = (cx, cy, r, c, o = 1) => `<path d="M${cx} ${cy - r} Q${cx} ${cy} ${cx + r} ${cy} Q${cx} ${cy} ${cx} ${cy + r} Q${cx} ${cy} ${cx - r} ${cy} Q${cx} ${cy} ${cx} ${cy - r} Z" fill="${c}" opacity="${o}"/>`;
const check = (cx, cy, r, bg, fg = '#fff') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${bg}"/><path d="M${cx - r * 0.45} ${cy} l${r * 0.32} ${r * 0.32} l${r * 0.6} ${-r * 0.62}" fill="none" stroke="${fg}" stroke-width="${r * 0.28}" stroke-linecap="round" stroke-linejoin="round"/>`;
const dot = (cx, cy, r, c) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}"/>`;
const mono = (s, x, y, size, fill, o = {}) => txt([s], x, y, { size, fill, family: 'JetBrains Mono', weight: 500, ...o });
const sans = (s, x, y, size, fill, o = {}) => txt([].concat(s), x, y, { size, fill, family: 'Inter', weight: 500, ...o });

// Logo chip row for stack slides: [slug, label]
function logoChips(x, y, items, t, { size = 30, h = 72, gap = 14, maxW = W - M * 2 } = {}) {
  let cx = x, cy = y, out = '';
  for (const [slug, label] of items) {
    const w = textW(label, size) + h + 34;
    if (cx + w > x + maxW) { cx = x; cy += h + gap; }
    out += `<rect x="${cx}" y="${cy}" width="${w}" height="${h}" rx="${h / 2}" fill="${t.chipBg}" stroke="${t.line}" stroke-width="2"/>
      <circle cx="${cx + h / 2}" cy="${cy + h / 2}" r="${h / 2 - 9}" fill="#fff"/>${logo(slug, cx + h / 2 - (h - 34) / 2, cy + 17, h - 34)}
      ${txt([label], cx + h + 4, cy + h / 2 + size * 0.36, { size, weight: 600, fill: t.text })}`;
    cx += w + gap;
  }
  return { svg: out, height: cy - y + h };
}

// ---------- slide templates ----------
async function cover(t, s, i, n) {
  let b = '';
  b += chip(M, 196, s.kicker, { bg: t.chipBg, fg: t.accentText, size: 22, h: 46, family: 'JetBrains Mono', weight: 500 }).svg;
  const big = s.nameSize || 132;
  b += txt(s.name, M - 4, 214 + big * 1.05, { size: big, weight: 900, fill: t.text, ls: -big * 0.035, lh: big * 0.98 });
  const ty = 214 + big * 1.05 + (s.name.length - 1) * big * 0.98 + 74;
  b += txt(s.tagline, M, ty, { size: 40, weight: 500, fill: t.sub, lh: 52, family: 'Inter' });
  b += await s.art(t, ty + (s.tagline.length - 1) * 52 + 50);
  return renderSvg(b + postChrome(t, i, n, { H }), { H, t });
}
async function feature(t, s, i, n, last) {
  const hd = heading(t, s.title, s.sub);
  const top = Math.max(hd.bottom + 40, 540);
  return renderSvg(hd.svg + (await s.art(t, top, 1310 - top)) + postChrome(t, i, n, { H, last }), { H, t });
}
async function stack(t, s, i, n) {
  const hd = heading(t, s.title, s.sub);
  let y = hd.bottom + 30, b = hd.svg;
  b += txt(['BUILT WITH'], M, y, { size: 22, weight: 600, fill: t.accentText, family: 'JetBrains Mono', ls: 2 });
  // Big logo cards fill the slide; leave room for link cards below
  const linksH = (s.links?.length || 0) * 142 + (s.links?.length ? 40 : 0);
  const rows = Math.ceil(s.tech.length / 2), gap = 24;
  const ch = Math.min(200, (1300 - (y + 30) - linksH - (rows - 1) * gap) / rows);
  b += logoGrid(M, y + 30, IW, s.tech.map(([slug, label]) => [slug, label]), { ch, gap });
  y += 30 + rows * (ch + gap) + 20;
  for (const [label, value] of s.links || []) {
    b += `<rect x="${M}" y="${y}" width="${W - M * 2}" height="118" rx="28" fill="${t.chipBg}" stroke="${t.line}" stroke-width="2"/>`;
    b += txt([label.toUpperCase()], M + 36, y + 46, { size: 20, weight: 600, fill: t.accentText, family: 'JetBrains Mono', ls: 2 });
    b += txt([value], M + 36, y + 90, { size: Math.min(34, (W - M * 2 - 130) / (value.length * 0.56)), weight: 600, fill: t.text, family: 'Inter' });
    b += txt(['↗'], W - M - 40, y + 76, { size: 40, weight: 600, fill: t.accentText, anchor: 'end', family: 'Inter' });
    y += 142;
  }
  if (s.note) b += txt(s.note, M, y + 40, { size: 28, fill: t.sub, family: 'Inter', lh: 40 });
  return renderSvg(b + postChrome(t, i, n, { H, last: true }), { H, t });
}

async function build(t, p) {
  const n = p.slides.length + 1 + (p.stack ? 1 : 0);
  const out = [await cover(t, p.cover, 0, n)];
  for (const [k, s] of p.slides.entries()) out.push(await feature(t, s, k + 1, n, !p.stack && k === p.slides.length - 1));
  if (p.stack) out.push(await stack(t, p.stack, n - 1, n));
  return out;
}

// ---------- marks ----------
const mark = (label, fg, bg, glyph) => (x, y) =>
  `<g><rect x="${x}" y="${y}" width="48" height="48" rx="14" fill="${bg}"/>${txt([glyph], x + 24, y + 33, { size: glyph.length > 2 ? 18 : 24, weight: 900, fill: fg === '#fff' ? bg === '#fff' ? '#000' : '#fff' : fg, anchor: 'middle', family: 'JetBrains Mono' })}${txt([label], x + 62, y + 34, { size: 26, weight: 700, fill: fg })}</g>`;

// =====================================================================
// EXPERIENCE
// =====================================================================
const T = {};

T.fullstack = theme({
  text: '#ffffff', sub: 'rgba(230,234,255,0.74)', accent: '#d4ff3a', onAccent: '#14104a', accentText: '#d4ff3a',
  logo: (x, y) => `<g><rect x="${x}" y="${y}" width="48" height="48" rx="14" fill="#d4ff3a"/>${txt(['</>'], x + 24, y + 31, { size: 18, weight: 800, fill: '#14104a', anchor: 'middle', family: 'JetBrains Mono' })}${txt(['Full-Stack @ Digitrell'], x + 62, y + 34, { size: 26, weight: 700, fill: '#fff' })}</g>`,
  cta: 'Feb 2025 – Present',
  defs: `<linearGradient id="fs-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#140f4a"/><stop offset="1" stop-color="#2f49e6"/></linearGradient>`,
  bg: (H) => `<rect width="${W}" height="${H}" fill="url(#fs-bg)"/>`,
  decor: (H) => Array.from({ length: Math.ceil(H / 48) * 23 }, (_, k) => `<circle cx="${(k % 23) * 48 + 12}" cy="${Math.floor(k / 23) * 48 + 12}" r="2" fill="rgba(255,255,255,0.09)"/>`).join('')
    + `<text x="${W - 40}" y="${H - 180}" text-anchor="end" font-family="JetBrains Mono" font-size="420" font-weight="800" fill="none" stroke="rgba(212,255,58,0.10)" stroke-width="4">{}</text>`,
});

T.aidocs = theme({
  text: '#ffffff', sub: 'rgba(220,225,255,0.72)', accent: '#5ef2ff', onAccent: '#071018', accentText: '#5ef2ff', panel: '#11131c',
  logo: (x, y) => `<g><rect x="${x}" y="${y}" width="48" height="48" rx="14" fill="url(#ai-grad)"/>${star(x + 24, y + 24, 14, '#fff')}${txt(['AI Docs @ Digitrell'], x + 62, y + 34, { size: 26, weight: 700, fill: '#fff' })}</g>`,
  cta: 'Built at Digitrell · 2025', shadow: 0.6,
  defs: `<linearGradient id="ai-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff4fd8"/><stop offset="1" stop-color="#5ef2ff"/></linearGradient>
    <radialGradient id="ai-a" cx="0.1" cy="0.1" r="0.7"><stop offset="0" stop-color="#ff4fd8" stop-opacity="0.35"/><stop offset="1" stop-color="#ff4fd8" stop-opacity="0"/></radialGradient>
    <radialGradient id="ai-b" cx="0.95" cy="0.8" r="0.7"><stop offset="0" stop-color="#2de2ff" stop-opacity="0.3"/><stop offset="1" stop-color="#2de2ff" stop-opacity="0"/></radialGradient>`,
  bg: (H) => `<rect width="${W}" height="${H}" fill="#07080f"/><rect width="${W}" height="${H}" fill="url(#ai-a)"/><rect width="${W}" height="${H}" fill="url(#ai-b)"/>`,
  decor: () => { const r = rng(11); return Array.from({ length: 26 }, () => star(r() * W, r() * 1400, 4 + r() * 10, '#fff', 0.08 + r() * 0.2)).join(''); },
});

T.yard = theme({
  text: '#ffffff', sub: 'rgba(255,255,255,0.7)', accent: '#ffcc00', onAccent: '#1b1b1b', accentText: '#ffcc00', panel: '#26282d',
  logo: (x, y) => `<g><rect x="${x}" y="${y}" width="48" height="48" rx="14" fill="#ffcc00"/><rect x="${x + 10}" y="${y + 16}" width="20" height="16" rx="2" fill="#1b1b1b"/><rect x="${x + 30}" y="${y + 21}" width="9" height="11" rx="2" fill="#1b1b1b"/>${txt(['Yard & Warehouse'], x + 62, y + 34, { size: 26, weight: 700, fill: '#fff' })}</g>`,
  cta: 'Production · 2025 – Present',
  bg: (H) => `<rect width="${W}" height="${H}" fill="#1b1d21"/>`,
  defs: `<pattern id="hz" width="56" height="56" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="28" height="56" fill="#ffcc00"/><rect x="28" width="28" height="56" fill="#1b1b1b"/></pattern>`,
  decor: (H) => `<rect y="0" width="${W}" height="14" fill="url(#hz)"/><rect y="${H - 14}" width="${W}" height="14" fill="url(#hz)"/>
    ${Array.from({ length: 9 }, (_, k) => `<rect x="${k * 130 - 20}" y="${H - 300}" width="8" height="150" fill="rgba(255,255,255,0.05)"/>`).join('')}`,
});

T.sap = theme({
  dark: false, text: '#0b1f33', sub: 'rgba(11,31,51,0.66)', accent: '#0a6ed1', onAccent: '#ffffff', accentText: '#0a6ed1',
  logo: (x, y) => `<g><rect x="${x}" y="${y}" width="48" height="48" rx="12" fill="#1f9d55"/>${[0, 1, 2].map((r) => [0, 1, 2].map((c) => `<rect x="${x + 9 + c * 10.5}" y="${y + 9 + r * 10.5}" width="8.5" height="8.5" rx="1.5" fill="#fff" opacity="${r === 0 ? 1 : 0.7}"/>`).join('')).join('')}${txt(['SAP MM Wrapper'], x + 62, y + 34, { size: 26, weight: 700, fill: '#0b1f33' })}</g>`,
  cta: 'Built at Digitrell · 2025',
  bg: (H) => `<rect width="${W}" height="${H}" fill="#f5f9ff"/>`,
  decor: (H) => `${Array.from({ length: Math.ceil(W / 60) + 1 }, (_, k) => `<line x1="${k * 60}" y1="0" x2="${k * 60}" y2="${H}" stroke="rgba(10,110,209,0.07)" stroke-width="2"/>`).join('')}
    ${Array.from({ length: Math.ceil(H / 40) + 1 }, (_, k) => `<line x1="0" y1="${k * 40}" x2="${W}" y2="${k * 40}" stroke="rgba(10,110,209,0.07)" stroke-width="2"/>`).join('')}`,
});

T.intern = theme({
  dark: false, text: '#18301a', sub: 'rgba(24,48,26,0.68)', accent: '#2f7d32', onAccent: '#ffffff', accentText: '#2f7d32',
  logo: (x, y) => `<g><circle cx="${x + 24}" cy="${y + 24}" r="24" fill="#2f7d32"/><path d="M${x + 24} ${y + 36} V${y + 22} M${x + 24} ${y + 24} q-10 0 -12 -10 q10 0 12 10 M${x + 24} ${y + 22} q8 -2 10 -10 q-9 0 -10 10" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>${txt(['Intern @ Digitrell'], x + 62, y + 34, { size: 26, weight: 700, fill: '#18301a' })}</g>`,
  cta: 'Nov 2024 – Feb 2025',
  defs: `<radialGradient id="in-a" cx="0.9" cy="0.1" r="0.6"><stop offset="0" stop-color="#ffb703" stop-opacity="0.35"/><stop offset="1" stop-color="#ffb703" stop-opacity="0"/></radialGradient>`,
  bg: (H) => `<rect width="${W}" height="${H}" fill="#eef6e6"/><rect width="${W}" height="${H}" fill="url(#in-a)"/>`,
  decor: () => { const r = rng(5); return Array.from({ length: 14 }, () => `<circle cx="${r() * W}" cy="${r() * 1440}" r="${6 + r() * 26}" fill="#2f7d32" opacity="${0.04 + r() * 0.06}"/>`).join(''); },
});

// ----- illustrations -----
function componentBoard(t, x, y, w, h) {
  const P = '#ffffff', ink = '#1a1446', acc = '#3b5bff', lime = '#d4ff3a';
  let s = panel(x, y, w, h, { fill: P, r: 32 });
  s += mono('components/', x + 36, y + 56, 22, '#8a8fb5');
  const cx = x + 36, cw = (w - 108) / 2;
  // buttons
  s += `<rect x="${cx}" y="${y + 86}" width="${cw * 0.62}" height="62" rx="16" fill="${acc}"/>${sans('Primary', cx + cw * 0.31, y + 126, 24, '#fff', { anchor: 'middle', weight: 700 })}`;
  s += `<rect x="${cx + cw * 0.68}" y="${y + 86}" width="${cw * 0.32 + 4}" height="62" rx="16" fill="none" stroke="${ink}" stroke-width="3"/>${sans('Ghost', cx + cw * 0.84 + 2, y + 126, 22, ink, { anchor: 'middle', weight: 700 })}`;
  // input
  s += sans('Shipment ID', cx, y + 196, 20, '#6b7099', { weight: 600 });
  s += `<rect x="${cx}" y="${y + 210}" width="${cw}" height="62" rx="14" fill="#f3f4fb" stroke="#d7daf0" stroke-width="2"/>${mono('SH-2048', cx + 20, y + 249, 22, ink)}`;
  // toggle + checkbox
  s += `<rect x="${cx}" y="${y + 300}" width="84" height="46" rx="23" fill="${lime}"/><circle cx="${cx + 61}" cy="${y + 323}" r="17" fill="${ink}"/>${sans('Auto-refresh', cx + 100, y + 331, 22, ink, { weight: 600 })}`;
  s += `<rect x="${cx}" y="${y + 370}" width="40" height="40" rx="10" fill="${acc}"/><path d="M${cx + 10} ${y + 390} l8 8 l13 -15" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>${sans('Mark as loaded', cx + 56, y + 398, 22, ink, { weight: 600 })}`;
  // right column: card + chips + table
  const rx = cx + cw + 36;
  s += `<rect x="${rx}" y="${y + 86}" width="${cw}" height="186" rx="20" fill="#f3f4fb"/>`;
  s += `<circle cx="${rx + 46}" cy="${y + 134}" r="26" fill="${acc}" opacity="0.18"/><rect x="${rx + 34}" y="${y + 122}" width="24" height="24" rx="5" fill="${acc}"/>`;
  s += sans('Dock 04', rx + 88, y + 130, 24, ink, { weight: 700 }) + sans('Loading · 12 pallets', rx + 88, y + 160, 19, '#6b7099');
  s += `<rect x="${rx + 24}" y="${y + 200}" width="${cw - 48}" height="14" rx="7" fill="#dfe2f5"/><rect x="${rx + 24}" y="${y + 200}" width="${(cw - 48) * 0.66}" height="14" rx="7" fill="${acc}"/>`;
  s += sans('66% complete', rx + 24, y + 248, 18, '#6b7099');
  const tags = [['Ready', '#16a34a'], ['Waiting', '#f59e0b'], ['Late', '#ef4444']];
  let tx = rx;
  for (const [l, c] of tags) { const tw = textW(l, 20) + 40; s += `<rect x="${tx}" y="${y + 300}" width="${tw}" height="44" rx="22" fill="${c}" opacity="0.14"/>${sans(l, tx + 20, y + 329, 20, c, { weight: 700 })}`; tx += tw + 10; }
  for (let k = 0; k < 3; k++) {
    const ry = y + 366 + k * 50;
    s += `<rect x="${rx}" y="${ry}" width="${cw}" height="40" rx="10" fill="${k % 2 ? '#fff' : '#f3f4fb'}"/>${bars(rx + 16, ry + 13, cw * 0.5, 1, '#c9cdea', 14)}${dot(rx + cw - 26, ry + 20, 8, tags[k][1])}`;
  }
  // bottom: avatar group + "reusable" label
  const by = y + h - 70;
  for (let k = 0; k < 4; k++) s += `<circle cx="${cx + 26 + k * 34}" cy="${by}" r="24" fill="${['#ff8a65', '#7c4dff', '#26c6da', '#ffd54f'][k]}" stroke="#fff" stroke-width="4"/>`;
  s += `<rect x="${x + w - 300}" y="${by - 26}" width="264" height="52" rx="26" fill="${ink}"/>${mono('reusable × typed', x + w - 168, by + 8, 21, lime, { anchor: 'middle' })}`;
  return s;
}

function wireToUI(t, x, y, w, h) {
  const cw = (w - 110) / 2;
  let s = `<rect x="${x}" y="${y}" width="${cw}" height="${h}" rx="26" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.55)" stroke-width="3" stroke-dasharray="14 10"/>`;
  s += mono('wireframe', x + 28, y + 50, 22, 'rgba(255,255,255,0.7)');
  const box = (bx, by, bw, bh) => `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="10" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="3"/><line x1="${bx}" y1="${by}" x2="${bx + bw}" y2="${by + bh}" stroke="rgba(255,255,255,0.3)" stroke-width="2"/><line x1="${bx + bw}" y1="${by}" x2="${bx}" y2="${by + bh}" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>`;
  s += box(x + 28, y + 78, cw - 56, h * 0.3);
  for (let k = 0; k < 3; k++) s += `<rect x="${x + 28}" y="${y + 100 + h * 0.3 + k * 42}" width="${(cw - 56) * [0.9, 0.7, 0.8][k]}" height="18" rx="9" fill="rgba(255,255,255,0.35)"/>`;
  s += `<rect x="${x + 28}" y="${y + h - 100}" width="${cw - 56}" height="64" rx="14" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="3"/>`;
  s += arrow(x + cw + 18, y + h / 2, x + cw + 92, y + h / 2, '#d4ff3a', 6);
  const rx = x + cw + 110;
  s += panel(rx, y, cw, h, { fill: '#fff', r: 26 });
  s += `<defs><linearGradient id="wg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b5bff"/><stop offset="1" stop-color="#9b5cff"/></linearGradient></defs>`;
  s += `<rect x="${rx + 28}" y="${y + 78}" width="${cw - 56}" height="${h * 0.3}" rx="16" fill="url(#wg)"/>`;
  s += `<rect x="${rx + 52}" y="${y + 78 + h * 0.3 - 64}" width="150" height="40" rx="20" fill="#d4ff3a"/>${sans('In transit', rx + 127, y + 78 + h * 0.3 - 37, 19, '#14104a', { anchor: 'middle', weight: 700 })}`;
  s += sans('Trailer TR-118', rx + 28, y + 130 + h * 0.3, 26, '#14104a', { weight: 800 });
  s += sans('ETA 14:30 · Dock 06', rx + 28, y + 168 + h * 0.3, 20, '#6b7099');
  s += bars(rx + 28, y + 196 + h * 0.3, cw - 80, 1, '#e3e6f7', 14);
  s += `<rect x="${rx + 28}" y="${y + h - 100}" width="${cw - 56}" height="64" rx="14" fill="#3b5bff"/>${sans('Assign dock', rx + cw / 2, y + h - 58, 24, '#fff', { anchor: 'middle', weight: 700 })}`;
  s += mono('responsive · accessible', rx + 28, y + 50, 20, '#8a8fb5');
  return s;
}

function apiStates(t, x, y, w, h) {
  const ch = (h - 60) / 3, ink = '#14104a';
  let s = '';
  const card = (k, label, labelC, body) => { const cy = y + k * (ch + 30); return panel(x + k * 30, cy, w - 60, ch, { fill: '#fff', r: 24 }) + `<rect x="${x + k * 30 + 28}" y="${cy + 26}" width="${textW(label, 18, 0.62) + 32}" height="38" rx="19" fill="${labelC}" opacity="0.16"/>` + mono(label, x + k * 30 + 44, cy + 51, 18, labelC, { weight: 700 }) + body(x + k * 30, cy); };
  s += card(0, 'loading', '#3b5bff', (cx, cy) => [0, 1, 2].map((r) => `<rect x="${cx + 28}" y="${cy + 88 + r * 34}" width="${(w - 160) * [0.85, 0.6, 0.72][r]}" height="20" rx="10" fill="#e6e8f6"/>`).join('') + `<circle cx="${cx + w - 120}" cy="${cy + ch / 2}" r="26" fill="none" stroke="#e6e8f6" stroke-width="8"/><path d="M${cx + w - 120} ${cy + ch / 2 - 26} a26 26 0 0 1 26 26" fill="none" stroke="#3b5bff" stroke-width="8" stroke-linecap="round"/>`);
  s += card(1, 'error', '#ef4444', (cx, cy) => sans('Couldn’t load shipments', cx + 28, cy + 110, 26, ink, { weight: 700 }) + sans('Network timeout — please try again.', cx + 28, cy + 146, 20, '#6b7099') + `<rect x="${cx + w - 230}" y="${cy + ch / 2 - 28}" width="140" height="56" rx="16" fill="#ef4444"/>${sans('Retry', cx + w - 160, cy + ch / 2 + 8, 22, '#fff', { anchor: 'middle', weight: 700 })}`);
  s += card(2, 'success', '#16a34a', (cx, cy) => [0, 1].map((r) => `<rect x="${cx + 28}" y="${cy + 82 + r * 48}" width="${w - 140}" height="38" rx="10" fill="#f3f4fb"/>${mono(['SH-2048', 'SH-2051'][r], cx + 44, cy + 108 + r * 48, 18, ink)}<rect x="${cx + w - 210}" y="${cy + 88 + r * 48}" width="88" height="26" rx="13" fill="#16a34a" opacity="0.16"/>${mono('200', cx + w - 166, cy + 107 + r * 48, 16, '#16a34a', { anchor: 'middle', weight: 700 })}`).join(''));
  return s;
}

function backendFlow(t, x, y, w, h) {
  const ink = '#14104a', lime = '#d4ff3a';
  const node = (nx, ny, nw, label, sub, fill = '#fff', fg = ink) => panel(nx, ny, nw, 110, { fill, r: 22 }) + sans(label, nx + nw / 2, ny + 50, 26, fg, { anchor: 'middle', weight: 800 }) + mono(sub, nx + nw / 2, ny + 84, 17, fg === ink ? '#6b7099' : 'rgba(20,16,74,0.7)', { anchor: 'middle' });
  const cx = x + w / 2;
  let s = node(cx - 160, y, 320, 'React UI', 'fetch / axios', lime, ink);
  s += arrow(cx, y + 116, cx, y + 176, '#fff', 5);
  s += node(cx - 210, y + 182, 420, 'API route', 'POST /api/shipments');
  s += arrow(cx, y + 298, cx, y + 358, '#fff', 5);
  s += panel(x + 20, y + 364, w - 40, 128, { fill: 'rgba(255,255,255,0.1)', stroke: 'rgba(255,255,255,0.35)', r: 24, shadow: false });
  s += mono('middleware', x + 44, y + 398, 18, 'rgba(255,255,255,0.7)');
  const mw = ['auth', 'validate', 'log'];
  mw.forEach((m, k) => { const bw = (w - 140) / 3; s += `<rect x="${x + 44 + k * (bw + 16)}" y="${y + 414}" width="${bw}" height="58" rx="14" fill="#fff"/>${mono(m, x + 44 + k * (bw + 16) + bw / 2, y + 451, 20, ink, { anchor: 'middle', weight: 700 })}`; });
  s += arrow(cx - 150, y + 498, x + w * 0.2, y + 560, '#fff', 5) + arrow(cx + 150, y + 498, x + w * 0.8, y + 560, '#fff', 5);
  s += node(x, y + 566, w / 2 - 20, 'SQL Server', 'T-SQL');
  s += node(x + w / 2 + 20, y + 566, w / 2 - 20, '3rd-party', 'service integrations');
  return s;
}

function sqlCard(t, x, y, w, h) {
  const k = '#c792ea', f = '#82aaff', str = '#c3e88d', c = '#f78c6c', g = '#e8eaff', dim = '#676e95';
  const code = [
    [[k, 'SELECT '], [g, 's.id, s.status, d.door']],
    [[k, 'FROM '], [g, 'dbo.Shipments '], [f, 's']],
    [[k, 'JOIN '], [g, 'dbo.Docks '], [f, 'd '], [k, 'ON '], [g, 'd.id = s.dock_id']],
    [[k, 'WHERE '], [g, 's.created_at >= '], [str, '@since']],
    [[dim, '-- index seek instead of scan']],
    [[k, 'OPTION '], [g, '('], [c, 'RECOMPILE'], [g, ');']],
  ];
  let s = panel(x, y, w, h * 0.62, { fill: '#0f1226', r: 26 });
  s += dot(x + 34, y + 32, 7, '#ff5f57') + dot(x + 56, y + 32, 7, '#febc2e') + dot(x + 78, y + 32, 7, '#28c840') + mono('dashboard_query.sql', x + w / 2, y + 39, 18, dim, { anchor: 'middle' });
  code.forEach((line, r) => {
    let lx = x + 80;
    s += mono(String(r + 1), x + 40, y + 104 + r * 48, 22, dim);
    for (const [col, seg] of line) { s += txt([seg], lx, y + 104 + r * 48, { size: 24, fill: col, family: 'JetBrains Mono', weight: 500 }); lx += seg.length * 24 * 0.6; }
  });
  const by = y + h * 0.62 + 40;
  s += panel(x, by, w, h * 0.38 - 40, { fill: '#fff', r: 26 });
  s += sans('Dashboard load', x + 36, by + 58, 26, '#14104a', { weight: 800 });
  [['before', 0.92, '#c9cdea'], ['after', 0.34, '#d4ff3a']].forEach(([l, v, col], r) => {
    const ry = by + 92 + r * 64;
    s += mono(l, x + 36, ry + 30, 20, '#6b7099') + `<rect x="${x + 150}" y="${ry + 8}" width="${(w - 200) * v}" height="32" rx="16" fill="${col}" ${r ? 'stroke="#14104a" stroke-width="2"' : ''}/>`;
  });
  s += sans('production performance fix', x + w - 36, by + 58, 20, '#6b7099', { anchor: 'end' });
  return s;
}

function shipFlow(t, x, y, w, h) {
  const lime = '#d4ff3a';
  let s = panel(x, y, w, h * 0.46, { fill: '#fff', r: 26 });
  const cols = ['To do', 'In progress', 'Review', 'Done'];
  const cw = (w - 40 - 16 * 3) / 4;
  cols.forEach((c, k) => {
    const cx = x + 20 + k * (cw + 16);
    s += sans(c, cx + 8, y + 50, 20, '#6b7099', { weight: 700 });
    for (let r = 0; r < (k === 3 ? 3 : 2 - (k % 2)); r++) s += `<rect x="${cx}" y="${y + 70 + r * 78}" width="${cw}" height="64" rx="12" fill="${k === 3 ? '#ecffd0' : '#f3f4fb'}"/>${bars(cx + 14, y + 86 + r * 78, cw - 40, 1, '#c9cdea', 12)}<rect x="${cx + 14}" y="${y + 108 + r * 78}" width="40" height="10" rx="5" fill="${['#3b5bff', '#f59e0b', '#9b5cff', '#16a34a'][k]}"/>`;
  });
  const gy = y + h * 0.46 + 60;
  s += mono('git', x, gy, 22, 'rgba(255,255,255,0.7)');
  const lanes = [['main', '#ffffff'], ['staging', lime], ['feature/*', '#7dd3fc']];
  lanes.forEach(([l, c], k) => {
    const ly = gy + 50 + k * 70;
    s += mono(l, x, ly + 8, 20, c) + `<line x1="${x + 150}" y1="${ly}" x2="${x + w}" y2="${ly}" stroke="${c}" stroke-width="5" stroke-linecap="round" opacity="0.8"/>`;
  });
  const dots = [[2, 220], [2, 330], [1, 420], [2, 470], [1, 560], [0, 680], [2, 620], [1, 760], [0, 860]];
  for (const [k, px] of dots) s += dot(x + px, gy + 50 + k * 70, 13, lanes[k][1]) + dot(x + px, gy + 50 + k * 70, 6, '#140f4a');
  s += `<path d="M${x + 470} ${gy + 190} C${x + 520} ${gy + 190} ${x + 510} ${gy + 120} ${x + 560} ${gy + 120}" stroke="#7dd3fc" stroke-width="4" fill="none"/><path d="M${x + 560} ${gy + 120} C${x + 620} ${gy + 120} ${x + 620} ${gy + 50} ${x + 680} ${gy + 50}" stroke="${lime}" stroke-width="4" fill="none"/>`;
  const py = gy + 290;
  ['build', 'test', 'deploy'].forEach((st, k) => {
    const bx = x + k * ((w + 24) / 3), bw = (w + 24) / 3 - 24;
    s += `<rect x="${bx}" y="${py}" width="${bw}" height="64" rx="32" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>${check(bx + 34, py + 32, 18, '#16a34a')}${mono(st, bx + 64, py + 40, 22, '#fff', { weight: 700 })}`;
  });
  return s;
}

// AI docs
function docSheet(x, y, w, h, { fill = '#fff', line = '#d9dcef', hl } = {}) {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${fill}" filter="url(#soft)"/><path d="M${x + w - 40} ${y} v40 h40" fill="#e9ebf7"/>`;
  for (let r = 0; r < Math.floor((h - 70) / 30); r++) s += `<rect x="${x + 26}" y="${y + 50 + r * 30}" width="${(w - 52) * [0.9, 0.7, 0.82, 0.6, 0.76, 0.5][r % 6]}" height="12" rx="6" fill="${line}"/>`;
  if (hl) for (const [r, c] of hl) s += `<rect x="${x + 18}" y="${y + 42 + r * 30}" width="${w - 36}" height="28" rx="8" fill="${c}" opacity="0.28" stroke="${c}" stroke-width="2"/>`;
  return s;
}
function aiCoverArt(t, top) {
  const y = top + 30;
  let s = '';
  for (let k = 0; k < 4; k++) s += `<g transform="rotate(${-12 + k * 6} ${M + 130} ${y + 260})">${docSheet(M + 40 + k * 14, y + 60 + k * 12, 220, 300)}</g>`;
  s += arrow(M + 330, y + 250, M + 420, y + 250, '#5ef2ff', 6);
  s += `<rect x="${M + 430}" y="${y + 150}" width="200" height="200" rx="48" fill="url(#ai-grad)" filter="url(#shadow)"/>${star(M + 530, y + 250, 58, '#fff')}${star(M + 590, y + 192, 16, '#fff', 0.9)}`;
  s += arrow(M + 650, y + 250, M + 740, y + 250, '#5ef2ff', 6);
  s += panel(M + 750, y + 120, 186, 260, { fill: '#11131c', stroke: 'rgba(94,242,255,0.4)', r: 22 });
  for (let r = 0; r < 4; r++) s += `<rect x="${M + 772}" y="${y + 150 + r * 56}" width="64" height="16" rx="8" fill="rgba(255,255,255,0.3)"/><rect x="${M + 846}" y="${y + 150 + r * 56}" width="70" height="16" rx="8" fill="#5ef2ff" opacity="0.8"/>`;
  s += mono('documents', M + 150, y + 470, 22, 'rgba(255,255,255,0.6)', { anchor: 'middle' }) + mono('AI', M + 530, y + 400, 22, 'rgba(255,255,255,0.6)', { anchor: 'middle' }) + mono('records', M + 843, y + 420, 22, 'rgba(255,255,255,0.6)', { anchor: 'middle' });
  return s;
}
function findDoc(t, x, y, w, h) {
  let s = '';
  const cols = 4, rows = 3, gw = (w - 30 * 3) / cols, gh = (h - 160 - 30 * 2) / rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const hit = r === 1 && c === 2;
    const dx = x + c * (gw + 30), dy = y + r * (gh + 30);
    s += `<g opacity="${hit ? 1 : 0.35}">${docSheet(dx, dy, gw, gh, { hl: hit ? [[1, '#5ef2ff']] : null })}</g>`;
    if (hit) s += `<rect x="${dx - 8}" y="${dy - 8}" width="${gw + 16}" height="${gh + 16}" rx="20" fill="none" stroke="#5ef2ff" stroke-width="5"/>`;
  }
  const mx = x + 2 * (gw + 30) + gw * 0.85, my = y + (gh + 30) + gh * 0.85;
  s += `<circle cx="${mx}" cy="${my}" r="64" fill="rgba(94,242,255,0.12)" stroke="#fff" stroke-width="10"/><line x1="${mx + 46}" y1="${my + 46}" x2="${mx + 100}" y2="${my + 100}" stroke="#fff" stroke-width="16" stroke-linecap="round"/>`;
  s += `<rect x="${x}" y="${y + h - 110}" width="${w}" height="90" rx="45" fill="rgba(255,255,255,0.06)" stroke="rgba(94,242,255,0.35)" stroke-width="2"/>${check(x + 50, y + h - 65, 22, '#16a34a')}${sans('Matched the right document from the set', x + 90, y + h - 56, 28, '#fff', { weight: 600 })}`;
  return s;
}
function extractArt(t, x, y, w, h) {
  const cols = ['#5ef2ff', '#ff4fd8', '#ffd166', '#7cff8a'];
  let s = docSheet(x, y + 20, w * 0.44, h - 40, { hl: [[1, cols[0]], [4, cols[1]], [7, cols[2]], [11, cols[3]]] });
  const fields = [['document_type', 'Bill of lading'], ['reference_no', 'BL-48213'], ['date', '2025-06-18'], ['quantity', '1,240 cases']];
  const fx = x + w * 0.54;
  fields.forEach(([k2, v], r) => {
    const fy = y + 40 + r * ((h - 80) / 4);
    s += arrow(x + w * 0.44 + 10, y + 20 + 42 + [1, 4, 7, 11][r] * 30 + 14, fx - 10, fy + 50, cols[r], 3);
    s += panel(fx, fy, w * 0.46, 100, { fill: '#11131c', stroke: cols[r], r: 20 });
    s += mono(k2, fx + 24, fy + 40, 20, cols[r]) + sans(v, fx + 24, fy + 78, 26, '#fff', { weight: 700 });
  });
  return s;
}
function recordsArt(t, x, y, w, h) {
  let s = panel(x, y, w, h * 0.72, { fill: '#11131c', stroke: 'rgba(94,242,255,0.35)', r: 26 });
  const cols = [['id', 0.12], ['type', 0.28], ['reference', 0.26], ['status', 0.34]];
  let cx = x + 30;
  cols.forEach(([c, f]) => { s += mono(c, cx, y + 60, 20, '#5ef2ff'); cx += (w - 60) * f; });
  s += `<line x1="${x + 24}" y1="${y + 84}" x2="${x + w - 24}" y2="${y + 84}" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>`;
  const rows = [['01', 'Invoice', 'INV-7731'], ['02', 'Bill of lading', 'BL-48213'], ['03', 'Packing list', 'PL-0932'], ['04', 'Delivery note', 'DN-5520'], ['05', 'Invoice', 'INV-7740']];
  rows.forEach((r, k) => {
    const ry = y + 130 + k * ((h * 0.72 - 160) / 5);
    let rx = x + 30;
    r.forEach((v, j) => { s += txt([v], rx, ry, { size: 22, fill: j ? '#e8eaf0' : 'rgba(255,255,255,0.45)', family: j === 2 ? 'JetBrains Mono' : 'Inter', weight: 500 }); rx += (w - 60) * cols[j][1]; });
    s += `<rect x="${rx}" y="${ry - 26}" width="150" height="36" rx="18" fill="#16a34a" opacity="0.2"/>${sans('structured', rx + 75, ry - 2, 18, '#7cff8a', { anchor: 'middle', weight: 700 })}`;
  });
  const by = y + h * 0.72 + 40;
  s += `<rect x="${x}" y="${by}" width="${w}" height="${h * 0.28 - 40}" rx="26" fill="rgba(255,255,255,0.06)"/>`;
  s += mono('{ "type": "Bill of lading", "reference": "BL-48213", ... }', x + 30, by + (h * 0.28 - 40) / 2 + 8, 22, '#c3e88d');
  return s;
}

// Yard
function yardMap(t, x, y, w, h, { big = true } = {}) {
  let s = panel(x, y, w, h, { fill: '#2a2d33', r: 28 });
  const doors = 8, dw = (w - 60) / doors;
  for (let k = 0; k < doors; k++) {
    const dx = x + 30 + k * dw;
    s += `<rect x="${dx + 6}" y="${y + 26}" width="${dw - 12}" height="44" rx="6" fill="#3a3e46"/>${mono(`D${k + 1}`, dx + dw / 2, y + 56, 18, '#c9ccd3', { anchor: 'middle', weight: 700 })}`;
  }
  s += `<rect x="${x + 30}" y="${y + 74}" width="${w - 60}" height="6" fill="#ffcc00"/>`;
  const st = ['#ffcc00', '#22c55e', null, '#22c55e', '#ffcc00', null, '#9ca3af', '#22c55e'];
  st.forEach((c, k) => { if (!c) return; const dx = x + 30 + k * dw; s += `<rect x="${dx + 12}" y="${y + 92}" width="${dw - 24}" height="${h * 0.32}" rx="8" fill="${c}"/><rect x="${dx + 12}" y="${y + 92 + h * 0.32 - 34}" width="${dw - 24}" height="34" rx="6" fill="rgba(0,0,0,0.25)"/>`; });
  const py = y + 112 + h * 0.32;
  for (let k = 0; k < 9; k++) s += `<line x1="${x + 30 + k * ((w - 60) / 8)}" y1="${py + 30}" x2="${x + 30 + k * ((w - 60) / 8)}" y2="${py + h * 0.26}" stroke="rgba(255,255,255,0.25)" stroke-width="3" stroke-dasharray="12 10"/>`;
  [[0, '#9ca3af'], [2, '#ffcc00'], [3, '#9ca3af'], [6, '#38bdf8']].forEach(([k, c]) => { const sx = x + 30 + k * ((w - 60) / 8); s += `<rect x="${sx + 14}" y="${py + 40}" width="${(w - 60) / 8 - 28}" height="${h * 0.26 - 50}" rx="8" fill="${c}" opacity="0.9"/>`; });
  if (big) {
    const ly = y + h - 60;
    [['Loading', '#ffcc00'], ['Ready', '#22c55e'], ['Waiting', '#9ca3af'], ['Inbound', '#38bdf8']].forEach(([l, c], k) => { s += dot(x + 50 + k * 210, ly, 12, c) + sans(l, x + 72 + k * 210, ly + 8, 22, '#e5e7eb', { weight: 600 }); });
  }
  return s;
}
function modulesArt(t, x, y, w, h) {
  let s = txt(['10+'], x, y + 190, { size: 220, weight: 900, fill: '#ffcc00', ls: -8 });
  s += sans(['independent modules', 'inside larger warehouse', 'processes'], x + 420, y + 92, 32, '#fff', { weight: 600, lh: 44 });
  const cols = 4, gap = 22, tw = (w - gap * (cols - 1)) / cols, th = 128, gy = y + 270;
  const r = rng(9);
  for (let k = 0; k < 12; k++) {
    const cx = x + (k % cols) * (tw + gap), cy = gy + Math.floor(k / cols) * (th + gap);
    const on = k < 11;
    s += `<rect x="${cx}" y="${cy}" width="${tw}" height="${th}" rx="20" fill="${on ? '#2a2d33' : 'transparent'}" stroke="${on ? 'rgba(255,255,255,0.12)' : 'rgba(255,204,0,0.6)'}" stroke-width="2" ${on ? '' : 'stroke-dasharray="10 8"'}/>`;
    if (on) s += `<rect x="${cx + 22}" y="${cy + 22}" width="44" height="44" rx="12" fill="${['#ffcc00', '#22c55e', '#38bdf8', '#f97316'][k % 4]}" opacity="0.9"/>${bars(cx + 22, cy + 84, tw - 44, 1, 'rgba(255,255,255,0.3)', 12)}<rect x="${cx + 22}" y="${cy + 104}" width="${(tw - 44) * (0.3 + r() * 0.4)}" height="8" rx="4" fill="rgba(255,255,255,0.15)"/>`;
    else s += txt(['+'], cx + tw / 2, cy + th / 2 + 22, { size: 60, weight: 400, fill: '#ffcc00', anchor: 'middle' });
  }
  s += sans('Separate modules for each category of user', x, gy + 3 * (th + gap) + 40, 26, 'rgba(255,255,255,0.7)');
  return s;
}
function zplArt(t, x, y, w, h) {
  const lw = w * 0.52, lh = h - 20;
  let s = panel(x, y, lw, lh, { fill: '#ffffff', r: 12 });
  s += `<rect x="${x + 24}" y="${y + 24}" width="${lw - 48}" height="${lh - 48}" fill="none" stroke="#111" stroke-width="4"/>`;
  s += sans('SHIP TO', x + 44, y + 70, 18, '#111', { weight: 800 }) + bars(x + 44, y + 88, lw - 140, 3, '#111', 12, 24);
  s += `<line x1="${x + 24}" y1="${y + 182}" x2="${x + lw - 24}" y2="${y + 182}" stroke="#111" stroke-width="4"/>`;
  s += txt(['PALLET'], x + 44, y + 236, { size: 26, weight: 900, fill: '#111' }) + txt(['07 / 24'], x + lw - 44, y + 236, { size: 26, weight: 900, fill: '#111', anchor: 'end' });
  const r = rng(42); let bx = x + 48; const bw = lw - 96;
  while (bx < x + 48 + bw) { const ww = 2 + Math.floor(r() * 4) * 2; if (r() > 0.4) s += `<rect x="${bx}" y="${y + 270}" width="${ww}" height="${lh * 0.34}" fill="#111"/>`; bx += ww + 2; }
  s += mono('(00) 0 0614141 000000123 4', x + lw / 2, y + 290 + lh * 0.34, 18, '#111', { anchor: 'middle' });
  s += `<line x1="${x + 24}" y1="${y + 320 + lh * 0.34}" x2="${x + lw - 24}" y2="${y + 320 + lh * 0.34}" stroke="#111" stroke-width="4"/>`;
  s += sans('QTY', x + 44, y + 370 + lh * 0.34, 18, '#111', { weight: 800 }) + txt(['1,240'], x + 44, y + 420 + lh * 0.34, { size: 44, weight: 900, fill: '#111' });
  const cx = x + lw + 40, cw = w - lw - 40;
  s += panel(cx, y + 60, cw, lh - 120, { fill: '#121418', stroke: 'rgba(255,204,0,0.4)', r: 22 });
  const z = ['^XA', '^FO50,40', '^A0N,40', '^FDSHIP TO^FS', '^FO50,260', '^BCN,180', '^FD061414..^FS', '^FO50,520', '^FDQTY 1240^FS', '^XZ'];
  z.forEach((l, k) => { s += txt([l], cx + 30, y + 120 + k * ((lh - 200) / z.length), { size: 24, fill: l.startsWith('^X') ? '#ffcc00' : '#e5e7eb', family: 'JetBrains Mono', weight: 500 }); });
  s += mono('ZPL', cx + cw - 30, y + 100, 20, '#ffcc00', { anchor: 'end', weight: 700 });
  return s;
}
function liveArt(t, x, y, w, h) {
  let s = '';
  const tiles = [['Docks in use', '6 / 8', '#ffcc00'], ['Trailers in yard', '14', '#38bdf8'], ['Ready to ship', '9', '#22c55e'], ['Waiting', '3', '#9ca3af']];
  const tw = (w - 24) / 2;
  tiles.forEach(([l, v, c], k) => {
    const tx = x + (k % 2) * (tw + 24), ty = y + Math.floor(k / 2) * 190;
    s += panel(tx, ty, tw, 166, { fill: '#2a2d33', r: 24 });
    s += sans(l, tx + 28, ty + 50, 22, 'rgba(255,255,255,0.65)', { weight: 600 }) + txt([v], tx + 28, ty + 126, { size: 64, weight: 900, fill: c });
    s += dot(tx + tw - 36, ty + 40, 10, c) + `<circle cx="${tx + tw - 36}" cy="${ty + 40}" r="20" fill="none" stroke="${c}" stroke-width="3" opacity="0.4"/>`;
  });
  const cy = y + 400;
  s += panel(x, cy, w, h - 400, { fill: '#2a2d33', r: 24 });
  s += sans('Live activity', x + 28, cy + 52, 24, '#fff', { weight: 700 }) + `<rect x="${x + w - 140}" y="${cy + 26}" width="110" height="38" rx="19" fill="#22c55e" opacity="0.18"/>${dot(x + w - 116, cy + 45, 7, '#22c55e')}${mono('LIVE', x + w - 100, cy + 52, 18, '#22c55e', { weight: 700 })}`;
  const r = rng(3), pts = Array.from({ length: 14 }, (_, k) => [x + 30 + k * ((w - 60) / 13), cy + h - 400 - 40 - (0.2 + r() * 0.7) * (h - 400 - 130)]);
  s += `<polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="#ffcc00" stroke-width="5" stroke-linejoin="round"/>`;
  s += `<polygon points="${pts.map((p) => p.join(',')).join(' ')} ${x + w - 30},${cy + h - 400 - 30} ${x + 30},${cy + h - 400 - 30}" fill="#ffcc00" opacity="0.12"/>`;
  return s;
}

// SAP
function beforeAfter(t, x, y, w, h) {
  const cw = (w - 40) / 2;
  let s = panel(x, y, cw, h, { fill: '#e7e9ec', r: 18 });
  s += `<rect x="${x}" y="${y}" width="${cw}" height="56" rx="18" fill="#c5cad1"/><rect x="${x}" y="${y + 30}" width="${cw}" height="26" fill="#c5cad1"/>${mono('/nMM01', x + 24, y + 38, 20, '#4b5563')}`;
  for (let r = 0; r < 16; r++) for (let c = 0; c < 3; c++) s += `<rect x="${x + 18 + c * ((cw - 36) / 3)}" y="${y + 74 + r * ((h - 100) / 16)}" width="${(cw - 36) / 3 - 10}" height="${(h - 100) / 16 - 8}" rx="2" fill="${c === 0 ? '#d1d5db' : '#fff'}" stroke="#b6bcc6"/>`;
  s += `<rect x="${x + 16}" y="${y + h - 66}" width="120" height="46" rx="8" fill="#c5cad1"/>`;
  s += chip(x + 20, y - 70, 'Before', { bg: '#0b1f33', fg: '#fff', size: 24, h: 50 }).svg;
  const rx = x + cw + 40;
  s += panel(rx, y, cw, h, { fill: '#fff', r: 24 });
  s += sans('New material', rx + 30, y + 60, 30, '#0b1f33', { weight: 800 }) + sans('Step 1 of 3 · Basic data', rx + 30, y + 96, 20, '#64748b');
  s += `<rect x="${rx + 30}" y="${y + 116}" width="${cw - 60}" height="8" rx="4" fill="#e2e8f0"/><rect x="${rx + 30}" y="${y + 116}" width="${(cw - 60) / 3}" height="8" rx="4" fill="#0a6ed1"/>`;
  ['Material name', 'Material type', 'Base unit'].forEach((l, k) => {
    const fy = y + 160 + k * 112;
    s += sans(l, rx + 30, fy + 10, 20, '#475569', { weight: 600 }) + `<rect x="${rx + 30}" y="${fy + 24}" width="${cw - 60}" height="60" rx="14" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>`;
    s += sans(['Aluminium can 355ml', 'Packaging', 'EA'][k], rx + 50, fy + 63, 22, '#0b1f33');
  });
  s += `<rect x="${rx + 30}" y="${y + h - 96}" width="${cw - 60}" height="64" rx="16" fill="#0a6ed1"/>${sans('Continue', rx + cw / 2, y + h - 54, 24, '#fff', { anchor: 'middle', weight: 700 })}`;
  s += chip(rx + 20, y - 70, 'After', { bg: '#0a6ed1', fg: '#fff', size: 24, h: 50 }).svg;
  return s;
}
function excelGrid(t, x, y, w, h) {
  const cols = [['', 60], ['Material', 0.28], ['Plant', 0.16], ['Qty', 0.16], ['Unit', 0.14], ['Status', 0.26]];
  const rows = 8, rh = (h - 140) / (rows + 1);
  let s = panel(x, y, w, h - 80, { fill: '#fff', r: 18 });
  s += `<rect x="${x}" y="${y}" width="${w}" height="${rh}" rx="18" fill="#f1f5f9"/><rect x="${x}" y="${y + rh / 2}" width="${w}" height="${rh / 2}" fill="#f1f5f9"/>`;
  const widths = cols.map(([, f]) => (f > 1 ? f : (w - 60) * f));
  const data = [['CAN-355-AL', '1100', '24000', 'EA', 'ok'], ['LID-202-AL', '1100', '', 'EA', 'req'], ['CRT-24-PK', '1200', '850', 'EA', 'ok'], ['LBL-ZPL-4x6', '1100', 'twelve', 'EA', 'num'], ['CO2-FOOD', '1300', '3200', 'KG', 'ok'], ['SYR-COLA', '1300', '1500', 'L', 'ok'], ['PAL-EUR', '1200', '640', 'EA', 'ok']];
  let cx = x;
  cols.forEach(([c], k) => { s += txt([c], cx + 16, y + rh * 0.64, { size: 20, weight: 700, fill: '#475569', family: 'Inter' }); cx += widths[k]; if (k < cols.length - 1) s += `<line x1="${cx}" y1="${y}" x2="${cx}" y2="${y + (rows) * rh}" stroke="#e2e8f0" stroke-width="2"/>`; });
  data.forEach((row, r) => {
    const ry = y + (r + 1) * rh;
    s += `<line x1="${x}" y1="${ry}" x2="${x + w}" y2="${ry}" stroke="#e2e8f0" stroke-width="2"/>`;
    s += mono(String(r + 1), x + 30, ry + rh * 0.64, 18, '#94a3b8', { anchor: 'middle' });
    let rx = x + widths[0];
    row.slice(0, 4).forEach((v, j) => {
      const bad = (row[4] === 'req' && j === 2) || (row[4] === 'num' && j === 2);
      if (bad) s += `<rect x="${rx + 3}" y="${ry + 3}" width="${widths[j + 1] - 6}" height="${rh - 6}" fill="#fef2f2" stroke="#ef4444" stroke-width="3"/>`;
      s += txt([v], rx + 14, ry + rh * 0.64, { size: 19, fill: bad ? '#b91c1c' : '#0f172a', family: j === 0 ? 'JetBrains Mono' : 'Inter', weight: 500 });
      rx += widths[j + 1];
    });
    const st = row[4];
    s += st === 'ok' ? check(rx + 28, ry + rh / 2, 13, '#1f9d55') + sans('Valid', rx + 50, ry + rh * 0.64, 18, '#1f9d55', { weight: 700 }) : `<circle cx="${rx + 28}" cy="${ry + rh / 2}" r="13" fill="#ef4444"/>${sans('!', rx + 28, ry + rh * 0.66, 18, '#fff', { anchor: 'middle', weight: 900 })}${sans(st === 'req' ? 'Required' : 'Number', rx + 50, ry + rh * 0.64, 18, '#b91c1c', { weight: 700 })}`;
  });
  const tx = x + widths[0] + widths[1] + widths[2] - 40, ty = y + 4 * rh + rh + 12;
  s += `<g filter="url(#soft)"><rect x="${tx}" y="${ty}" width="300" height="70" rx="14" fill="#0b1f33"/><path d="M${tx + 60} ${ty} l14 -14 l14 14 Z" fill="#0b1f33"/></g>${sans('Qty must be a number', tx + 22, ty + 44, 21, '#fff', { weight: 600 })}`;
  s += sans('Validated as you type — like Excel, but safe for SAP.', x, y + h - 26, 24, '#334155', { weight: 600 });
  return s;
}
function figmaArt(t, x, y, w, h) {
  let s = panel(x, y, w, h, { fill: '#2c2c2c', r: 22 });
  s += `<rect x="${x}" y="${y}" width="${w}" height="54" rx="22" fill="#1e1e1e"/><rect x="${x}" y="${y + 30}" width="${w}" height="24" fill="#1e1e1e"/>`;
  s += `<g transform="translate(${x + 22} ${y + 13})">${logo('figma', 0, 0, 28)}</g>${mono('MM Wrapper — Validation', x + w / 2, y + 36, 18, '#bdbdbd', { anchor: 'middle' })}`;
  const lp = 210;
  s += `<rect x="${x}" y="${y + 54}" width="${lp}" height="${h - 54}" fill="#252525"/>`;
  ['Frame · Grid', '  Header row', '  Cell / default', '  Cell / error', '  Cell / valid', '  Tooltip', 'Frame · Form', '  Input', '  Button'].forEach((l, k) => { s += mono(l, x + 18, y + 96 + k * 40, 16, k === 3 ? '#fff' : '#a3a3a3'); if (k === 3) s += `<rect x="${x + 6}" y="${y + 70 + k * 40}" width="${lp - 12}" height="36" rx="6" fill="#0c8ce9" opacity="0.35"/>`; });
  const rp = 220;
  s += `<rect x="${x + w - rp}" y="${y + 54}" width="${rp}" height="${h - 54}" fill="#252525"/>`;
  [['Fill', '#FEF2F2'], ['Stroke', '#EF4444'], ['Radius', '0'], ['Stroke', '3 px'], ['Font', 'Inter 19']].forEach(([k2, v], k) => { s += mono(k2, x + w - rp + 18, y + 100 + k * 54, 16, '#a3a3a3') + mono(v, x + w - 18, y + 100 + k * 54, 16, '#fff', { anchor: 'end' }); if (k < 2) s += `<rect x="${x + w - rp + 100}" y="${y + 86 + k * 54}" width="18" height="18" rx="4" fill="${v}"/>`; });
  const cx = x + lp + 30, cw = w - lp - rp - 60;
  s += mono('Grid', cx, y + 96, 15, '#a3a3a3');
  s += `<rect x="${cx}" y="${y + 106}" width="${cw}" height="${h - 160}" fill="#fff"/>`;
  for (let r = 0; r < 7; r++) for (let c = 0; c < 3; c++) {
    const bad = r === 3 && c === 1;
    s += `<rect x="${cx + 10 + c * ((cw - 20) / 3)}" y="${y + 116 + r * ((h - 180) / 7)}" width="${(cw - 20) / 3 - 6}" height="${(h - 180) / 7 - 6}" fill="${r === 0 ? '#f1f5f9' : bad ? '#fef2f2' : '#fff'}" stroke="${bad ? '#ef4444' : '#e2e8f0'}" stroke-width="${bad ? 3 : 1.5}"/>`;
    if (bad) s += `<rect x="${cx + 10 + c * ((cw - 20) / 3) - 4}" y="${y + 116 + r * ((h - 180) / 7) - 4}" width="${(cw - 20) / 3 + 2}" height="${(h - 180) / 7 + 2}" fill="none" stroke="#0c8ce9" stroke-width="2"/>`;
  }
  return s;
}

// Intern
function quoteCard(t, x, y, w, h) {
  let s = panel(x, y, w, h, { fill: '#fff', r: 28 });
  s += `<circle cx="${x + 70}" cy="${y + 76}" r="38" fill="#2f7d32"/>${txt(['AS'], x + 70, y + 86, { size: 26, weight: 800, fill: '#fff', anchor: 'middle' })}`;
  s += sans('Abhinand A S', x + 126, y + 70, 26, '#18301a', { weight: 800 }) + sans('Web Developer Intern · Nov 2024', x + 126, y + 102, 20, '#6b7a6c');
  s += txt(['“I’m happy to share that I’m', 'starting a new position as', 'Web Developer Intern at', 'DIGITRELL!”'], x + 44, y + 200, { size: 40, weight: 700, fill: '#18301a', lh: 54 });
  s += `<rect x="${x + 44}" y="${y + h - 120}" width="${w - 88}" height="76" rx="20" fill="#eef6e6"/><rect x="${x + 64}" y="${y + h - 102}" width="40" height="40" rx="10" fill="#2f7d32"/><rect x="${x + 72}" y="${y + h - 90}" width="24" height="18" rx="3" fill="#fff"/>`;
  s += sans('Starting a new position', x + 122, y + h - 75, 24, '#18301a', { weight: 700 });
  return s;
}
function timeline(t, x, y, w, h, items) {
  let s = `<line x1="${x + 40}" y1="${y + 40}" x2="${x + 40}" y2="${y + h - 40}" stroke="#2f7d32" stroke-width="6" stroke-linecap="round" stroke-dasharray="2 16"/>`;
  items.forEach(([date, title, sub], k) => {
    const iy = y + 40 + k * ((h - 80) / (items.length - 1));
    s += `<circle cx="${x + 40}" cy="${iy}" r="26" fill="${k === items.length - 1 ? '#ffb703' : '#2f7d32'}" stroke="#eef6e6" stroke-width="8"/>`;
    s += panel(x + 100, iy - 70, w - 100, 140, { fill: '#fff', r: 24 });
    s += mono(date.toUpperCase(), x + 130, iy - 22, 20, '#2f7d32', { weight: 700 }) + sans(title, x + 130, iy + 18, 32, '#18301a', { weight: 800 }) + sans(sub, x + 130, iy + 50, 20, '#6b7a6c');
  });
  return s;
}
function learnCards(t, x, y, w, h, items) {
  let s = '';
  const ch = (h - 30 * (items.length - 1)) / items.length;
  items.forEach(([g, title, sub], k) => {
    const cy = y + k * (ch + 30);
    s += panel(x, cy, w, ch, { fill: '#fff', r: 26 });
    s += `<rect x="${x + 30}" y="${cy + ch / 2 - 46}" width="92" height="92" rx="24" fill="#2f7d32"/>${txt([g], x + 76, cy + ch / 2 + 16, { size: 44, weight: 900, fill: '#fff', anchor: 'middle', family: 'JetBrains Mono' })}`;
    s += sans(title, x + 150, cy + ch / 2 - 6, 32, '#18301a', { weight: 800 }) + sans(sub, x + 150, cy + ch / 2 + 32, 22, '#6b7a6c');
  });
  return s;
}

const IW = W - M * 2;
const P = {};
P['fullstack-digitrell'] = {
  t: T.fullstack,
  cover: { kicker: 'FEB 2025 — PRESENT', name: ['Full-Stack', 'Developer'], nameSize: 128, tagline: ['Logistics & warehouse platforms', 'for a US beverage manufacturer.'], art: async (t, top) => componentBoard(t, M, top + 10, IW, 1300 - top - 10) },
  slides: [
    { title: ['Reusable', 'React components.'], sub: ['Typed building blocks shared across', 'enterprise logistics apps.'], art: async (t, y, h) => componentBoard(t, M, y, IW, Math.min(h, 640)) },
    { title: ['Wireframes into', 'real interfaces.'], sub: ['Responsive, accessible UIs with an eye', 'on performance and UX.'], art: async (t, y, h) => wireToUI(t, M, y + 10, IW, Math.min(h - 20, 640)) },
    { title: ['Every API state,', 'handled.'], sub: ['Async data flows with clear loading,', 'error and success patterns.'], art: async (t, y, h) => apiStates(t, M, y, IW, Math.min(h, 680)) },
    { title: ['Into the', 'Node.js backend.'], sub: ['API routes, middleware logic and', 'third-party integrations.'], art: async (t, y, h) => backendFlow(t, M + 40, y, IW - 80, h) },
    { title: ['Faster', 'dashboards.'], sub: ['Wrote and tuned T-SQL on SQL Server to', 'fix production performance issues.'], art: async (t, y, h) => sqlCard(t, M, y, IW, Math.min(h, 700)) },
    { title: ['How we ship.'], sub: ['Agile ceremonies, peer reviews, feature →', 'staging branches and CI/CD delivery.'], art: async (t, y, h) => shipFlow(t, M, y, IW, h) },
  ],
  stack: { title: ['The toolkit.'], sub: ['What I reach for every day', 'at Digitrell.'], tech: [['react', 'React'], ['typescript', 'TypeScript'], ['nodedotjs', 'Node.js'], ['sqlserver', 'SQL Server'], ['rest', 'REST APIs'], ['cicd', 'CI/CD'], ['figma', 'Figma'], ['git', 'Git']] },
};
P['ai-docs'] = {
  t: T.aidocs,
  cover: { kicker: 'FEATURE · DIGITRELL · 2025', name: ['AI Document', 'Processing'], nameSize: 118, tagline: ['Find the right document.', 'Extract exactly what’s needed.'], art: async (t, top) => aiCoverArt(t, top) },
  slides: [
    { title: ['Find the right', 'document.'], sub: ['It identifies the correct document', 'from a large set of files.'], art: async (t, y, h) => findDoc(t, M, y, IW, h) },
    { title: ['Extract the', 'exact data.'], sub: ['Only the fields that matter — nothing', 'more, nothing less.'], art: async (t, y, h) => extractArt(t, M, y, IW, Math.min(h, 700)) },
    { title: ['Store it as', 'structured records.'], sub: ['Clean rows, ready for the rest of', 'the platform to use.'], art: async (t, y, h) => recordsArt(t, M, y, IW, Math.min(h, 720)) },
  ],
  stack: { title: ['Under the hood.'], sub: ['An AI feature wired into a', 'production React + Node.js platform.'], tech: [['react', 'React'], ['typescript', 'TypeScript'], ['nodedotjs', 'Node.js'], ['rest', 'REST APIs'], ['sqlserver', 'SQL Server']] },
};
P['yard-warehouse'] = {
  t: T.yard,
  cover: { kicker: 'PRODUCTION · MICROSERVICES', name: ['Yard &', 'Warehouse'], nameSize: 136, tagline: ['Everyday warehouse work, simplified', 'for a US canned-beverage maker.'], art: async (t, top) => yardMap(t, M, top + 10, IW, 1300 - top - 10, { big: false }) },
  slides: [
    { title: ['A production', 'yard app.'], sub: ['Full-stack features for yard management', 'on a microservices architecture.'], art: async (t, y, h) => yardMap(t, M, y, IW, Math.min(h, 700)) },
    { title: ['Built module', 'by module.'], sub: ['Independent features inside larger', 'warehouse processes.'], art: async (t, y, h) => modulesArt(t, M, y - 20, IW, h) },
    { title: ['ZPL label', 'generation.'], sub: ['Shipped the module that generates', 'printer-ready ZPL labels.'], art: async (t, y, h) => zplArt(t, M, y, IW, Math.min(h, 720)) },
    { title: ['Real-time data.'], sub: ['Reusable React components wired to', 'Node.js APIs for live displays.'], art: async (t, y, h) => liveArt(t, M, y, IW, Math.min(h, 720)) },
  ],
  stack: { title: ['Under the hood.'], sub: ['Component-based, maintainable UI', 'with a strong focus on UX.'], tech: [['react', 'React'], ['typescript', 'TypeScript'], ['nodedotjs', 'Node.js'], ['rest', 'REST APIs'], ['azure', 'Azure SQL'], ['cicd', 'CI/CD']] },
};
P['sap-wrapper'] = {
  t: T.sap,
  cover: { kicker: 'UI WRAPPER · 2025', name: ['SAP Material', 'Management'], nameSize: 116, tagline: ['A clean, intuitive interface', 'for everyday SAP users.'], art: async (t, top) => excelGrid(t, M, top + 20, IW, 1300 - top - 20) },
  slides: [
    { title: ['From complex', 'to clean.'], sub: ['Business requirements turned into', 'simple, intuitive UI flows.'], art: async (t, y, h) => beforeAfter(t, M, y + 80, IW, Math.min(h - 100, 640)) },
    { title: ['Excel-style', 'data entry.'], sub: ['A field validation manager that catches', 'mistakes before they reach SAP.'], art: async (t, y, h) => excelGrid(t, M, y, IW, Math.min(h, 720)) },
    { title: ['Pixel-accurate', 'from Figma.'], sub: ['Built straight from the Figma specs,', 'with accessibility in mind.'], art: async (t, y, h) => figmaArt(t, M, y, IW, Math.min(h, 640)) },
  ],
  stack: { title: ['Under the hood.'], sub: ['Typed React screens with', 'TanStack Router on a Node.js API.'], tech: [['react', 'React'], ['typescript', 'TypeScript'], ['tanstack', 'TanStack Router'], ['nodedotjs', 'Node.js'], ['figma', 'Figma']] },
};
P['intern-digitrell'] = {
  t: T.intern,
  cover: { kicker: 'NOV 2024 — FEB 2025', name: ['Where it', 'started.'], nameSize: 140, tagline: ['My first role in tech —', 'Web Developer Intern at Digitrell.'], art: async (t, top) => quoteCard(t, M, top + 20, IW, 1300 - top - 20) },
  slides: [
    { title: ['Learning by', 'shipping.'], sub: ['Three months that turned into a', 'full-time role.'], art: async (t, y, h) => learnCards(t, M, y, IW, Math.min(h, 640), [['</>', 'First React features', 'Shipped to production, with guidance'], ['git', 'Team workflows', 'Git branching, reviews and PRs'], ['↻', 'Agile ceremonies', 'Stand-ups, sprints and retros']]) },
    { title: ['The journey', 'so far.'], sub: ['From intern to full-stack developer.'], art: async (t, y, h) => timeline(t, M, y, IW, Math.min(h, 680), [['Nov 2024', 'Web Developer Intern', 'Joined Digitrell, Kochi'], ['Feb 2025', 'Full-Stack Developer', 'Promoted to a full-time role'], ['Nov 2025', 'One year at Digitrell', 'Great team, great projects ✦']]) },
  ],
  stack: { title: ['First tools', 'of the trade.'], sub: ['Where the professional journey began.'], tech: [['react', 'React'], ['javascript', 'JavaScript'], ['git', 'Git'], ['github', 'GitHub']] },
};

// =====================================================================
// SKILLS — logo cards
// =====================================================================
function skillTheme(c1, c2, accent, label, glyph) {
  return theme({
    text: '#ffffff', sub: 'rgba(255,255,255,0.78)', accent, onAccent: '#111', accentText: accent,
    logo: (x, y) => `<g><rect x="${x}" y="${y}" width="48" height="48" rx="14" fill="#fff"/>${txt([glyph], x + 24, y + 32, { size: glyph.length > 2 ? 16 : 22, weight: 900, fill: c1, anchor: 'middle', family: 'JetBrains Mono' })}${txt([label], x + 62, y + 34, { size: 26, weight: 700, fill: '#fff' })}</g>`,
    defs: `<linearGradient id="sk-${label.replace(/\W/g, '')}" x1="0" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`,
    bg: (H) => `<rect width="${W}" height="${H}" fill="url(#sk-${label.replace(/\W/g, '')})"/>`,
    decor: (H) => `<circle cx="${W - 60}" cy="140" r="260" fill="#fff" opacity="0.06"/><circle cx="60" cy="${H - 160}" r="200" fill="#fff" opacity="0.05"/>`,
  });
}
// Big white logo cards: [slug, name, note]
function logoGrid(x, y, w, items, { cols = 2, ch = 200, gap = 24 } = {}) {
  const cw = (w - gap * (cols - 1)) / cols;
  return items.map(([slug, name, note], k) => {
    const cx = x + (k % cols) * (cw + gap), cy = y + Math.floor(k / cols) * (ch + gap);
    if (ch < 180) {
      // Short cards: logo on the left, text beside it
      const ls = Math.min(72, ch * 0.5), lx = cx + 28, tx = lx + ls + 24;
      const fs = name.length > 14 ? 26 : 30;
      return `${panel(cx, cy, cw, ch, { fill: '#fff', r: 26 })}${logo(slug, lx, cy + (ch - ls) / 2, ls)}
        ${txt([name], tx, cy + ch / 2 + (note ? -2 : fs * 0.36), { size: fs, weight: 800, fill: '#111' })}
        ${note ? txt([note], tx, cy + ch / 2 + 30, { size: 19, weight: 500, fill: '#6b7280', family: 'Inter' }) : ''}`;
    }
    const ls = Math.min(ch > 260 ? 120 : 84, ch * 0.42);
    return `${panel(cx, cy, cw, ch, { fill: '#fff', r: 30 })}
      ${logo(slug, cx + 30, cy + 30, ls)}
      ${txt([name], cx + 30, cy + 30 + ls + 50, { size: name.length > 14 ? 28 : 34, weight: 800, fill: '#111' })}
      ${note ? txt([note], cx + 30, cy + 30 + ls + 86, { size: 20, weight: 500, fill: '#6b7280', family: 'Inter' }) : ''}`;
  }).join('');
}
async function skillsSet(t, s) {
  // Split evenly: 8 → 4+4, 12 → 6+6
  const pages = [], pc = Math.ceil(s.items.length / 6), per = Math.ceil(s.items.length / pc);
  for (let k = 0; k < s.items.length; k += per) pages.push(s.items.slice(k, k + per));
  const n = 1 + pages.length;
  const out = [];
  // cover: big title + floating logo cloud
  {
    let b = chip(M, 196, `${s.items.length} SKILLS`, { bg: 'rgba(0,0,0,0.18)', fg: '#fff', size: 22, h: 46, family: 'JetBrains Mono', weight: 500 }).svg;
    b += txt(s.name, M - 4, 360, { size: 132, weight: 900, fill: '#fff', ls: -4, lh: 128 });
    const ty = 360 + (s.name.length - 1) * 128 + 74;
    b += txt(s.tagline, M, ty, { size: 38, weight: 500, fill: t.sub, lh: 50, family: 'Inter' });
    const top = ty + (s.tagline.length - 1) * 50 + 70;
    const r = rng(s.items.length * 13 + 7), cnt = Math.min(s.items.length, 8);
    const cols = cnt > 4 ? 4 : cnt, rows = Math.ceil(cnt / cols);
    const cell = Math.min(220, (IW - (cols - 1) * 26) / cols), area = 1300 - top;
    for (let k = 0; k < cnt; k++) {
      const c = k % cols, rr = Math.floor(k / cols);
      const cx = M + c * (cell + 26) + (r() - 0.5) * 20, cy = top + rr * (cell + 30) + (area - rows * (cell + 30)) / 2 + (r() - 0.5) * 30;
      const rot = (r() - 0.5) * 14;
      b += `<g transform="rotate(${rot.toFixed(1)} ${cx + cell / 2} ${cy + cell / 2})">${panel(cx, cy, cell, cell, { fill: '#fff', r: cell * 0.24 })}${logo(s.items[k][0], cx + cell * 0.24, cy + cell * 0.24, cell * 0.52)}</g>`;
    }
    out.push(await renderSvg(b + postChrome(t, 0, n, { H }), { H, t }));
  }
  for (const [p, items] of pages.entries()) {
    const hd = heading(t, p === 0 ? s.title : [`${s.title[0].replace(/\.$/, '')}, cont.`], p === 0 ? s.sub : null, 250, { size: 64, subSize: 30 });
    const top = hd.bottom + 30;
    const rows = Math.ceil(items.length / 2), ch = Math.min(340, (1300 - top - (rows - 1) * 24) / rows);
    out.push(await renderSvg(hd.svg + logoGrid(M, top, IW, items, { ch }) + postChrome(t, p + 1, n, { H, last: p === pages.length - 1 }), { H, t }));
  }
  return out;
}
const S = {
  core: { t: skillTheme('#f59e0b', '#ef4444', '#fff3c4', 'Core', 'JS'), name: ['Core.'], tagline: ['The fundamentals everything', 'else is built on.'], title: ['Strong', 'fundamentals.'], sub: ['Async/await, Promises, closures, scope.'],
    items: [['html5', 'HTML', 'Semantic markup'], ['css', 'CSS', 'Layouts & animation'], ['javascript', 'JavaScript', 'ES6+ · async/await'], ['typescript', 'TypeScript', 'Used at Digitrell · Taskodoro']] },
  frontend: { t: skillTheme('#7c3aed', '#2563eb', '#e0e7ff', 'Frontend', '⚛'), name: ['Frontend.'], tagline: ['React & friends — responsive,', 'accessible interfaces.'], title: ['React &', 'friends.'], sub: ['Hooks, routing, SSR basics and', 'utility-first styling.'],
    items: [['react', 'React', 'Digitrell · Taskodoro · StepsAway'], ['nextdotjs', 'Next.js', 'Routing · SSR basics'], ['tanstack', 'TanStack Router', 'SAP MM wrapper'], ['tailwindcss', 'Tailwind CSS', 'StepsAway · Rhythm'], ['responsive', 'Responsive Design', 'Phone to desktop'], ['a11y', 'Accessibility', 'Inclusive by default']] },
  backend: { t: skillTheme('#0f766e', '#0e7490', '#ccfbf1', 'Backend & DB', 'DB'), name: ['Backend', '& Data.'], tagline: ['APIs, ORMs and databases —', 'with solid error handling.'], title: ['APIs &', 'runtimes.'], sub: ['Node.js services and secure REST APIs.'],
    items: [['nodedotjs', 'Node.js', 'Digitrell · StepsAway'], ['express', 'Express.js', 'StepsAway'], ['hono', 'Hono', 'Taskodoro · Workers'], ['rest', 'REST APIs', 'Design & integration'], ['jsonwebtokens', 'JWT', 'Taskodoro auth'], ['sequelize', 'Sequelize', 'ORM'], ['typeorm', 'TypeORM', 'ORM'], ['drizzle', 'Drizzle ORM', 'Taskodoro'], ['sqlserver', 'SQL Server', 'T-SQL · Digitrell'], ['mysql', 'MySQL', 'FlickMate'], ['postgresql', 'PostgreSQL', 'Taskodoro · Neon'], ['mongodb', 'MongoDB', 'StepsAway']] },
  design: { t: skillTheme('#db2777', '#f97316', '#ffe4e6', 'Design & UI', 'Fi'), name: ['Design', '& UI.'], tagline: ['From Figma frames to', 'pixel-accurate screens.'], title: ['Figma to', 'pixels.'], sub: ['Turning designs and wireframes into', 'real, usable interfaces.'],
    items: [['figma', 'Figma', 'SAP MM wrapper specs'], ['wireframe', 'Wireframes', 'Into responsive UI'], ['uiux', 'UI/UX Thinking', 'Flows that feel simple']] },
  tools: { t: skillTheme('#334155', '#0f172a', '#e2e8f0', 'Tools', '>_'), name: ['Tools &', 'Workflow.'], tagline: ['The daily drivers behind', 'every feature.'], title: ['Daily', 'drivers.'], sub: ['Git-based collaboration and CI/CD.'],
    items: [['git', 'Git', 'Feature / staging flow'], ['github', 'GitHub', 'Code & reviews'], ['cicd', 'CI/CD', 'Automated delivery'], ['docker', 'Docker', 'Taskodoro · Compose'], ['vscodium', 'VS Code', 'Editor'], ['dbeaver', 'DBeaver', 'Database client'], ['bruno', 'Bruno', 'API client'], ['postman', 'Postman', 'API testing']] },
  ai: { t: skillTheme('#4c1d95', '#be185d', '#fce7f3', 'AI-Assisted', 'AI'), name: ['AI-Assisted', 'Coding.'], nameSize: 116, tagline: ['Pair programming 2.0 —', 'faster, without losing quality.'], title: ['Pair', 'programming 2.0.'], sub: ['AI tools I use every day to', 'move faster.'],
    items: [['claude', 'Claude Code', 'Agentic coding'], ['cursor', 'Cursor', 'AI editor'], ['githubcopilot', 'GitHub Copilot', 'Inline suggestions']] },
  cloud: { t: skillTheme('#ea580c', '#be123c', '#ffedd5', 'Cloud & Mobile', '☁'), name: ['Cloud &', 'Mobile.'], tagline: ['Deploy anywhere — edge,', 'Azure, or your pocket.'], title: ['Deploy', 'anywhere.'], sub: ['Edge workers, Azure services,', 'native apps and PWAs.'],
    items: [['cloudflareworkers', 'Cloudflare Workers', 'Taskodoro backend'], ['azure', 'Azure SQL', 'Digitrell'], ['blob', 'Azure Blob Storage', 'File storage'], ['logic', 'Azure Logic Apps', 'Basic workflows'], ['capacitor', 'Capacitor.js', 'Taskodoro Android'], ['pwa', 'PWA', 'StepsAway']] },
};

// =====================================================================
// EDUCATION + GAMES
// =====================================================================
T.bca = theme({
  dark: false, text: '#1e293b', sub: 'rgba(30,41,59,0.68)', accent: '#2563eb', onAccent: '#fff', accentText: '#2563eb',
  logo: (x, y) => `<g><rect x="${x}" y="${y}" width="48" height="48" rx="12" fill="#2563eb"/><path d="M${x + 8} ${y + 20} L${x + 24} ${y + 12} L${x + 40} ${y + 20} L${x + 24} ${y + 28} Z" fill="#fff"/><path d="M${x + 14} ${y + 24} v8 q10 7 20 0 v-8" fill="none" stroke="#fff" stroke-width="3"/>${txt(['BCA · CMS College'], x + 62, y + 34, { size: 26, weight: 700, fill: '#1e293b' })}</g>`,
  cta: 'Class of 2024',
  bg: (H) => `<rect width="${W}" height="${H}" fill="#fdfcf7"/>`,
  decor: (H) => `${Array.from({ length: Math.ceil(H / 52) }, (_, k) => `<line x1="0" y1="${k * 52 + 40}" x2="${W}" y2="${k * 52 + 40}" stroke="#bfdbfe" stroke-width="2"/>`).join('')}<line x1="52" y1="0" x2="52" y2="${H}" stroke="#fca5a5" stroke-width="3"/>`,
});
T.mern = theme({
  text: '#fff7e6', sub: 'rgba(255,247,230,0.74)', accent: '#f4c35a', onAccent: '#2a1606', accentText: '#f4c35a',
  logo: (x, y) => `<g><circle cx="${x + 24}" cy="${y + 24}" r="24" fill="#f4c35a"/>${star(x + 24, y + 24, 13, '#2a1606')}${txt(['MERN · Luminar'], x + 62, y + 34, { size: 26, weight: 700, fill: '#fff7e6' })}</g>`,
  cta: 'Certified · NCTT',
  defs: `<radialGradient id="mn-a" cx="0.5" cy="0" r="0.9"><stop offset="0" stop-color="#5b2a86"/><stop offset="1" stop-color="#1c0f33"/></radialGradient>`,
  bg: (H) => `<rect width="${W}" height="${H}" fill="url(#mn-a)"/>`,
  decor: (H) => `<rect x="28" y="28" width="${W - 56}" height="${H - 56}" rx="24" fill="none" stroke="rgba(244,195,90,0.35)" stroke-width="3"/><rect x="42" y="42" width="${W - 84}" height="${H - 84}" rx="18" fill="none" stroke="rgba(244,195,90,0.18)" stroke-width="2"/>`,
});
T.blareland = theme({
  text: '#ffffff', sub: 'rgba(255,220,255,0.75)', accent: '#ff3df2', onAccent: '#14002a', accentText: '#ff8cf8', shadow: 0.6,
  logo: (x, y) => `<g><path d="M${x + 24} ${y + 6} L${x + 44} ${y + 42} L${x + 4} ${y + 42} Z" fill="#ff3df2"/>${txt(['BLARELAND'], x + 62, y + 34, { size: 26, weight: 800, fill: '#fff', ls: 4 })}</g>`,
  cta: 'Play on itch.io ↗',
  defs: `<linearGradient id="bl-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a0638"/><stop offset="0.65" stop-color="#4a0d8f"/><stop offset="1" stop-color="#ff2e63"/></linearGradient>`,
  bg: (H) => `<rect width="${W}" height="${H}" fill="url(#bl-bg)"/>`,
  decor: (H) => `${Array.from({ length: 12 }, (_, k) => `<line x1="0" y1="${H - 300 + k * k * 2.6}" x2="${W}" y2="${H - 300 + k * k * 2.6}" stroke="rgba(255,61,242,${0.08 + k * 0.012})" stroke-width="2"/>`).join('')}
    ${Array.from({ length: 15 }, (_, k) => `<line x1="${W / 2}" y1="${H - 300}" x2="${(k - 7) * 240 + W / 2}" y2="${H}" stroke="rgba(255,61,242,0.12)" stroke-width="2"/>`).join('')}
    <circle cx="${W - 180}" cy="230" r="120" fill="#ff7ac8" opacity="0.18"/>`,
});
T.stepup = theme({
  text: '#ffffff', sub: 'rgba(255,255,255,0.72)', accent: '#ff2a2a', onAccent: '#fff', accentText: '#ff5c5c',
  logo: (x, y) => `<g><rect x="${x}" y="${y + 26}" width="22" height="10" fill="#ff2a2a"/><rect x="${x + 26}" y="${y + 12}" width="22" height="10" fill="#ff2a2a"/><path d="M${x + 6} ${y + 24} l6 -10 l6 10 Z" fill="#fff"/>${txt(['STEP UP'], x + 62, y + 34, { size: 26, weight: 900, fill: '#fff', ls: 2 })}</g>`,
  cta: 'Play on itch.io ↗',
  bg: (H) => `<rect width="${W}" height="${H}" fill="#121212"/>`,
  decor: (H) => `${Array.from({ length: 26 }, (_, k) => `<line x1="${k * 90 - 400}" y1="${H}" x2="${k * 90 + 300}" y2="0" stroke="rgba(255,42,42,${k % 3 ? 0.06 : 0.14})" stroke-width="${k % 4 ? 3 : 10}"/>`).join('')}`,
});

const ITCH = `${SRC}itch`, PUB = `${ROOT}public/images/projects`;
async function blFrame(sec) {
  const f = `${SRC}frames/blareland-${sec}.jpg`;
  return shot(f, null, 1280);
}

P.bca = {
  t: T.bca,
  cover: { kicker: '2021 — 2024 · KOTTAYAM', name: ['Bachelor of', 'Computer', 'Applications'], nameSize: 108, tagline: ['CMS College Kottayam, Kerala.'], art: async (t, top) => {
    let s = '';
    const items = [['{ }', 'Programming'], ['⊞', 'Data structures'], ['▤', 'Databases'], ['</>', 'Web development']];
    items.forEach(([g, l], k) => { const cx = M + (k % 2) * (IW / 2 + 12), cy = top + 20 + Math.floor(k / 2) * 190; s += `<g transform="rotate(${[-2, 1.5, 1, -1.5][k]} ${cx + IW / 4} ${cy + 80})">${panel(cx, cy, IW / 2 - 12, 160, { fill: ['#fef3c7', '#dbeafe', '#dcfce7', '#fce7f3'][k], r: 10 })}${txt([g], cx + 36, cy + 98, { size: 54, weight: 800, fill: '#1e293b', family: 'JetBrains Mono' })}${txt([l], cx + 150, cy + 94, { size: 30, weight: 800, fill: '#1e293b' })}</g>`; });
    return s;
  } },
  slides: [
    { title: ['Three years', 'of building.'], sub: ['Programming, data structures, databases', 'and web development foundations.'], art: async (t, y, h) => timeline(T.intern === t ? t : t, M, y, IW, Math.min(h, 660), [['2021', 'Started BCA', 'CMS College Kottayam'], ['2021 – 2023', 'First games', 'StepUp (GDevelop) · Blareland (Unity)'], ['2024', 'Graduated', 'Rhythm & FlickMate projects · CGPA 6.24']]).replace(/#2f7d32/g, '#2563eb').replace(/#eef6e6/g, '#fdfcf7').replace(/#18301a/g, '#1e293b') },
    { title: ['Built in', 'college.'], sub: ['Projects from my BCA years —', 'swipe through each in Education.'], art: async (t, y, h) => {
      const imgs = await Promise.all(['rhythm/01.jpg', 'flickmate/01.jpg'].map((f) => shot(`${PUB}/${f}`, null, 700)));
      const cw = (IW - 30) / 2, ch = cw * 4 / 3;
      return imgBox(M, y + 10, cw, ch, imgs[0], { r: 22 }) + imgBox(M + cw + 30, y + 60, cw, ch, imgs[1], { r: 22 });
    } },
  ],
};
P['mern-cert'] = {
  t: T.mern,
  cover: { kicker: '2024 · 7 MONTHS', name: ['MERN Full', 'Stack'], nameSize: 136, tagline: ['Training at Luminar Technolab,', 'Kochi — certified by NCTT.'], art: async (t, top) => {
    const cx = W / 2, cy = top + (1300 - top) / 2;
    let s = `<circle cx="${cx}" cy="${cy}" r="210" fill="#f4c35a" filter="url(#shadow)"/><circle cx="${cx}" cy="${cy}" r="180" fill="none" stroke="#2a1606" stroke-width="4" stroke-dasharray="6 10"/>`;
    s += txt(['CERTIFIED'], cx, cy - 40, { size: 34, weight: 900, fill: '#2a1606', anchor: 'middle', ls: 6 }) + txt(['NCTT'], cx, cy + 40, { size: 92, weight: 900, fill: '#2a1606', anchor: 'middle' }) + txt(['2024'], cx, cy + 92, { size: 28, weight: 700, fill: '#2a1606', anchor: 'middle', family: 'JetBrains Mono' });
    s += `<path d="M${cx - 120} ${cy + 180} l-40 140 l60 -30 l40 50 l30 -150" fill="#c2410c"/><path d="M${cx + 120} ${cy + 180} l40 140 l-60 -30 l-40 50 l-30 -150" fill="#c2410c"/>`;
    return s.replace(`<circle cx="${cx}" cy="${cy}" r="210"`, `<circle cx="${cx}" cy="${cy}" r="210"`);
  } },
  slides: [
    { title: ['M · E · R · N'], sub: ['Seven months of hands-on projects', 'across the whole stack.'], art: async (t, y, h) => logoGrid(M, y, IW, [['mongodb', 'MongoDB', 'Database'], ['express', 'Express', 'API framework'], ['react', 'React', 'Frontend'], ['nodedotjs', 'Node.js', 'Runtime']], { ch: Math.min(300, (h - 24) / 2) }) },
    { title: ['The final', 'project.'], sub: ['Steps Away — a city-based community', 'platform. Find it in Education.'], art: async (t, y, h) => {
      const img = await shot(`${PUB}/stepsaway/01.jpg`, null, 800);
      const ch = Math.min(h - 20, 760), cw = ch * 0.75;
      return imgBox((W - cw) / 2, y + 10, cw, ch, img, { r: 26 });
    } },
  ],
};
P.blareland = {
  t: T.blareland,
  cover: { kicker: 'UNITY · C# · BCA SUMMER', name: ['BLARELAND'], nameSize: 140, tagline: ['A 2D mini shooter — made from', 'scratch, art and music included.'], art: async (t, top) => browser(M, top + 30, IW, await blFrame('title'), t, 'abhi-drops.itch.io/blareland').svg },
  slides: [
    { title: ['Clear the sky.'], sub: ['Kill every enemy before it touches the', 'ground — they drop bombs and speed up.'], art: async (t, y, h) => browser(M, y + 20, IW, await blFrame('play'), t).svg },
    { title: ['Boss battle.'], sub: ['A big enemy that takes five hits —', 'and power-ups that clear the screen.'], art: async (t, y, h) => browser(M, y + 20, IW, await blFrame('boss'), t).svg },
    { title: ['Upgrade & compete.'], sub: ['Spend coins on themes and speed —', 'then top the global scoreboard.'], art: async (t, y, h) => browser(M, y + 20, IW, await blFrame('store'), t).svg },
  ],
  stack: { title: ['Made from', 'scratch.'], sub: ['Code, graphics and music —', 'playable in browser and on Windows.'], tech: [['unity', 'Unity'], ['csharp', 'C#']], links: [['Play', 'abhi-drops.itch.io/blareland'], ['GitHub', 'github.com/abhi-drops/BLARELAND---2D-game-using-Unity-C-']] },
};
P.stepup = {
  t: T.stepup,
  cover: { kicker: 'MY FIRST GAME · 2021', name: ['STEP', 'UP'], nameSize: 170, tagline: ['A tiny arcade jumper built', 'with GDevelop.'], art: async (t, top) => {
    const [a, b] = await Promise.all([shot(`${ITCH}/stepup-1.png`, { left: 0, top: 0, width: 365, height: 500 }, 700), shot(`${ITCH}/stepup-4.png`, null, 700)]);
    return phone(W - M - 330, 150, 330, a).svg + phone(W - M - 600, top + 20, 290, b).svg;
  } },
  slides: [
    { title: ['Tap to', 'step up.'], sub: ['Jump from floor to floor — miss one', 'and it’s game over.'], art: async (t, y, h) => {
      const [a, b] = await Promise.all([shot(`${ITCH}/stepup-3.png`, null, 700), shot(`${ITCH}/stepup-0.png`, null, 700)]);
      return phone(M + 40, y + 10, 400, a).svg + phone(W - M - 440, y + 60, 400, b).svg;
    } },
    { title: ['Chase the', 'high score.'], sub: ['Every floor counts. Beat your best', 'run, again and again.'], art: async (t, y, h) => {
      const [a, b] = await Promise.all([shot(`${ITCH}/stepup-4.png`, null, 700), shot(`${ITCH}/stepup-2.png`, null, 700)]);
      return phone(M + 40, y + 60, 400, a).svg + phone(W - M - 440, y + 10, 400, b).svg;
    } },
  ],
  stack: { title: ['Where it', 'all began.'], sub: ['My first game — graphics and music', 'made by me. Web, Windows, macOS, Android.'], tech: [['gdevelop', 'GDevelop'], ['html5', 'HTML5'], ['android', 'Android']], links: [['Play', 'abhi-drops.itch.io/stepup']] },
};

// ---------- run ----------
for (const [key, p] of Object.entries(P)) {
  if (ONLY && ONLY !== key) continue;
  await writeSet(`${OUT}/${key}`, await build(p.t, p));
  console.log(key);
}
for (const [key, s] of Object.entries(S)) {
  if (ONLY && ONLY !== key && ONLY !== 'skills') continue;
  await writeSet(`${OUT}/${key}`, await skillsSet(s.t, s));
  console.log(key);
}
