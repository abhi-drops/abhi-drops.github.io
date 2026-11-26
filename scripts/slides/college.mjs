// Brand-style carousel slides (1080×1440, 3:4) for the portfolio's project posts.
// Usage: node scripts/slides/college.mjs [stepsaway | rhythm | flickmate]
// Built from frames of the LinkedIn demo videos in source/frames.
import { join } from 'node:path';
import { sharp, SRC, OUT_ROOT, encode, writeSet } from './lib.mjs';

const [, , ONLY] = process.argv;
const FRAMES = `${SRC}frames`, OUT = `${OUT_ROOT}/projects`;
const W = 1080, H = 1440, M = 72;
const FULL = { left: 0, top: 90, width: 1280, height: 608 }; // frame minus browser chrome

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const textW = (s, size, k = 0.56) => s.length * size * k;
let uid = 0;

async function shot(file, rect = FULL, width = 1200) {
  const buf = await sharp(join(FRAMES, file)).extract(rect).resize({ width: Math.round(Math.min(width, rect.width * 1.6)), kernel: 'lanczos3' }).jpeg({ quality: 90 }).toBuffer();
  const meta = await sharp(buf).metadata();
  return { uri: `data:image/jpeg;base64,${buf.toString('base64')}`, w: meta.width, h: meta.height };
}

// ---------- primitives ----------
const lines = (arr, x, y, { size, weight = 400, fill, lh = size * 1.2, family = 'Inter Display', anchor = 'start', ls = 0, opacity = 1 }) =>
  `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${ls}" opacity="${opacity}">${arr
    .map((l, i) => `<tspan x="${x}" dy="${i ? lh : 0}">${esc(l)}</tspan>`)
    .join('')}</text>`;

function chip(x, y, label, { bg, fg, size = 26, pad = 22, h = 52, border, family = 'Inter Display', weight = 600 }) {
  const w = textW(label, size, family.includes('Mono') ? 0.62 : 0.56) + pad * 2;
  return {
    w,
    svg: `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${bg}" ${border ? `stroke="${border}" stroke-width="2"` : ''}/>${lines([label], x + pad, y + h / 2 + size * 0.36, { size, weight, fill: fg, family })}</g>`,
  };
}

// A row of chips that wraps inside maxW. Returns { svg, height }.
function chipRow(x, y, labels, style, maxW = W - M * 2, gap = 14) {
  let cx = x, cy = y, out = '';
  const h = style.h || 52;
  for (const l of labels) {
    const c = chip(0, 0, l, style);
    if (cx + c.w > x + maxW) { cx = x; cy += h + gap; }
    out += chip(cx, cy, l, style).svg;
    cx += c.w + gap;
  }
  return { svg: out, height: cy - y + h };
}

function browser(x, y, w, img, t, url = '') {
  const id = `c${uid++}`;
  const bar = 46, ih = (w * img.h) / img.w, r = 22;
  return {
    h: bar + ih,
    svg: `<g filter="url(#shadow)">
      <clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${bar + ih}" rx="${r}"/></clipPath>
      <g clip-path="url(#${id})">
        <rect x="${x}" y="${y}" width="${w}" height="${bar + ih}" fill="${t.frame}"/>
        <circle cx="${x + 26}" cy="${y + 23}" r="7" fill="#ff5f57"/><circle cx="${x + 48}" cy="${y + 23}" r="7" fill="#febc2e"/><circle cx="${x + 70}" cy="${y + 23}" r="7" fill="#28c840"/>
        ${url ? `<rect x="${x + w / 2 - 170}" y="${y + 10}" width="340" height="26" rx="13" fill="${t.frameUrl}"/>${lines([url], x + w / 2, y + 28, { size: 15, weight: 500, fill: t.frameText, anchor: 'middle', family: 'Inter' })}` : ''}
        <image x="${x}" y="${y + bar}" width="${w}" height="${ih}" preserveAspectRatio="none" xlink:href="${img.uri}"/>
      </g>
      <rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${bar + ih - 1}" rx="${r}" fill="none" stroke="${t.frameStroke}" stroke-width="1.5"/>
    </g>`,
  };
}

