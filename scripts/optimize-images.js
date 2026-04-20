const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const srcDir = path.join(__dirname, '..', 'src', 'assets');
const outDir = path.join(srcDir, 'optimized');

const INPUT_SUBDIRS = ['', 'flat', 'prog'];
const SUPPORTED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);

const OPTIMIZED_WIDTH = 1366;
const WEBP_QUALITY = 72;
const WEBP_EFFORT = 6;

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function processOne(inputPath, outputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.has(ext)) return;

  try {
    await sharp(inputPath)
      .rotate()
      .resize({ width: OPTIMIZED_WIDTH, withoutEnlargement: true, fit: 'inside' })
      .webp({ quality: WEBP_QUALITY, effort: WEBP_EFFORT })
      .toFile(outputPath);
    console.log('Wrote', outputPath);
  } catch (err) {
    console.error('Failed', inputPath, err);
  }
}

function collectImagesRecursive(dir) {
  const result = [];
  if (!fs.existsSync(dir)) return result;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...collectImagesRecursive(fullPath));
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (SUPPORTED_EXTENSIONS.has(ext)) {
      result.push(fullPath);
    }
  }

  return result;
}

async function processDir(sub) {
  const dir = path.join(srcDir, sub);
  if (!fs.existsSync(dir)) {
    console.warn('Source folder missing, skipping:', dir);
    return;
  }

  const targetDir = path.join(outDir, sub);
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

  const files = collectImagesRecursive(dir);
  for (const input of files) {
    const rel = path.relative(dir, input);
    const parsed = path.parse(rel);
    const outWebp = path.join(targetDir, parsed.dir, parsed.name + '.webp');
    fs.mkdirSync(path.dirname(outWebp), { recursive: true });
    await processOne(input, outWebp);
  }
}

(async function(){
  for (const sub of INPUT_SUBDIRS) {
    await processDir(sub);
  }
  console.log('Image optimization complete. Outputs in', outDir);
})();
