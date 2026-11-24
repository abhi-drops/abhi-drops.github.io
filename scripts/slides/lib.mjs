// Shared SVG → JPEG slide toolkit (posts 1080×1440, stories 1080×1920).
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const req = createRequire(import.meta.url);
export const sharp = req('sharp');
export const SI = await import('simple-icons');

export const ROOT = fileURLToPath(new URL('../../', import.meta.url)); // project root
export const SRC = fileURLToPath(new URL('./source/', import.meta.url)); // frames & screenshots

export const W = 1080, M = 72;

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const textW = (s, size, k = 0.56) => String(s).length * size * k;
let uid = 0;
export const id = (p = 'i') => `${p}${uid++}`;

// Multi-line text. opts: size, weight, fill, lh, family, anchor, ls, opacity
export const txt = (arr, x, y, { size, weight = 400, fill, lh = size * 1.2, family = 'Inter Display', anchor = 'start', ls = 0, opacity = 1 }) =>
  `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${ls}" opacity="${opacity}">${[]
    .concat(arr)
    .map((l, i) => `<tspan x="${x}" dy="${i ? lh : 0}">${esc(l)}</tspan>`)
    .join('')}</text>`;

export function chip(x, y, label, { bg, fg, size = 26, pad = 22, h = 52, border, family = 'Inter Display', weight = 600, r } = {}) {
  const w = textW(label, size, family.includes('Mono') ? 0.62 : 0.56) + pad * 2;
  return {
    w, h,
    svg: `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r ?? h / 2}" fill="${bg}" ${border ? `stroke="${border}" stroke-width="2"` : ''}/>${txt([label], x + pad, y + h / 2 + size * 0.36, { size, weight, fill: fg, family })}</g>`,
  };
}

