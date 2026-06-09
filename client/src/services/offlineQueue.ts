interface QueuedAction {
  id: string;
  type: 'transaction' | 'goal_update' | 'bill_payment';
  payload: Record<string, unknown>;
  timestamp: string;
}

const STORAGE_KEY = 'sw_offline_queue';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function readQueue(): QueuedAction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QueuedAction[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedAction[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // Storage quota exceeded or private mode
  }
}

export function queueAction(action: Omit<QueuedAction, 'id'>): void {
  const queue = readQueue();
  const item: QueuedAction = { ...action, id: generateId() };
  queue.push(item);
  writeQueue(queue);

  // Attempt to register background sync if available
  void registerBackgroundSync();
}

export function getQueuedActions(): QueuedAction[] {
  return readQueue();
}

export function clearQueuedAction(id: string): void {
  const queue = readQueue().filter((q) => q.id !== id);
  writeQueue(queue);
}

export async function syncQueuedActions(): Promise<void> {
  const queue = readQueue();
  if (queue.length === 0) return;

  const failed: QueuedAction[] = [];

  for (const action of queue) {
    try {
      await processAction(action);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      failed.push(action);
    }
  }

  writeQueue(failed);
}

async function processAction(_action: QueuedAction): Promise<void> {
  // Simulate network request — replace with real API calls
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 90% success rate simulation for demo
      if (Math.random() > 0.1) {
        resolve();
      } else {
        reject(new Error('Sync failed'));
      }
    }, 300);
  });
}

async function registerBackgroundSync(): Promise<void> {
  const sw = navigator.serviceWorker;
  if (!sw || !('sync' in sw)) return;

  try {
    const reg = await sw.ready;
    if ('sync' in reg && typeof (reg as unknown as Record<string, unknown>).sync === 'object') {
      const syncManager = (reg as unknown as Record<string, unknown>).sync as { register: (tag: string) => Promise<void> };
      await syncManager.register('sync-transactions');
    }
  } catch {
    // Background sync registration failed — localStorage queue is the fallback
  }
}

export function supportsBackgroundSync(): boolean {
  return 'serviceWorker' in navigator && 'sync' in (navigator.serviceWorker as unknown as Record<string, unknown>);
}