function phone(x, y, w, img) {
  const id = `c${uid++}`;
  const b = Math.round(w * 0.045), ih = ((w - b * 2) * img.h) / img.w, h = ih + b * 2, r = w * 0.15;
  return {
    h,
    svg: `<g filter="url(#shadow)">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="#0c0c0e"/>
      <rect x="${x + 1.5}" y="${y + 1.5}" width="${w - 3}" height="${h - 3}" rx="${r - 1}" fill="none" stroke="#3a3a40" stroke-width="2"/>
      <clipPath id="${id}"><rect x="${x + b}" y="${y + b}" width="${w - b * 2}" height="${ih}" rx="${r - b}"/></clipPath>
      <image clip-path="url(#${id})" x="${x + b}" y="${y + b}" width="${w - b * 2}" height="${ih}" preserveAspectRatio="none" xlink:href="${img.uri}"/>
    </g>`,
  };
}

function card(x, y, w, img, t) {
  const id = `c${uid++}`, h = (w * img.h) / img.w;
  return {
    h,
    svg: `<g filter="url(#shadow)"><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20"/></clipPath>
      <image clip-path="url(#${id})" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="none" xlink:href="${img.uri}"/>
      <rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" rx="20" fill="none" stroke="${t.frameStroke}" stroke-width="1.5"/></g>`,
  };
}

// ---------- page chrome ----------
function chrome(t, i, n, { last } = {}) {
  const num = `${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
  const cta = last ? t.cta : 'Swipe  →';
  const ctaChip = chip(0, 0, cta, { bg: t.accent, fg: t.onAccent, size: 24, h: 50 });
  return `
    ${t.logo(M, 72)}
    ${chip(W - M - textW(num, 22, 0.62) - 40, 74, num, { bg: 'none', fg: t.sub, size: 22, h: 46, pad: 20, border: t.line, family: 'JetBrains Mono', weight: 500 }).svg}
    ${lines(['@abhinand.as'], M, H - 72, { size: 24, weight: 500, fill: t.sub, family: 'Inter' })}
    ${chip(W - M - ctaChip.w, H - 72 - 34, cta, { bg: t.accent, fg: t.onAccent, size: 24, h: 50 }).svg}`;
}

const defs = (t) => `<defs>
  <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="22"/><feOffset dy="22" result="o"/>
    <feComponentTransfer><feFuncA type="linear" slope="${t.shadow}"/></feComponentTransfer>
    <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  ${t.defs || ''}
</defs>`;

async function render(t, i, n, body, opts) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    ${defs(t)}${t.bg(i)}${body}${chrome(t, i, n, opts)}</svg>`;
  return encode(sharp(Buffer.from(svg)));
}

// Title + subtitle block; returns y where content can start.
function heading(t, title, sub, y = 250) {
  const tl = 84, sl = 46;
  let out = lines(title, M, y, { size: 74, weight: 800, fill: t.text, lh: tl, ls: -1.5 });
  const sy = y + (title.length - 1) * tl + 66;
  out += lines(sub, M, sy, { size: 32, weight: 400, fill: t.sub, lh: sl, family: 'Inter' });
  return { svg: out, bottom: sy + (sub.length - 1) * sl + 30 };
}

// ---------- slide builders ----------
async function coverSlide(t, p, i, n) {
  let body = '';
  body += chip(M, 196, p.kicker, { bg: t.chipBg, fg: t.accentText, size: 22, h: 46, family: 'JetBrains Mono', weight: 500 }).svg;
  body += lines([p.name], M - 6, 380, { size: 150, weight: 900, fill: t.text, ls: -5 });
  body += lines(p.tagline, M, 462, { size: 42, weight: 500, fill: t.sub, lh: 54, family: 'Inter' });
  body += await p.hero(t);
  return render(t, i, n, body);
}

async function featureSlide(t, s, i, n, last) {
  const hd = heading(t, s.title, s.sub);
  let body = hd.svg;
  body += await s.shots(t, hd.bottom);
  return render(t, i, n, body, { last });
}

async function stackSlide(t, p, i, n) {
  const hd = heading(t, p.stack.title, p.stack.sub);
  let body = hd.svg;
  let y = hd.bottom + 30;
  body += lines(['BUILT WITH'], M, y, { size: 22, weight: 600, fill: t.accentText, family: 'JetBrains Mono', ls: 2 });
  const row = chipRow(M, y + 26, p.stack.tech, { bg: t.chipBg, fg: t.text, size: 30, h: 66, pad: 28, border: t.line });
  body += row.svg;
  y += 26 + row.height + 80;
  for (const [label, value] of p.stack.links) {
    body += `<rect x="${M}" y="${y}" width="${W - M * 2}" height="118" rx="28" fill="${t.chipBg}" stroke="${t.line}" stroke-width="2"/>`;
    body += lines([label.toUpperCase()], M + 36, y + 46, { size: 20, weight: 600, fill: t.accentText, family: 'JetBrains Mono', ls: 2 });
    const vs = Math.min(34, (W - M * 2 - 130) / (value.length * 0.56)); // shrink long URLs to fit
    body += lines([value], M + 36, y + 90, { size: vs, weight: 600, fill: t.text, family: 'Inter' });
    body += lines(['↗'], W - M - 40, y + 76, { size: 40, weight: 600, fill: t.accentText, anchor: 'end', family: 'Inter' });
    y += 142;
  }
  return render(t, i, n, body, { last: true });
}

