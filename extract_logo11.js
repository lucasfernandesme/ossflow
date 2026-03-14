import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';

async function extractLogo() {
  try {
    const img = await loadImage('F:/DEV/Antigravity/ossflow/public/logo11.png');
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, img.width, img.height);
    const data = imgData.data;

    // Make transparent where it's not white-ish
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2];
      
      // If it's bright enough, keep it white, otherwise make it transparent
      if (r > 100 && g > 100 && b > 100) {
        data[i] = 255; data[i+1] = 255; data[i+2] = 255; data[i+3] = 255; // Solid white
      } else {
        data[i+3] = 0; // Transparent
      }
    }
    
    ctx.putImageData(imgData, 0, 0);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('F:/DEV/Antigravity/ossflow/public/logo11_transparent.png', buffer);
    console.log('Success');

  } catch (err) {
    console.error(err);
  }
}

extractLogo();