export function chipRow(x, y, labels, style, maxW = W - M * 2, gap = 14) {
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

export async function shot(file, rect, width = 1200) {
  let img = sharp(file);
  if (rect) img = img.extract(rect);
  const meta = await sharp(file).metadata();
  const srcW = rect ? rect.width : meta.width;
  const buf = await img.resize({ width: Math.round(Math.min(width, srcW * 1.6)), kernel: 'lanczos3' }).jpeg({ quality: 90 }).toBuffer();
  const m = await sharp(buf).metadata();
  return { uri: `data:image/jpeg;base64,${buf.toString('base64')}`, w: m.width, h: m.height };
}

export function browser(x, y, w, img, t, url = '') {
  const cid = id('c'), bar = 46, ih = (w * img.h) / img.w, r = 22;
  return {
    h: bar + ih,
    svg: `<g filter="url(#shadow)">
      <clipPath id="${cid}"><rect x="${x}" y="${y}" width="${w}" height="${bar + ih}" rx="${r}"/></clipPath>
      <g clip-path="url(#${cid})">
        <rect x="${x}" y="${y}" width="${w}" height="${bar + ih}" fill="${t.frame}"/>
        <circle cx="${x + 26}" cy="${y + 23}" r="7" fill="#ff5f57"/><circle cx="${x + 48}" cy="${y + 23}" r="7" fill="#febc2e"/><circle cx="${x + 70}" cy="${y + 23}" r="7" fill="#28c840"/>
        ${url ? `<rect x="${x + w / 2 - 170}" y="${y + 10}" width="340" height="26" rx="13" fill="${t.frameUrl}"/>${txt([url], x + w / 2, y + 28, { size: 15, weight: 500, fill: t.frameText, anchor: 'middle', family: 'Inter' })}` : ''}
        <image x="${x}" y="${y + bar}" width="${w}" height="${ih}" preserveAspectRatio="none" xlink:href="${img.uri}"/>
      </g>
      <rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${bar + ih - 1}" rx="${r}" fill="none" stroke="${t.frameStroke}" stroke-width="1.5"/>
    </g>`,
  };
}

export function phone(x, y, w, img) {
  const cid = id('c');
  const b = Math.round(w * 0.045), ih = ((w - b * 2) * img.h) / img.w, h = ih + b * 2, r = w * 0.15;
  return {
    h,
    svg: `<g filter="url(#shadow)">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="#0c0c0e"/>
      <clipPath id="${cid}"><rect x="${x + b}" y="${y + b}" width="${w - b * 2}" height="${ih}" rx="${r - b}"/></clipPath>
      <image clip-path="url(#${cid})" x="${x + b}" y="${y + b}" width="${w - b * 2}" height="${ih}" preserveAspectRatio="none" xlink:href="${img.uri}"/>
    </g>`,
  };
}

// Image clipped to a rounded rect, fixed box, cover-cropped.
export function imgBox(x, y, w, h, img, { r = 20, stroke, shadow = true } = {}) {
  const cid = id('c');
  return `<g ${shadow ? 'filter="url(#shadow)"' : ''}><clipPath id="${cid}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/></clipPath>
    <image clip-path="url(#${cid})" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" xlink:href="${img.uri}"/>
    ${stroke ? `<rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" rx="${r}" fill="none" stroke="${stroke}" stroke-width="2"/>` : ''}</g>`;
}

// Rounded panel (for drawn mockups)
export const panel = (x, y, w, h, { fill, stroke, r = 24, shadow = true, sw = 2 } = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${stroke ? `stroke="${stroke}" stroke-width="${sw}"` : ''} ${shadow ? 'filter="url(#shadow)"' : ''}/>`;

// ---------- brand logos (simple-icons, CC0) with drawn fallbacks ----------
const bySlug = Object.fromEntries(Object.values(SI).filter((x) => x && x.slug).map((i) => [i.slug, i]));
const FALLBACK = {
  sqlserver: { text: 'SQL', hex: 'CC2927' },
  azure: { text: 'Az', hex: '0078D4' },
  csharp: { text: 'C#', hex: '68217A' },
  rest: { text: '{ }', hex: '0EA5E9' },
  responsive: { text: '▭▯', hex: '8B5CF6' },
  a11y: { text: 'Aa', hex: '16A34A' },
  wireframe: { text: '⬚', hex: '64748B' },
  uiux: { text: 'UX', hex: 'EC4899' },
  cicd: { text: '∞', hex: 'F97316' },
  blob: { text: 'Blob', hex: '0078D4' },
  logic: { text: '⇄', hex: '0078D4' },
  esnext: { text: 'ES6', hex: 'F7DF1E' },
  gdevelop: { text: 'GD', hex: '2D3A8C' },
};
export const hasLogo = (slug) => !!bySlug[slug];
export function logo(slug, x, y, size) {
  const ic = bySlug[slug];
  if (ic) {
    // Very light brand colours disappear on white cards — draw those in ink
    const [r, g, b] = [0, 2, 4].map((k) => parseInt(ic.hex.slice(k, k + 2), 16) / 255);
    const fill = 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.86 ? '#1f2937' : `#${ic.hex}`;
    return `<g transform="translate(${x} ${y}) scale(${size / 24})"><path d="${ic.path}" fill="${fill}"/></g>`;
  }
  const f = FALLBACK[slug] || { text: slug.slice(0, 2).toUpperCase(), hex: '334155' };
  const fs = size * (f.text.length > 2 ? 0.36 : 0.5);
  return `<g><rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size * 0.22}" fill="#${f.hex}"/>${txt([f.text], x + size / 2, y + size / 2 + fs * 0.36, { size: fs, weight: 800, fill: '#fff', anchor: 'middle', family: 'Inter Display' })}</g>`;
}
export const logoHex = (slug) => `#${(bySlug[slug] || FALLBACK[slug] || { hex: '334155' }).hex}`;