// ---------- themes ----------
const themes = {
  stepsaway: {
    text: '#ffffff', sub: 'rgba(255,255,255,0.74)', accent: '#c6f6dc', onAccent: '#0b3a2a', accentText: '#9ff0c4',
    chipBg: 'rgba(255,255,255,0.08)', line: 'rgba(255,255,255,0.22)', shadow: 0.45,
    frame: '#0e3527', frameUrl: 'rgba(255,255,255,0.10)', frameText: 'rgba(255,255,255,0.65)', frameStroke: 'rgba(255,255,255,0.18)',
    cta: 'stepsaway-b892c.web.app ↗',
    defs: `<linearGradient id="sa-bg" x1="0" y1="0" x2="0.6" y2="1"><stop offset="0" stop-color="#0b3326"/><stop offset="1" stop-color="#1a6b4b"/></linearGradient>
      <radialGradient id="sa-glow" cx="0.85" cy="0.15" r="0.6"><stop offset="0" stop-color="#3fd28f" stop-opacity="0.35"/><stop offset="1" stop-color="#3fd28f" stop-opacity="0"/></radialGradient>`,
    bg: () => `<rect width="${W}" height="${H}" fill="url(#sa-bg)"/><rect width="${W}" height="${H}" fill="url(#sa-glow)"/>
      <text x="-60" y="1180" transform="rotate(-24 540 720)" font-family="Inter Display" font-weight="900" font-size="300" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="3" letter-spacing="-6">STEPSAWAY</text>`,
    logo: (x, y) => `<g><circle cx="${x + 24}" cy="${y + 24}" r="24" fill="#ffffff"/>${lines(['S'], x + 24, y + 35, { size: 30, weight: 900, fill: '#1a6b4b', anchor: 'middle' })}${lines(['Steps Away'], x + 62, y + 34, { size: 28, weight: 700, fill: '#ffffff' })}</g>`,
  },
  rhythm: {
    text: '#ffffff', sub: 'rgba(225,220,255,0.72)', accent: '#8b6cff', onAccent: '#ffffff', accentText: '#b9a6ff',
    chipBg: 'rgba(139,108,255,0.12)', line: 'rgba(185,166,255,0.28)', shadow: 0.6,
    frame: '#0d0f24', frameUrl: 'rgba(255,255,255,0.08)', frameText: 'rgba(255,255,255,0.6)', frameStroke: 'rgba(185,166,255,0.25)',
    cta: 'rhythm-three.vercel.app ↗',
    defs: `<radialGradient id="rh-a" cx="0.1" cy="0.05" r="0.7"><stop offset="0" stop-color="#4b2bd6" stop-opacity="0.55"/><stop offset="1" stop-color="#4b2bd6" stop-opacity="0"/></radialGradient>
      <radialGradient id="rh-b" cx="0.95" cy="0.9" r="0.6"><stop offset="0" stop-color="#ff4fa0" stop-opacity="0.28"/><stop offset="1" stop-color="#ff4fa0" stop-opacity="0"/></radialGradient>`,
    bg: () => `<rect width="${W}" height="${H}" fill="#06071a"/><rect width="${W}" height="${H}" fill="url(#rh-a)"/><rect width="${W}" height="${H}" fill="url(#rh-b)"/>
      ${[0, 1, 2, 3, 4, 5].map((k) => `<circle cx="${W + 40}" cy="${H - 180}" r="${150 + k * 70}" fill="none" stroke="rgba(185,166,255,${0.1 - k * 0.012})" stroke-width="2"/>`).join('')}
      ${Array.from({ length: 22 }, (_, k) => { const hh = 18 + Math.abs(Math.sin(k * 1.7)) * 70; return `<rect x="${W - M - 22 * 12 + k * 12}" y="${180 - hh / 2}" width="5" height="${hh}" rx="2.5" fill="rgba(185,166,255,0.18)"/>`; }).join('')}`,
    logo: (x, y) => `<g><rect x="${x}" y="${y + 2}" width="128" height="44" rx="22" fill="#ffffff"/>${lines(['Rhythm'], x + 64, y + 32, { size: 24, weight: 700, fill: '#06071a', anchor: 'middle' })}</g>`,
  },
  flickmate: {
    text: '#141414', sub: 'rgba(20,20,20,0.66)', accent: '#141414', onAccent: '#f6f2e9', accentText: '#d8432c',
    chipBg: 'rgba(20,20,20,0.05)', line: 'rgba(20,20,20,0.16)', shadow: 0.22,
    frame: '#ffffff', frameUrl: '#f0ede6', frameText: 'rgba(20,20,20,0.55)', frameStroke: 'rgba(20,20,20,0.12)',
    cta: 'View on GitHub ↗',
    defs: `<radialGradient id="fm-a" cx="0.92" cy="0.12" r="0.55"><stop offset="0" stop-color="#9b7bff" stop-opacity="0.38"/><stop offset="1" stop-color="#9b7bff" stop-opacity="0"/></radialGradient>
      <radialGradient id="fm-b" cx="0.05" cy="0.95" r="0.5"><stop offset="0" stop-color="#ff7a59" stop-opacity="0.25"/><stop offset="1" stop-color="#ff7a59" stop-opacity="0"/></radialGradient>`,
    bg: () => `<rect width="${W}" height="${H}" fill="#f6f2e9"/><rect width="${W}" height="${H}" fill="url(#fm-a)"/><rect width="${W}" height="${H}" fill="url(#fm-b)"/>
      ${Array.from({ length: 27 }, (_, k) => `<rect x="${12 + k * 40}" y="18" width="22" height="14" rx="3" fill="rgba(20,20,20,0.08)"/><rect x="${12 + k * 40}" y="${H - 32}" width="22" height="14" rx="3" fill="rgba(20,20,20,0.08)"/>`).join('')}`,
    logo: (x, y) => `<g>${lines(['flickmate'], x, y + 36, { size: 36, weight: 900, fill: '#141414', ls: -1.5 })}<circle cx="${x + 172}" cy="${y + 30}" r="7" fill="#d8432c"/></g>`,
  },
};

