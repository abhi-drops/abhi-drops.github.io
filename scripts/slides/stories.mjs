// Highlight stories (1080×1920) + round highlight covers.
// Safe zones: top 0–190 (progress + header), bottom 1700+ (reply bar),
// 1330–1440 kept clear on slides that carry a link sticker (sticker sits at 72%).
// Usage: node scripts/slides/stories.mjs   (run after posts/college — it reuses their cover slides)
// Writes public/images/stories/<highlight>/01.webp, … and covers/<highlight>.webp
import { W, M, SRC, OUT_ROOT, EXT, encode, sharp, txt, chip, shot, phone, imgBox, panel, logo, renderSvg, writeSet, textW } from './lib.mjs';
import { mkdirSync, writeFileSync, readdirSync, rmSync } from 'node:fs';

const OUT = `${OUT_ROOT}/stories`;
const H = 1920;
const PUB = `${OUT_ROOT}/projects`;
const FR = `${SRC}frames`, ITCH = `${SRC}itch`;

const solid = (c1, c2, extra = '') => ({
  shadow: 0.45,
  defs: `<linearGradient id="sg" x1="0" y1="0" x2="0.7" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`,
  bg: (h) => `<rect width="${W}" height="${h}" fill="url(#sg)"/>${extra}`,
});

// Blurred, darkened copy of an image as a full-bleed background
async function blurBg(file) {
  const buf = await sharp(file).resize(W / 4, H / 4, { fit: 'cover' }).blur(6).modulate({ brightness: 0.55, saturation: 1.3 }).jpeg().toBuffer();
  return `<image x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none" xlink:href="data:image/jpeg;base64,${buf.toString('base64')}"/>`;
}

const kicker = (s, y = 250, fg = '#fff') => chip(M, y, s, { bg: 'rgba(255,255,255,0.16)', fg, size: 24, h: 52, family: 'JetBrains Mono', weight: 600 }).svg;
const big = (lines, y, size = 112, fill = '#fff') => txt(lines, M - 4, y, { size, weight: 900, fill, ls: -size * 0.035, lh: size * 0.98 });
const body = (lines, y, fill = 'rgba(255,255,255,0.85)', size = 40) => txt(lines, M, y, { size, weight: 500, fill, lh: size * 1.35, family: 'Inter' });

// Post-card story: a project's cover framed on its own blurred backdrop
async function cardStory({ img, label, title, line, link }) {
  const t = { shadow: 0.55, bg: () => '' };
  const im = await shot(img, null, 900);
  const cw = 780, ch = cw * (im.h / im.w);
  let s = await blurBg(img);
  s += imgBox((W - cw) / 2, 230, cw, ch, im, { r: 34 });
  const y = link ? 1545 : 1340; // below the link sticker (72%) and above the reply bar
  s += txt([label], W / 2, y, { size: 24, weight: 600, fill: 'rgba(255,255,255,0.75)', family: 'JetBrains Mono', anchor: 'middle', ls: 3 });
  s += txt([title], W / 2, y + 74, { size: 64, weight: 900, fill: '#fff', anchor: 'middle', ls: -1.5 });
  if (line) s += txt([line], W / 2, y + 130, { size: 32, weight: 500, fill: 'rgba(255,255,255,0.8)', anchor: 'middle', family: 'Inter' });
  return renderSvg(s, { H, t });
}

// Milestone story: theme background, date, headline, text, optional media
async function milestone(th, { date, title, text, media }) {
  let s = kicker(date) + big(title, 420) + body(text, 420 + (title.length - 1) * 110 + 90);
  if (media) s += await media();
  return renderSvg(s, { H, t: th });
}

// Logo-grid story for the Stack highlight
function logoStory(th, { label, title, items }) {
  let s = kicker(label) + big(title, 420);
  const top = 420 + (title.length - 1) * 110 + 80, cols = 2, gap = 26, cw = (W - M * 2 - gap) / cols;
  const rows = Math.ceil(items.length / cols), ch = Math.min(340, (1640 - top - (rows - 1) * gap) / rows);
  items.forEach(([slug, name, note], k) => {
    const x = M + (k % cols) * (cw + gap), y = top + Math.floor(k / cols) * (ch + gap);
    const ls = Math.min(ch > 280 ? 120 : 84, ch * 0.4);
    s += panel(x, y, cw, ch, { fill: '#fff', r: 30 }) + logo(slug, x + 30, y + 28, ls);
    s += txt([name], x + 30, y + 28 + ls + 52, { size: name.length > 14 ? 30 : 36, weight: 800, fill: '#111' });
    if (note && ch > 200) s += txt([note], x + 30, y + 28 + ls + 90, { size: 22, weight: 500, fill: '#6b7280', family: 'Inter' });
  });
  return renderSvg(s, { H, t: th });
}