// ---------- page frame ----------
export const shadowDefs = (s) => `<filter id="shadow" x="-20%" y="-20%" width="140%" height="150%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="22"/><feOffset dy="22"/>
    <feComponentTransfer><feFuncA type="linear" slope="${s}"/></feComponentTransfer>
    <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="soft" x="-20%" y="-20%" width="140%" height="150%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="10"/><feOffset dy="8"/>
    <feComponentTransfer><feFuncA type="linear" slope="${s * 0.7}"/></feComponentTransfer>
    <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;

export function postChrome(t, i, n, { last, H }) {
  const num = `${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
  const cta = last ? t.cta || 'Thanks for reading' : 'Swipe  →';
  const c = chip(0, 0, cta, { bg: t.accent, fg: t.onAccent, size: 24, h: 50 });
  return `${t.logo(M, 72)}
    ${n > 1 ? chip(W - M - textW(num, 22, 0.62) - 40, 74, num, { bg: 'none', fg: t.sub, size: 22, h: 46, pad: 20, border: t.line, family: 'JetBrains Mono', weight: 500 }).svg : ''}
    ${txt(['@abhinand.as'], M, H - 72, { size: 24, weight: 500, fill: t.sub, family: 'Inter' })}
    ${n > 1 || t.cta ? chip(W - M - c.w, H - 72 - 34, cta, { bg: t.accent, fg: t.onAccent, size: 24, h: 50 }).svg : ''}`;
}

export async function renderSvg(body, { H, t }) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>${shadowDefs(t.shadow)}${t.defs || ''}</defs>${t.bg(H)}${body}</svg>`;
  return sharp(Buffer.from(svg)).jpeg({ quality: 86, mozjpeg: true }).toBuffer();
}

// Title + subtitle; returns { svg, bottom }
export function heading(t, title, sub, y = 250, { size = 74, subSize = 32 } = {}) {
  const tl = size * 1.13, sl = subSize * 1.44;
  let out = txt(title, M, y, { size, weight: 800, fill: t.text, lh: tl, ls: -1.5 });
  const sy = y + (title.length - 1) * tl + subSize * 2.05;
  if (sub?.length) out += txt(sub, M, sy, { size: subSize, weight: 400, fill: t.sub, lh: sl, family: 'Inter' });
  return { svg: out, bottom: sub?.length ? sy + (sub.length - 1) * sl + 30 : y + (title.length - 1) * tl + 30 };
}

// Theme helper: builds common theme fields from a small palette.
export function theme({ dark = true, bg, text, sub, accent, onAccent, accentText, panel: pnl, panelText, line, logo: mark, cta, shadow, decor = () => '', defs = '' }) {
  return {
    text, sub, accent, onAccent, accentText, cta,
    chipBg: dark ? 'rgba(255,255,255,0.08)' : 'rgba(20,20,20,0.05)',
    line: line || (dark ? 'rgba(255,255,255,0.22)' : 'rgba(20,20,20,0.16)'),
    shadow: shadow ?? (dark ? 0.45 : 0.2),
    frame: dark ? '#111318' : '#ffffff', frameUrl: dark ? 'rgba(255,255,255,0.1)' : '#f0ede6',
    frameText: dark ? 'rgba(255,255,255,0.6)' : 'rgba(20,20,20,0.55)', frameStroke: dark ? 'rgba(255,255,255,0.16)' : 'rgba(20,20,20,0.12)',
    panel: pnl || (dark ? '#14161d' : '#ffffff'), panelText: panelText || (dark ? '#e8eaf0' : '#1d1d1f'),
    defs, logo: mark,
    bg: (H) => `${bg(H)}${decor(H)}`,
  };
}

export async function writeSet(dir, bufs) {
  const { mkdirSync, writeFileSync, readdirSync, rmSync } = await import('node:fs');
  mkdirSync(dir, { recursive: true });
  for (const f of readdirSync(dir)) rmSync(`${dir}/${f}`);
  bufs.forEach((b, i) => writeFileSync(`${dir}/${String(i + 1).padStart(2, '0')}.jpg`, b));
}