// ---------- content ----------
const S = (f, r, w) => shot(f, r, w);
// Rhythm recordings have a Windows taskbar at the bottom; content sits in a centre column
const RH_FULL = { left: 0, top: 68, width: 1280, height: 600 };
const RH = { left: 190, top: 96, width: 900, height: 572 };
const one = (file, url, rect) => async (t, top) => {
  const img = await S(file, rect);
  const area = [Math.max(top + 40, 560), 1310];
  const avail = area[1] - area[0];
  // Shrink the frame if a tall crop would overflow the content area
  const w = Math.min(W - M * 2, ((avail - 46) * img.w) / img.h);
  const b = browser(0, 0, w, img, t, url);
  const y = area[0] + Math.max(0, (avail - b.h) / 2);
  return browser((W - w) / 2, y, w, img, t, url).svg;
};
const pair = (a, b, url) => async (t, top) => {
  const [i1, i2] = await Promise.all([S(a.file, a.rect), S(b.file, b.rect)]);
  const y = Math.max(top + 40, 540);
  // Two overlapping frames take ~1.62× one frame's height; keep them above the footer
  const aspect = Math.min(i1.w / i1.h, i2.w / i2.h);
  const w = Math.min(800, ((1310 - y) / 1.62 - 46) * aspect);
  const b1 = browser(M, y, w, i1, t, url);
  const b2 = browser(W - M - w, y + b1.h * 0.62, w, i2, t, url);
  return b1.svg + b2.svg;
};

