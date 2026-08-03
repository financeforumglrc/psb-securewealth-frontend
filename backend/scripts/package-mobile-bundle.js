/**
 * Package mobile bundle for OTA live updates.
 * 1. Builds the frontend Vite app
 * 2. Copies dist/ into backend/public/mobile-bundle/
 * 3. Generates manifest.json + version.json
 *
 * Run from repo root:
 *   node backend/scripts/package-mobile-bundle.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..', '..');
const CLIENT_DIR = path.join(REPO_ROOT, 'client');
const BUNDLE_DIR = path.join(__dirname, '..', 'public', 'mobile-bundle');

function cleanDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function main() {
  console.log('Building frontend...');
  execSync('npm run build', { cwd: CLIENT_DIR, stdio: 'inherit' });

  console.log('Copying dist to mobile bundle...');
  cleanDir(BUNDLE_DIR);
  copyDir(path.join(CLIENT_DIR, 'dist'), BUNDLE_DIR);

  console.log('Generating manifest...');
  const { buildManifest } = require(path.join(__dirname, '..', 'routes', 'mobile-bundle'));
  const manifest = buildManifest();

  console.log('\n✓ Mobile bundle packaged:');
  console.log(`  Version:   ${manifest.version}`);
  console.log(`  Files:     ${manifest.fileCount}`);
  console.log(`  Built at:  ${manifest.builtAt}`);
  console.log(`  Location:  ${BUNDLE_DIR}`);
  console.log(`\nOTA endpoints:`);
  console.log(`  GET /api/v1/mobile/bundle/version`);
  console.log(`  GET /api/v1/mobile/bundle/manifest`);
  console.log(`  GET /api/v1/mobile/bundle/files/<path>`);
}

main();
