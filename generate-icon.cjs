const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

async function makeWhiteBackgroundIcon() {
    const img = await loadImage('public/logo.png');
    // Ensure square icon (512x512)
    const size = 512;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Fill white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, size, size);

    // Draw image in center
    // Calculate aspect ratio
    const scale = Math.min((size - 40) / img.width, (size - 40) / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    const x = (size - w) / 2;
    const y = (size - h) / 2;

    ctx.drawImage(img, x, y, w, h);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('public/apple-touch-icon.png', buffer);
    console.log('Created apple-touch-icon.png');
}

makeWhiteBackgroundIcon().catch(console.error);
