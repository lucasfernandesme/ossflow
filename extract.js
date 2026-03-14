import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';

async function extractLogo() {
  try {
    const img = await loadImage('F:/DEV/telalogin7.png');
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, img.width, img.height);
    const data = imgData.data;
    const width = imgData.width;
    const height = imgData.height;

    const limitY = Math.floor(height * 0.65);

    let minX = width, minY = height, maxX = 0, maxY = 0;
    
    // Threshold for white-ish pixels in this dark image
    const thresh = 80;
    
    for (let y = 0; y < limitY; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx], g = data[idx+1], b = data[idx+2];
        
        // Threshold lower 
        if (r > thresh && g > thresh && b > thresh) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }
    
    if (minX > maxX) {
      console.log('No white pixels found');
      return;
    }

    // Add padding
    const pad = 20;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(width, maxX + pad);
    maxY = Math.min(height, maxY + pad);

    const cropW = maxX - minX;
    const cropH = maxY - minY;

    const outCanvas = createCanvas(cropW, cropH);
    const outCtx = outCanvas.getContext('2d');
    
    // Copy the cropped region
    outCtx.putImageData(ctx.getImageData(minX, minY, cropW, cropH), 0, 0);

    const outData = outCtx.getImageData(0, 0, cropW, cropH);
    const d = outData.data;

    // Make transparent and white
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i+1], b = d[i+2];
      if (r > thresh && g > thresh && b > thresh) {
        d[i] = 255; d[i+1] = 255; d[i+2] = 255; d[i+3] = 255; // Solid white
      } else {
        d[i+3] = 0; // Transparent
      }
    }
    
    outCtx.putImageData(outData, 0, 0);

    const buffer = outCanvas.toBuffer('image/png');
    fs.writeFileSync('F:/DEV/Antigravity/ossflow/public/logo-novo.png', buffer);
    console.log('Success saved F:/DEV/Antigravity/ossflow/public/logo-novo.png');

  } catch (err) {
    console.error(err);
  }
}

extractLogo();