const projects = {
  stepsaway: {
    name: 'Steps Away',
    kicker: 'MERN FINAL PROJECT · 2024',
    tagline: ['Your city’s community,', 'just a few steps away.'],
    hero: async (t) => {
      const [desk, mob] = await Promise.all([S('stepsaway-circle.jpg', { left: 0, top: 90, width: 1280, height: 560 }), S('stepsaway-mobile.jpg', { left: 178, top: 89, width: 246, height: 534 }, 600)]);
      return browser(M, 640, 860, desk, t, 'stepsaway-b892c.web.app').svg + phone(W - M - 270, 760, 270, mob).svg;
    },
    slides: [
      { title: ['Every city', 'is a hub.'], sub: ['Search your city — or add a new one', 'instantly with the GeoNames API.'], shots: one('stepsaway-city-search.jpg', 'stepsaway-b892c.web.app', { left: 250, top: 110, width: 780, height: 588 }) },
      { title: ['Find your circle.'], sub: ['Join or create circles, post notes and', 'talk with like-minded people nearby.'], shots: one('stepsaway-circle.jpg', 'stepsaway-b892c.web.app/circle', { left: 100, top: 100, width: 1080, height: 400 }) },
      { title: ['Likes, comments', '& reports.'], sub: ['Engage with notes — and flag anything', 'that doesn’t belong.'], shots: one('stepsaway-comments.jpg', 'stepsaway-b892c.web.app/circle', { left: 300, top: 110, width: 720, height: 588 }) },
      { title: ['Make it yours.'], sub: ['Bio, social links and custom', 'avatars generated with DiceBear.'], shots: one('stepsaway-profile-avatar.jpg', 'stepsaway-b892c.web.app/profile', { left: 250, top: 90, width: 780, height: 608 }) },
      { title: ['Moderated', 'by design.'], sub: ['Admins ban users, remove content', 'and resolve reports.'], shots: pair({ file: 'stepsaway-admin-stats.jpg' }, { file: 'stepsaway-admin-reports.jpg' }, 'stepsaway-b892c.web.app/admin') },
      {
        title: ['Install it', 'like an app.'], sub: ['Fully responsive, with basic PWA', 'support for desktop and mobile.'],
        shots: async (t, top) => {
          const [win, mob, prompt] = await Promise.all([
            S('stepsaway-pwa.jpg', { left: 67, top: 62, width: 417, height: 574 }, 700),
            S('stepsaway-mobile.jpg', { left: 178, top: 89, width: 246, height: 534 }, 600),
            S('stepsaway-pwa.jpg', { left: 963, top: 510, width: 302, height: 150 }, 600),
          ]);
          const y = Math.max(top + 40, 560);
          return card(M, y, 440, win, t).svg + phone(W - M - 330, y - 10, 330, mob).svg + card(M + 150, y + 520, 470, prompt, t).svg;
        },
      },
    ],
    stack: {
      title: ['Under the hood.'], sub: ['A full MERN build — from GeoNames city', 'lookups to admin moderation tools.'],
      tech: ['React', 'Node.js', 'Express.js', 'MongoDB', 'Mongoose', 'Tailwind CSS', 'Axios', 'DiceBear', 'React Toastify', 'GeoNames API', 'PWA'],
      links: [['Live demo', 'stepsaway-b892c.web.app'], ['Frontend', 'github.com/abhi-drops/stepsAway_Frontend'], ['Backend', 'github.com/abhi-drops/StepsAway_server']],
    },
  },
  rhythm: {
    name: 'Rhythm',
    kicker: 'BCA MAIN PROJECT · 2024',
    tagline: ['Share the music you make.', 'Discover what others play.'],
    hero: async (t) => {
      const img = await S('rhythm-curated.jpg', RH_FULL);
      return browser(M, 620, W - M * 2, img, t, 'rhythm-three.vercel.app').svg;
    },
    slides: [
      { title: ['Upload. Share.', 'Press play.'], sub: ['Upload your tracks and explore songs', 'from every creator on the platform.'], shots: one('rhythm-grid.jpg', 'rhythm-three.vercel.app/songs', RH) },
      { title: ['Playlists for', 'every mood.'], sub: ['Like songs, build playlists and', 'search songs, playlists and users.'], shots: pair({ file: 'rhythm-playlist-lofi.jpg', rect: RH }, { file: 'rhythm-playlist.jpg', rect: RH }, 'rhythm-three.vercel.app') },
      { title: ['Follow the artists', 'you love.'], sub: ['Artist profiles with their songs —', 'follow them to never miss a drop.'], shots: pair({ file: 'rhythm-artist.jpg', rect: RH }, { file: 'rhythm-followed.jpg', rect: RH }, 'rhythm-three.vercel.app/artist') },
      { title: ['Tip your', 'favourite creators.'], sub: ['Support musicians directly with', 'tips — and track what you earn.'], shots: one('rhythm-tip.jpg', 'rhythm-three.vercel.app/payment', { left: 120, top: 90, width: 1040, height: 570 }) },
      { title: ['Your profile,', 'your sound.'], sub: ['Light & dark mode, secure auth', 'and password reset via Firebase.'], shots: one('rhythm-profile.jpg', 'rhythm-three.vercel.app/profile', RH) },
    ],
    stack: {
      title: ['Under the hood.'], sub: ['SvelteKit on the front, Firebase', 'for auth, data and audio storage.'],
      tech: ['SvelteKit', 'Svelte', 'Firebase Auth', 'Cloud Firestore', 'Firebase Storage', 'Tailwind CSS', 'Flowbite Svelte', 'Vercel'],
      links: [['Live demo', 'rhythm-three.vercel.app'], ['GitHub', 'github.com/abhi-drops/Rhythm-music-sharing-platform']],
    },
  },
  flickmate: {
    name: 'flickmate',
    kicker: 'BCA MINI PROJECT · 2024',
    tagline: ['Movie tickets for a single', 'theatre — with rewards.'],
    hero: async (t) => {
      const img = await S('flickmate-ticket-home.jpg', { left: 0, top: 90, width: 1280, height: 560 });
      return browser(M, 620, W - M * 2, img, t, 'flickmate.com').svg;
    },
    slides: [
      { title: ['Pick your', 'perfect seat.'], sub: ['Platinum, gold and silver tiers', 'with live seat availability.'], shots: one('flickmate-seatmap.jpg', 'flickmate.com/seats', { left: 200, top: 90, width: 880, height: 608 }) },
      {
        title: ['Earn Flickcoins.'], sub: ['50 free coins on sign-up. 5% back on', 'every booking — auto-applied next time.'],
        shots: async (t, top) => {
          const [bill, ok] = await Promise.all([
            S('flickmate-payment.jpg', { left: 360, top: 90, width: 560, height: 560 }),
            S('flickmate-payment-success.jpg', { left: 330, top: 110, width: 620, height: 230 }),
          ]);
          const y = Math.max(top + 40, 560);
          const coin = (cx, cy, r) => `<g filter="url(#shadow)"><circle cx="${cx}" cy="${cy}" r="${r}" fill="#f2b632"/><circle cx="${cx}" cy="${cy}" r="${r - 14}" fill="none" stroke="#c98a0c" stroke-width="5"/>${lines(['FC'], cx, cy + r * 0.22, { size: r * 0.62, weight: 900, fill: '#7a4f00', anchor: 'middle' })}</g>`;
          return browser(M, y, 520, bill, t, 'flickmate.com/checkout').svg
            + browser(W - M - 560, y + 330, 560, ok, t, 'flickmate.com/booking').svg
            + coin(W - M - 150, y + 150, 92) + coin(W - M - 290, y + 70, 54)
            + chip(W - M - 410, y + 250, '+5% back in Flickcoins', { bg: '#141414', fg: '#f6f2e9', size: 24, h: 52 }).svg;
        },
      },
      { title: ['Every booking,', 'in one place.'], sub: ['A profile history of every show,', 'seat and amount paid.'], shots: one('flickmate-history.jpg', 'flickmate.com/profile') },
      {
        title: ['Run the theatre.'], sub: ['Admins manage movies, shows and', 'bookings by date — and track revenue.'],
        shots: pair({ file: 'flickmate-admin-revenue.jpg', rect: { left: 0, top: 90, width: 960, height: 600 } }, { file: 'flickmate-movie.jpg', rect: { left: 0, top: 90, width: 1280, height: 608 } }, 'flickmate.com/admin'),
      },
      { title: ['Simple sign-up.'], sub: ['Email-based accounts with a clean,', 'friendly login.'], shots: one('flickmate-login.jpg', 'flickmate.com/login') },
    ],
    stack: {
      title: ['Under the hood.'], sub: ['A classic LAMP-style build with', 'PHP and MySQLi.'],
      tech: ['PHP', 'MySQLi', 'HTML', 'CSS', 'JavaScript', 'Bootstrap'],
      links: [['GitHub', 'github.com/abhi-drops/flickmate-movie-ticket-booking-site']],
    },
  },
};

for (const [key, p] of Object.entries(projects)) {
  if (ONLY && ONLY !== key) continue;
  const t = themes[key];
  const n = p.slides.length + 2;
  const bufs = [await coverSlide(t, p, 0, n)];
  for (const [i, s] of p.slides.entries()) bufs.push(await featureSlide(t, s, i + 1, n));
  bufs.push(await stackSlide(t, p, n - 1, n));
  await writeSet(join(OUT, key), bufs);
  console.log(key, bufs.length, 'slides');
}
