// Profile photo for the site (public/images/me.webp) from source/me.jpg.
// Usage: node scripts/slides/avatar.mjs
import { writeFileSync } from 'node:fs';
import { sharp, SRC, OUT_ROOT, EXT, encode } from './lib.mjs';

// A photo shown up to 150px wide: a bit more quality than the slides, metadata stripped
writeFileSync(`${OUT_ROOT}/me.${EXT}`, await encode(sharp(`${SRC}me.jpg`).rotate(), 86));
console.log('avatar');
