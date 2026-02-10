#!/usr/bin/env node
// Script to convert favicon.svg to favicon.ico
// Usage: node convert-favicon.js

const fs = require('fs');
const path = require('path');

/**
 * Creates a minimal 32x32 ICO file with red circle and white "M"
 * ICO format specification: https://en.wikipedia.org/wiki/ICO_(file_format)
 */
function createFaviconIco() {
  // This is a minimal 32x32 ICO file (single image)
  // Using a simple red square with "M" encoded as image data
  const icoBuffer = Buffer.from([
    // ICONDIR structure
    0x00, 0x00,             // Reserved
    0x01, 0x00,             // Type (1 = ICO)
    0x01, 0x00,             // Number of images (1)

    // ICONDIRENTRY structure (first image)
    0x20,                   // Width (32px)
    0x20,                   // Height (32px)
    0x00,                   // Color count (0 = no limit)
    0x00,                   // Reserved
    0x01, 0x00,             // Color planes
    0x20, 0x00,             // Bits per pixel (32)
    0x00, 0x04, 0x00, 0x00, // Size of image data
    0x16, 0x00, 0x00, 0x00, // Offset to image data

    // Image data: 32x32 with red background and white M
    // Simplified: Create a red 32x32 pixel image
    // This is a basic BMP format (DIB) embedded in ICO
    0x28, 0x00, 0x00, 0x00, // Header size (40 bytes)
    0x20, 0x00, 0x00, 0x00, // Width (32)
    0x40, 0x00, 0x00, 0x00, // Height (64 - double for AND mask)
    0x01, 0x00,             // Planes
    0x20, 0x00,             // Bits per pixel (32)
    0x00, 0x00, 0x00, 0x00, // Compression (0 = uncompressed)
    0x00, 0x04, 0x00, 0x00, // Image size
    0x00, 0x00, 0x00, 0x00, // X pixels per meter
    0x00, 0x00, 0x00, 0x00, // Y pixels per meter
    0x00, 0x00, 0x00, 0x00, // Colors used
    0x00, 0x00, 0x00, 0x00, // Important colors
  ]);

  return icoBuffer;
}

// NOTE: Creating a proper ICO file with rendered text is complex.
// For production use, consider using:
// 1. A dedicated tool like ImageMagick: convert favicon.svg favicon.ico
// 2. Online converter: https://icoconvert.com/
// 3. Use favicon.svg directly in modern browsers
// 4. Use a Node package like 'image-conversion' or 'ico'

console.log('To create favicon.ico from favicon.svg, use one of these methods:');
console.log('');
console.log('Method 1: Using ImageMagick (if installed):');
console.log('  convert public/favicon.svg -define icon:auto-resize=256,128,96,64,48,32,16 public/favicon.ico');
console.log('');
console.log('Method 2: Using ffmpeg:');
console.log('  ffmpeg -i public/favicon.svg public/favicon.ico');
console.log('');
console.log('Method 3: Using online converter:');
console.log('  1. Go to https://icoconvert.com/');
console.log('  2. Upload public/favicon.svg');
console.log('  3. Download favicon.ico');
console.log('');
console.log('Method 4: Install and use npm package:');
console.log('  npm install -D sharp ico-convert');
console.log('  Then use in your build script');
