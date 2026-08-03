/**
 * Mobile OTA Bundle API
 * Serves the latest Capacitor web bundle with manifest for incremental updates.
 */

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');

const router = express.Router();

const BUNDLE_DIR = path.join(__dirname, '..', 'public', 'mobile-bundle');
const MANIFEST_PATH = path.join(BUNDLE_DIR, 'manifest.json');
const VERSION_PATH = path.join(BUNDLE_DIR, 'version.json');

function getBundleDir() {
  return BUNDLE_DIR;
}

function computeHash(filePath) {
  const data = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(data).digest('base64');
}

function buildManifest() {
  if (!fs.existsSync(BUNDLE_DIR)) {
    return null;
  }

  const files = [];
  const walk = (dir, relPrefix = '') => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = relPrefix ? `${relPrefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(fullPath, relPath);
      } else {
        if (entry.name === 'manifest.json' || entry.name === 'version.json') continue;
        files.push({
          path: relPath.replace(/\\/g, '/'),
          hash: computeHash(fullPath),
          size: fs.statSync(fullPath).size,
        });
      }
    }
  };

  walk(BUNDLE_DIR);

  const pkgPath = path.join(__dirname, '..', 'package.json');
  const pkg = fs.existsSync(pkgPath) ? JSON.parse(fs.readFileSync(pkgPath, 'utf8')) : { version: '1.0.0' };

  const manifest = {
    version: pkg.version,
    builtAt: new Date().toISOString(),
    fileCount: files.length,
    files: files.sort((a, b) => a.path.localeCompare(b.path)),
  };

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  fs.writeFileSync(VERSION_PATH, JSON.stringify({
    version: manifest.version,
    builtAt: manifest.builtAt,
    fileCount: manifest.fileCount,
  }, null, 2));

  return manifest;
}

function getManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    return buildManifest();
  }
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  } catch {
    return buildManifest();
  }
}

// Public endpoints (no auth required for bundle download)
router.get('/version', (req, res) => {
  const manifest = getManifest();
  if (!manifest) {
    return res.status(404).json({ success: false, error: 'No bundle published. Run package:mobile first.' });
  }
  res.json({
    success: true,
    data: {
      version: manifest.version,
      builtAt: manifest.builtAt,
      fileCount: manifest.fileCount,
    },
  });
});

router.get('/manifest', (req, res) => {
  const manifest = getManifest();
  if (!manifest) {
    return res.status(404).json({ success: false, error: 'No bundle published. Run package:mobile first.' });
  }
  res.json({
    success: true,
    data: manifest,
  });
});

router.get('/files/*', (req, res) => {
  const requested = req.params[0];
  if (!requested) {
    return res.status(400).json({ success: false, error: 'File path required' });
  }

  // Path traversal protection
  const safePath = path.normalize(requested).replace(/^(\.\.\/?)+/, '').replace(/\\/g, '/');
  const fullPath = path.join(BUNDLE_DIR, safePath);
  const resolved = path.resolve(fullPath);
  const bundleResolved = path.resolve(BUNDLE_DIR);
  if (!resolved.startsWith(bundleResolved + path.sep) && resolved !== bundleResolved) {
    return res.status(403).json({ success: false, error: 'Access denied' });
  }

  if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) {
    return res.status(404).json({ success: false, error: 'File not found' });
  }

  // Set appropriate content type based on extension
  const ext = path.extname(safePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.ico': 'image/x-icon',
  };
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.sendFile(resolved);
});

module.exports = { router, buildManifest, getManifest, getBundleDir };