// ---------- highlight covers (round, 320×320) ----------
const ICONS = {
  journey: `<path d="M110 230 C 60 200, 90 150, 150 160 S 230 130, 210 90" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" stroke-dasharray="4 26"/><circle cx="110" cy="232" r="16" fill="#fff"/><path d="M210 40 c-26 0 -44 20 -44 44 c0 32 44 70 44 70 s44 -38 44 -70 c0 -24 -18 -44 -44 -44z" fill="#fff"/><circle cx="210" cy="84" r="15" fill="#3b2a8f"/>`,
  projects: `<rect x="70" y="96" width="150" height="150" rx="26" fill="rgba(255,255,255,0.45)" transform="rotate(-10 145 171)"/><rect x="100" y="84" width="150" height="150" rx="26" fill="#fff"/><rect x="122" y="108" width="106" height="62" rx="10" fill="#f97316" opacity="0.85"/><rect x="122" y="184" width="76" height="12" rx="6" fill="#cbd5e1"/><rect x="122" y="204" width="52" height="12" rx="6" fill="#e2e8f0"/>`,
  stack: `<path d="M160 70 L260 120 L160 170 L60 120 Z" fill="#fff"/><path d="M60 160 L160 210 L260 160" fill="none" stroke="#fff" stroke-width="16" stroke-linejoin="round" opacity="0.8"/><path d="M60 200 L160 250 L260 200" fill="none" stroke="#fff" stroke-width="16" stroke-linejoin="round" opacity="0.55"/>`,
  digitrell: `<rect x="70" y="118" width="180" height="130" rx="24" fill="#fff"/><path d="M125 118 v-22 a16 16 0 0 1 16 -16 h38 a16 16 0 0 1 16 16 v22" fill="none" stroke="#fff" stroke-width="16"/><rect x="70" y="160" width="180" height="14" fill="#b91c1c" opacity="0.35"/><rect x="146" y="150" width="28" height="34" rx="8" fill="#b91c1c"/>`,
  play: `<path d="M92 120 h136 a50 50 0 0 1 48 62 l-14 52 a28 28 0 0 1 -48 10 l-26 -30 h-56 l-26 30 a28 28 0 0 1 -48 -10 l-14 -52 a50 50 0 0 1 48 -62 z" fill="#fff"/><rect x="104" y="150" width="14" height="46" rx="4" fill="#7c3aed"/><rect x="88" y="166" width="46" height="14" rx="4" fill="#7c3aed"/><circle cx="214" cy="158" r="11" fill="#ec4899"/><circle cx="238" cy="182" r="11" fill="#7c3aed"/>`,
};
async function coverImg(key, c1, c2) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="320" height="320" fill="url(#g)"/>${ICONS[key]}</svg>`;
  return encode(sharp(Buffer.from(svg)));
}

// ---------- content ----------
const J = solid('#1b1347', '#3b2a8f', Array.from({ length: 40 }, (_, k) => `<circle cx="${(k * 137) % W}" cy="${(k * 271) % H}" r="${2 + (k % 3)}" fill="#fff" opacity="0.15"/>`).join(''));
const sets = {
  journey: {
    cover: ['#3b2a8f', '#ec4899'],
    slides: [
      () => milestone(J, { date: '2021', title: ['It started', 'with a game.'], text: ['Began my BCA at CMS College Kottayam', '— and made StepUp, my first game,', 'with GDevelop.'], media: async () => {
        const [a, b] = await Promise.all([shot(`${ITCH}/stepup-1.png`, { left: 0, top: 0, width: 365, height: 500 }, 600), shot(`${ITCH}/stepup-4.png`, null, 600)]);
        return phone(M + 60, 1040, 380, a).svg + phone(W - M - 440, 960, 380, b).svg;
      } }),
      () => milestone(J, { date: 'BCA · SUMMER', title: ['Leveling up', 'in Unity.'], text: ['Built Blareland — a 2D shooter with', 'my own art and music — in C#.'], media: async () => imgBox(M, 1060, W - M * 2, (W - M * 2) * 9 / 16, await shot(`${FR}/blareland-title.jpg`, null, 1000), { r: 30 }) }),
      () => milestone(J, { date: 'JUN 2024', title: ['Graduated.'], text: ['Wrapped up BCA with two projects:', 'Rhythm (main) and FlickMate (mini).'], media: async () => {
        const [a, b] = await Promise.all([shot(`${PUB}/rhythm/01.${EXT}`, null, 600), shot(`${PUB}/flickmate/01.${EXT}`, null, 600)]);
        const cw = (W - M * 2 - 30) / 2;
        return imgBox(M, 920, cw, cw * 4 / 3, a, { r: 26 }) + imgBox(M + cw + 30, 980, cw, cw * 4 / 3, b, { r: 26 });
      } }),
      () => milestone(J, { date: '2024 · 7 MONTHS', title: ['Going', 'full stack.'], text: ['MERN training at Luminar Technolab,', 'certified by NCTT — final project:', 'Steps Away.'], media: async () => { const im = await shot(`${PUB}/stepsaway/01.${EXT}`, null, 700); const cw = 560; return imgBox((W - cw) / 2, 1000, cw, cw * 4 / 3 > 660 ? 660 : cw * 4 / 3, im, { r: 28 }); } }),
      () => milestone(J, { date: 'NOV 2024', title: ['First day', 'in tech.'], text: ['Joined Digitrell, Kochi as a', 'Web Developer Intern.'], media: async () => { const im = await shot(`${PUB}/intern-digitrell/01.${EXT}`, null, 700); const cw = 600; return imgBox((W - cw) / 2, 980, cw, cw * 4 / 3 > 680 ? 680 : cw * 4 / 3, im, { r: 28 }); } }),
      () => milestone(J, { date: 'FEB 2025', title: ['Full-Stack', 'Developer.'], text: ['Yard & warehouse platforms, AI', 'document processing and an SAP', 'MM wrapper — for a US brand.'], media: async () => {
        const ims = await Promise.all(['yard-warehouse', 'ai-docs', 'sap-wrapper'].map((p) => shot(`${PUB}/${p}/01.${EXT}`, null, 500)));
        const cw = 290; return ims.map((im, k) => `<g transform="rotate(${[-6, 0, 6][k]} ${M + 20 + k * 315 + cw / 2} 1280)">${imgBox(M + 20 + k * 315, 1080 + [30, 0, 30][k], cw, cw * 4 / 3, im, { r: 22 })}</g>`).join('');
      } }),
      () => milestone(J, { date: 'OCT 2026', title: ['Taskodoro', 'v0.1 beta.'], text: ['My comfort planner — free and', 'open source, on web and Android.'], media: async () => { const im = await shot(`${PUB}/taskodoro/01.${EXT}`, null, 700); const cw = 400; return imgBox((W - cw) / 2, 780, cw, cw * 4 / 3, im, { r: 26 }); } }),
      () => milestone(J, { date: 'NOW', title: ['What’s next?'], text: ['Open to new roles and fun', 'collaborations. Tap Message', 'on my profile to say hi.'], media: async () => {
        const me = await shot(`${SRC}me.jpg`, null, 700);
        const cx = W / 2, cy = 1180, r = 260;
        return `<defs><linearGradient id="ring" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#feda75"/><stop offset="0.5" stop-color="#d62976"/><stop offset="1" stop-color="#4f5bd5"/></linearGradient><clipPath id="mec"><circle cx="${cx}" cy="${cy}" r="${r - 22}"/></clipPath></defs>
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#ring)" filter="url(#shadow)"/><circle cx="${cx}" cy="${cy}" r="${r - 12}" fill="#1b1347"/>
          <image clip-path="url(#mec)" x="${cx - r + 22}" y="${cy - r + 22}" width="${(r - 22) * 2}" height="${(r - 22) * 2}" preserveAspectRatio="xMidYMid slice" xlink:href="${me.uri}"/>
          ${chip(cx - 150, cy + r - 30, 'Open to work', { bg: '#22c55e', fg: '#fff', size: 32, h: 70, pad: 36 }).svg}`;
      } }),
    ],
    links: { 6: { url: 'https://taskodoro.mavnt.in', label: 'taskodoro.mavnt.in' } },
  },
  projects: {
    cover: ['#f97316', '#db2777'],
    slides: [
      () => cardStory({ img: `${PUB}/taskodoro/01.${EXT}`, label: 'PERSONAL · 2026', title: 'Taskodoro', line: 'Comfort planner · web + Android', link: true }),
      () => cardStory({ img: `${PUB}/stepsaway/01.${EXT}`, label: 'MERN · 2024', title: 'Steps Away', line: 'City-based community platform', link: true }),
      () => cardStory({ img: `${PUB}/rhythm/01.${EXT}`, label: 'BCA MAIN PROJECT', title: 'Rhythm', line: 'Music sharing platform', link: true }),
      () => cardStory({ img: `${PUB}/flickmate/01.${EXT}`, label: 'BCA MINI PROJECT', title: 'FlickMate', line: 'Movie tickets with rewards', link: true }),
      () => cardStory({ img: `${PUB}/blareland/01.${EXT}`, label: 'UNITY · C#', title: 'Blareland', line: '2D mini shooter', link: true }),
      () => cardStory({ img: `${PUB}/stepup/01.${EXT}`, label: 'GDEVELOP · 2021', title: 'StepUp', line: 'My first game', link: true }),
    ],
    links: {
      0: { url: 'https://taskodoro.mavnt.in', label: 'taskodoro.mavnt.in' },
      1: { url: 'https://stepsaway-b892c.web.app', label: 'stepsaway-b892c.web.app' },
      2: { url: 'https://rhythm-three.vercel.app', label: 'rhythm-three.vercel.app' },
      3: { url: 'https://github.com/abhi-drops/flickmate-movie-ticket-booking-site', label: 'View on GitHub' },
      4: { url: 'https://abhi-drops.itch.io/blareland', label: 'Play on itch.io' },
      5: { url: 'https://abhi-drops.itch.io/stepup', label: 'Play on itch.io' },
    },
  },
  stack: {
    cover: ['#7c3aed', '#2563eb'],
    slides: [
      () => logoStory(solid('#7c3aed', '#2563eb'), { label: 'FRONTEND', title: ['React &', 'friends.'], items: [['react', 'React', 'Hooks · lifecycle'], ['typescript', 'TypeScript', 'Typed everything'], ['nextdotjs', 'Next.js', 'Routing · SSR'], ['tanstack', 'TanStack Router', 'SAP MM wrapper'], ['tailwindcss', 'Tailwind CSS', 'Utility-first'], ['html5', 'HTML & CSS', 'The fundamentals']] }),
      () => logoStory(solid('#0f766e', '#0e7490'), { label: 'BACKEND', title: ['APIs &', 'runtimes.'], items: [['nodedotjs', 'Node.js', 'Services'], ['express', 'Express.js', 'REST APIs'], ['hono', 'Hono', 'Cloudflare Workers'], ['jsonwebtokens', 'JWT', 'Auth'], ['drizzle', 'Drizzle ORM', 'Migrations'], ['sequelize', 'Sequelize', 'ORM']] }),
      () => logoStory(solid('#1e3a8a', '#0f172a'), { label: 'DATA', title: ['Databases.'], items: [['sqlserver', 'SQL Server', 'T-SQL tuning'], ['postgresql', 'PostgreSQL', 'Neon'], ['mysql', 'MySQL', 'FlickMate'], ['mongodb', 'MongoDB', 'StepsAway']] }),
      () => logoStory(solid('#ea580c', '#be123c'), { label: 'CLOUD & TOOLS', title: ['Ship it.'], items: [['cloudflareworkers', 'Cloudflare Workers', 'Edge APIs'], ['azure', 'Azure', 'SQL · Blob · Logic Apps'], ['docker', 'Docker', 'Compose'], ['capacitor', 'Capacitor', 'Android'], ['git', 'Git & GitHub', 'Feature / staging'], ['cicd', 'CI/CD', 'Automated delivery']] }),
      () => logoStory(solid('#4c1d95', '#be185d'), { label: 'AI-ASSISTED', title: ['Pair', 'programming 2.0.'], items: [['claude', 'Claude Code', 'Agentic coding'], ['cursor', 'Cursor', 'AI editor'], ['githubcopilot', 'GitHub Copilot', 'Inline help'], ['figma', 'Figma', 'Design → code']] }),
    ],
  },
  digitrell: {
    cover: ['#b91c1c', '#7c2d12'],
    slides: [
      () => milestone(solid('#7c2d12', '#b91c1c'), { date: 'DIGITRELL · KOCHI', title: ['Since', 'Nov 2024.'], text: ['Enterprise logistics & warehouse', 'platforms for a US canned soda &', 'beverage manufacturer.'], media: async () => {
        const ims = await Promise.all(['fullstack-digitrell', 'intern-digitrell'].map((p) => shot(`${PUB}/${p}/01.${EXT}`, null, 600)));
        const cw = (W - M * 2 - 30) / 2; return imgBox(M, 1000, cw, cw * 4 / 3, ims[1], { r: 26 }) + imgBox(M + cw + 30, 1060, cw, cw * 4 / 3, ims[0], { r: 26 });
      } }),
      () => cardStory({ img: `${PUB}/yard-warehouse/01.${EXT}`, label: 'PRODUCTION', title: 'Yard & Warehouse', line: '10+ modules · ZPL labels' }),
      () => cardStory({ img: `${PUB}/ai-docs/01.${EXT}`, label: 'FEATURE', title: 'AI Document Processing', line: 'Find · extract · store' }),
      () => cardStory({ img: `${PUB}/sap-wrapper/01.${EXT}`, label: 'UI WRAPPER', title: 'SAP MM Wrapper', line: 'Excel-style validation' }),
      () => milestone(solid('#7c2d12', '#b91c1c'), { date: 'NOV 2025', title: ['One year', 'in.'], text: ['Exciting projects, an incredible team,', 'and a lot of growth. Excited for', 'the chapters ahead.'], media: async () => {
        const dots = Array.from({ length: 34 }, (_, k) => `<rect x="${(k * 197) % (W - 40) + 20}" y="${940 + ((k * 89) % 640)}" width="${10 + (k % 3) * 6}" height="${18 + (k % 4) * 4}" rx="4" fill="${['#fde047', '#fff', '#fb923c', '#f9a8d4'][k % 4]}" opacity="0.85" transform="rotate(${(k * 37) % 90} ${(k * 197) % (W - 40) + 20} ${940 + ((k * 89) % 640)})"/>`).join('');
        return dots + txt(['1'], W / 2, 1600, { size: 720, weight: 900, fill: 'none', anchor: 'middle' }).replace('fill="none"', 'fill="rgba(255,255,255,0.12)" stroke="#fff" stroke-width="6"') + chip(W / 2 - 120, 1260, 'YEAR', { bg: '#fff', fg: '#b91c1c', size: 40, h: 80, pad: 50, family: 'JetBrains Mono', weight: 800 }).svg;
      } }),
    ],
  },
  play: {
    cover: ['#7c3aed', '#ec4899'],
    slides: [
      () => cardStory({ img: `${PUB}/blareland/01.${EXT}`, label: 'UNITY · C#', title: 'Blareland', line: 'Clear the sky before they land', link: true }),
      async () => {
        const th = solid('#1a0638', '#ff2e63');
        let s = kicker('BLARELAND · BOSS FIGHT') + big(['Five hits', 'to win.'], 420);
        s += imgBox(M, 760, W - M * 2, (W - M * 2) * 9 / 16, await shot(`${FR}/blareland-boss.jpg`, null, 1000), { r: 30 });
        s += imgBox(M, 1180, W - M * 2, (W - M * 2) * 9 / 16 * 0.7, await shot(`${FR}/blareland-store.jpg`, { left: 0, top: 0, width: 1280, height: 504 }, 1000), { r: 30 });
        return renderSvg(s, { H, t: th });
      },
      () => cardStory({ img: `${PUB}/stepup/01.${EXT}`, label: 'GDEVELOP · 2021', title: 'StepUp', line: 'My very first game', link: true }),
      async () => {
        const th = solid('#121212', '#3a0a0a');
        let s = kicker('STEPUP · TAP TO JUMP') + big(['Floor by', 'floor.'], 420);
        const [a, b] = await Promise.all([shot(`${ITCH}/stepup-3.png`, null, 700), shot(`${ITCH}/stepup-0.png`, null, 700)]);
        s += phone(M + 30, 760, 420, a).svg + phone(W - M - 450, 820, 420, b).svg;
        return renderSvg(s, { H, t: th });
      },
    ],
    links: { 0: { url: 'https://abhi-drops.itch.io/blareland', label: 'Play Blareland' }, 2: { url: 'https://abhi-drops.itch.io/stepup', label: 'Play StepUp' } },
  },
};

mkdirSync(`${OUT}/covers`, { recursive: true });
for (const f of readdirSync(`${OUT}/covers`)) rmSync(`${OUT}/covers/${f}`); // drop stale covers (and old formats)
for (const [key, set] of Object.entries(sets)) {
  const bufs = [];
  for (const f of set.slides) bufs.push(await f());
  await writeSet(`${OUT}/${key}`, bufs);
  writeFileSync(`${OUT}/covers/${key}.${EXT}`, await coverImg(key, ...set.cover));
  console.log(key, bufs.length);
}
