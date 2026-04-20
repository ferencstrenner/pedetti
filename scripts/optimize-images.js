const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const srcDir = path.join(__dirname, '..', 'src', 'assets');
const outDir = path.join(srcDir, 'optimized');

const INPUT_SUBDIRS = ['flat', 'prog'];

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function processOne(inputPath, outputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) return;

  try {
    await sharp(inputPath)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);
    console.log('Wrote', outputPath);
  } catch (err) {
    console.error('Failed', inputPath, err);
  }
}

async function processDir(sub) {
  const dir = path.join(srcDir, sub);
  if (!fs.existsSync(dir)) {
    console.warn('Source folder missing, skipping:', dir);
    return;
  }

  const targetDir = path.join(outDir, sub);
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

  const files = fs.readdirSync(dir);
  for (const file of files) {
    const input = path.join(dir, file);
    const ext = path.extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;
    const base = path.basename(file, ext);
    const outWebp = path.join(targetDir, base + '.webp');
    await processOne(input, outWebp);
  }
}

(async function(){
  for (const sub of INPUT_SUBDIRS) {
    await processDir(sub);
  }
  console.log('Image optimization complete. Outputs in', outDir);
})();
