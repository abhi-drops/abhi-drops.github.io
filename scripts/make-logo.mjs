// One-time: turn the black-on-white Developer.png into trimmed, transparent
// white + black logos and a favicon. Run with `npm run logo`.
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'Developer.png');
const out = (name) => path.join(root, 'public/logo', name);

// Luminance → alpha: dark ink becomes opaque, white paper becomes transparent.
const trimmed = await sharp(src).flatten({ background: '#fff' }).trim({ threshold: 40 }).toBuffer();
const { data, info } = await sharp(trimmed).greyscale().raw().toBuffer({ resolveWithObject: true });
const alpha = Buffer.from(data.map((v) => 255 - v));

async function tinted(rgb, file) {
  const px = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < alpha.length; i++) {
    px[i * 4] = rgb[0];
    px[i * 4 + 1] = rgb[1];
    px[i * 4 + 2] = rgb[2];
    px[i * 4 + 3] = alpha[i];
  }
  await sharp(px, { raw: { width: info.width, height: info.height, channels: 4 } })
    .resize({ height: 160 })
    .png()
    .toFile(out(file));
}

await tinted([255, 255, 255], 'developer-white.png');
await tinted([0, 0, 0], 'developer-black.png');

// Favicon: script "D" on black rounded square.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
  <rect width="256" height="256" rx="56" fill="#000"/>
  <text x="128" y="182" font-family="Georgia, serif" font-style="italic" font-weight="700"
        font-size="170" fill="#fff" text-anchor="middle">D</text></svg>`;
await sharp(Buffer.from(svg)).png().toFile(out('favicon.png'));

console.log('logo written', info.width, 'x', info.height);
