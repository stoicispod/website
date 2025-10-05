// Simple icon generator using Node.js and canvas
const fs = require('fs');
const { createCanvas } = require('canvas');

function createIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background circle
  ctx.fillStyle = '#e74c3c';
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2, 0, 2 * Math.PI);
  ctx.fill();
  
  // White circle in center
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/3, 0, 2 * Math.PI);
  ctx.fill();
  
  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`icons/${filename}`, buffer);
  console.log(`Created ${filename}`);
}

// Create icons
createIcon(16, 'icon16.png');
createIcon(48, 'icon48.png');
createIcon(128, 'icon128.png');

console.log('All icons generated successfully!');
