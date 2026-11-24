// Taskodoro's own LinkedIn carousel (1080×1350) padded to the site's 3:4 (1080×1440)
// by extending its background colour, so nothing gets cropped.
// Usage: node scripts/slides/taskodoro.mjs
import { mkdirSync } from 'node:fs';
import { sharp, ROOT, SRC } from './lib.mjs';

const OUT = `${ROOT}public/images/projects/taskodoro`;
mkdirSync(OUT, { recursive: true });

for (let i = 1; i <= 9; i++) {
  const src = `${SRC}linkedin/taskodoro-${i}.jpg`;
  const { width, height } = await sharp(src).metadata();
  const { data } = await sharp(src).extract({ left: 4, top: 4, width: 1, height: 1 }).raw().toBuffer({ resolveWithObject: true });
  const pad = Math.round((width * 4) / 3 - height) / 2;
  // sharp runs extend after resize, so pad first and resize in a second pass
  const padded = await sharp(src).extend({ top: Math.floor(pad), bottom: Math.ceil(pad), background: { r: data[0], g: data[1], b: data[2] } }).toBuffer();
  await sharp(padded).resize(1080, 1440).jpeg({ quality: 86, mozjpeg: true }).toFile(`${OUT}/${String(i).padStart(2, '0')}.jpg`);
}
console.log('taskodoro 9 slides');
