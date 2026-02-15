#!/usr/bin/env node
// Create favicon files
const fs = require('fs');
const path = require('path');

// Create SVG favicon
const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#e53e3e"/>
  <text x="50" y="65" font-size="60" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial">M</text>
</svg>`;

// Create a valid 1x1 PNG as fallback (minimal valid PNG)
const pngFavicon = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
  0x00, 0x00, 0x00, 0x0d, // IHDR chunk size
  0x49, 0x48, 0x44, 0x52, // IHDR
  0x00, 0x00, 0x00, 0x01, // Width: 1
  0x00, 0x00, 0x00, 0x01, // Height: 1
  0x08, 0x02,             // Bit depth: 8, Color type: 2 (RGB)
  0x00, 0x00, 0x00,       // Compression, filter, interlace
  0x90, 0x77, 0x53, 0xde, // CRC
  0x00, 0x00, 0x00, 0x0c, // IDAT chunk size
  0x49, 0x44, 0x41, 0x54, // IDAT
  0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0xfe, 0xff,
  0x00, 0x00, 0x00, 0x02, 0x00, 0x01,
  0x49, 0xb4, 0xe8, 0xb7, // CRC
  0x00, 0x00, 0x00, 0x00, // IEND chunk size
  0x49, 0x45, 0x4e, 0x44, // IEND
  0xae, 0x42, 0x60, 0x82  // CRC
]);

const publicDir = path.join(__dirname, 'public');
const appDir = path.join(__dirname, 'app');

try {
  // Create SVG favicon in public directory
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgFavicon);
  console.log(`✓ Created favicon.svg in public/`);

  // Create PNG favicon in public directory as fallback
  fs.writeFileSync(path.join(publicDir, 'favicon.png'), pngFavicon);
  console.log(`✓ Created favicon.png in public/`);

  // Also create SVG favicon in app directory for Next.js icon handling
  fs.writeFileSync(path.join(appDir, 'favicon.svg'), svgFavicon);
  console.log(`✓ Created favicon.svg in app/`);

  console.log('\nFavicon setup complete!');
} catch (error) {
  console.error('Error creating favicons:', error.message);
  process.exit(1);
}
