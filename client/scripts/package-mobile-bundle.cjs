/**
 * Package the latest Vite web build into the backend mobile-bundle directory
 * so the backend can serve it as a free, self-hosted OTA update payload.
 */

const fs = require('fs');
const path = require('path');
const { buildManifest } = require('../../backend/utils/mobile-manifest');

const source = path.join(__dirname, '..', 'dist');
const target = path.join(__dirname, '..', '..', 'backend', 'public', 'mobile-bundle');

function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (!fs.existsSync(source)) {
  console.error('❌ dist/ folder not found. Run npm run build first.');
  process.exit(1);
}

// Wipe old bundle and copy the new one
fs.rmSync(target, { recursive: true, force: true });
copyRecursive(source, target);

// Generate manifest.json and version.json
const manifest = buildManifest(target);

console.log(`✅ Mobile bundle packaged: v${manifest.version} • ${manifest.fileCount} files • ${target}`);
console.log(`🌐 OTA endpoints:`);
console.log(`   ${manifest.version}  -> /api/v1/mobile/bundle/version`);
console.log(`   manifest -> /api/v1/mobile/bundle/manifest`);
console.log(`   files    -> /api/v1/mobile/bundle/files/<path>`);
