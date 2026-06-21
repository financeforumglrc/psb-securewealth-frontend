import type { Asset, Goal, Transaction } from '@/shared/types';

interface SaveFilePickerOptions {
  suggestedName?: string;
  types?: Array<{
    description?: string;
    accept: Record<string, string[]>;
  }>;
}

interface WindowWithFilePicker extends Window {
  showSaveFilePicker?: (options: SaveFilePickerOptions) => Promise<FileSystemFileHandle>;
}

interface ExportData {
  exportedAt: string;
  app: string;
  version: string;
  assets: Asset[];
  goals: Goal[];
  transactions: Transaction[];
}

export async function exportUserDataToFile(
  assets: Asset[],
  goals: Goal[],
  transactions: Transaction[]
): Promise<void> {
  const data: ExportData = {
    exportedAt: new Date().toISOString(),
    app: 'SecureWealth Twin',
    version: '1.0.0',
    assets,
    goals,
    transactions,
  };

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });

  const win = window as unknown as WindowWithFilePicker;
  if (typeof win.showSaveFilePicker === 'function') {
    try {
      const handle = await win.showSaveFilePicker({
        suggestedName: 'SecureWealth_Data.json',
        types: [
          {
            description: 'JSON',
            accept: { 'application/json': ['.json'] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
    } catch (err) {
      // User cancelled or API failed — fallback to download
      if (err instanceof Error && err.name !== 'AbortError') {
        fallbackDownload(blob, 'SecureWealth_Data.json');
      }
    }
  } else {
    fallbackDownload(blob, 'SecureWealth_Data.json');
  }
}

export async function saveBlobToFile(
  blob: Blob,
  suggestedName: string,
  typeDescription: string,
  accept: Record<string, string[]>
): Promise<void> {
  const win = window as unknown as WindowWithFilePicker;
  if (typeof win.showSaveFilePicker === 'function') {
    try {
      const handle = await win.showSaveFilePicker({
        suggestedName,
        types: [{ description: typeDescription, accept }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        fallbackDownload(blob, suggestedName);
      }
    }
  } else {
    fallbackDownload(blob, suggestedName);
  }
}

function fallbackDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
