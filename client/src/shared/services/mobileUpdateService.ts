/**
 * Free OTA Live Update service for the Capacitor Android app.
 * Downloads the latest web bundle from the backend and switches the
 * WebView base path so the app runs the new code without reinstalling.
 */

import { Capacitor, WebView } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { App } from '@capacitor/app';
import { Network } from '@capacitor/network';

const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL || 'https://psb-securewealth-backend.onrender.com/api/v1';
const BUNDLE_BASE = `${BACKEND_BASE}/mobile/bundle`;
const BUNDLE_DIR = 'mobile-bundle';
const CURRENT_VERSION_KEY = 'ota_current_version';
const CURRENT_BASE_PATH_KEY = 'ota_current_base_path';

export interface BundleFile {
  path: string;
  hash: string;
  size: number;
}

export interface BundleManifest {
  version: string;
  builtAt: string;
  fileCount: number;
  files: BundleFile[];
}

export interface UpdateInfo {
  available: boolean;
  currentVersion?: string;
  remoteVersion?: string;
  manifest?: BundleManifest;
}

function log(...args: any[]) {
  // eslint-disable-next-line no-console
  console.log('[OTA]', ...args);
}

function isNative() {
  return Capacitor.isNativePlatform();
}

async function getRemoteVersion(): Promise<{ version: string; builtAt: string; fileCount: number } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${BUNDLE_BASE}/version`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

async function getRemoteManifest(): Promise<BundleManifest | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(`${BUNDLE_BASE}/manifest`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

async function getCurrentVersion(): Promise<string> {
  try {
    const { value } = await Preferences.get({ key: CURRENT_VERSION_KEY });
    return value || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

async function setCurrentVersion(version: string) {
  await Preferences.set({ key: CURRENT_VERSION_KEY, value: version });
}

async function setCurrentBasePath(basePath: string | null) {
  await Preferences.set({ key: CURRENT_BASE_PATH_KEY, value: basePath || '' });
}

async function ensureBundleDir(version: string) {
  const dir = `${BUNDLE_DIR}/${version}`;
  try {
    await Filesystem.mkdir({ path: dir, directory: Directory.Data, recursive: true });
  } catch {
    // may already exist
  }
  return dir;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await Filesystem.stat({ path, directory: Directory.Data });
    return true;
  } catch {
    return false;
  }
}

async function downloadFile(remotePath: string, localPath: string): Promise<boolean> {
  try {
    const url = `${BUNDLE_BASE}/files/${remotePath}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return false;

    const blob = await res.blob();
    const reader = new FileReader();
    const base64 = await new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64Part = result.split(',')[1];
        if (base64Part) resolve(base64Part);
        else reject(new Error('Base64 conversion failed'));
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    await Filesystem.writeFile({
      path: localPath,
      directory: Directory.Data,
      data: base64,
      recursive: true,
    });
    return true;
  } catch (err) {
    log('download failed', remotePath, err);
    return false;
  }
}

async function downloadUpdate(manifest: BundleManifest): Promise<{ success: boolean; basePath: string; error?: string }> {
  const versionDir = await ensureBundleDir(manifest.version);
  const total = manifest.files.length;
  let downloaded = 0;
  let failed = 0;

  for (const file of manifest.files) {
    const localPath = `${versionDir}/${file.path}`;
    const exists = await fileExists(localPath);
    // Re-download if missing. We skip hash verification for speed; can be added later.
    if (!exists) {
      const ok = await downloadFile(file.path, localPath);
      if (ok) downloaded++;
      else failed++;
    } else {
      downloaded++;
    }
  }

  if (failed > 0) {
    return { success: false, basePath: '', error: `${failed}/${total} files failed to download` };
  }

  const resolvedBasePath = await Filesystem.getUri({
    path: versionDir,
    directory: Directory.Data,
  });

  // Strip file:// prefix so Capacitor's WebView receives an absolute native path
  return { success: true, basePath: resolvedBasePath.uri.replace(/^file:\/\//, '') };
}

async function applyUpdate(basePath: string, version: string): Promise<boolean> {
  try {
    const wv = WebView as any;
    if (!wv?.setServerBasePath) {
      log('WebView.setServerBasePath unavailable');
      return false;
    }
    await wv.setServerBasePath({ path: basePath });
    if (wv.persistServerBasePath) {
      await wv.persistServerBasePath();
    }
    await setCurrentBasePath(basePath);
    await setCurrentVersion(version);
    log('applied update', version, basePath);
    return true;
  } catch (err) {
    log('apply update failed', err);
    return false;
  }
}

export async function checkForUpdate(): Promise<UpdateInfo> {
  if (!isNative()) {
    return { available: false };
  }

  const currentVersion = await getCurrentVersion();
  const remote = await getRemoteVersion();
  if (!remote) {
    return { available: false, currentVersion };
  }

  const available = remote.version !== currentVersion;
  if (!available) {
    return { available: false, currentVersion, remoteVersion: remote.version };
  }

  const manifest = await getRemoteManifest();
  return { available: true, currentVersion, remoteVersion: remote.version, manifest: manifest || undefined };
}

export async function performUpdate(): Promise<{ success: boolean; version?: string; error?: string }> {
  if (!isNative()) {
    return { success: false, error: 'OTA only works on native platforms' };
  }

  const network = await Network.getStatus();
  if (!network.connected) {
    return { success: false, error: 'No internet connection' };
  }

  const info = await checkForUpdate();
  if (!info.available || !info.manifest) {
    return { success: false, error: 'No update available' };
  }

  const downloadResult = await downloadUpdate(info.manifest);
  if (!downloadResult.success) {
    return { success: false, error: downloadResult.error || 'Download failed' };
  }

  const applied = await applyUpdate(downloadResult.basePath, info.manifest.version);
  if (!applied) {
    return { success: false, error: 'Failed to apply update' };
  }

  return { success: true, version: info.manifest.version };
}

export async function startBackgroundUpdateCheck(onUpdate: (info: UpdateInfo) => void) {
  if (!isNative()) return;

  const check = async () => {
    const network = await Network.getStatus();
    if (!network.connected) return;
    const info = await checkForUpdate();
    if (info.available) {
      onUpdate(info);
    }
  };

  // Check on app start
  await check();

  // Check on resume
  App.addListener('resume', async () => {
    await check();
  });
}

export const otaService = {
  checkForUpdate,
  performUpdate,
  startBackgroundUpdateCheck,
};

export default otaService;
