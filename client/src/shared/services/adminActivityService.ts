export interface AdminActivity {
  id: number;
  action: string;
  target: string;
  details: string;
  role: string;
  timestamp: string;
}

type ActivityListener = (activities: AdminActivity[]) => void;

class AdminActivityService {
  private activities: AdminActivity[] = [];
  private listeners: Set<ActivityListener> = new Set();
  private id = 0;

  subscribe(listener: ActivityListener) {
    this.listeners.add(listener);
    listener([...this.activities]);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => l([...this.activities]));
  }

  log(action: string, target: string, details = '', role = 'superadmin') {
    this.activities.unshift({
      id: ++this.id,
      action,
      target,
      details,
      role,
      timestamp: new Date().toISOString(),
    });
    this.activities = this.activities.slice(0, 200);
    this.notify();
  }

  getActivities() { return [...this.activities]; }
}

export const adminActivityService = new AdminActivityService();
