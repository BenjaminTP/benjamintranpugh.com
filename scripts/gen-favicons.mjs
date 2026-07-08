// Regenerates the raster favicon set from the FEA "stressed link" mark.
// Run after changing the mark:  node scripts/gen-favicons.mjs
// Outputs (into public/): favicon.ico, favicon-96.png, favicon-192.png, apple-touch-icon.png
// The browser-tab icon stays public/favicon.svg (transparent); these raster
// files are the charcoal tile Google Search and mobile home screens use.
import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { writeFileSync } from 'node:fs';

const tile = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <defs>
    <linearGradient id="jet" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#E0442E"/>
      <stop offset=".3" stop-color="#E8D533"/>
      <stop offset=".55" stop-color="#35C25A"/>
      <stop offset=".78" stop-color="#21B0D6"/>
      <stop offset="1" stop-color="#2451D6"/>
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="6" fill="#131519"/>
  <g transform="rotate(20 16 16)">
    <rect x="11" y="4.5" width="10" height="23" rx="5" fill="url(#jet)"/>
    <circle cx="16" cy="9" r="1.8" fill="#131519"/>
    <circle cx="16" cy="23" r="1.8" fill="#131519"/>
  </g>
</svg>`;

const base = await sharp(Buffer.from(tile), { density: 512 })
  .resize(512, 512)
  .png()
  .toBuffer();

const png = (size) => sharp(base).resize(size, size).png().toBuffer();

writeFileSync('public/favicon-96.png', await png(96));
writeFileSync('public/favicon-192.png', await png(192));
writeFileSync('public/apple-touch-icon.png', await png(180));
writeFileSync('public/favicon.ico', await pngToIco([await png(16), await png(32), await png(48)]));

console.log('favicons written to public/');
