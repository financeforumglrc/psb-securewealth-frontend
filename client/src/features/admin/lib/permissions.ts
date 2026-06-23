export type AdminRole = 'superadmin' | 'analyst' | 'viewer';

export const ROLE_LABELS: Record<AdminRole, string> = {
  superadmin: 'Super Admin',
  analyst: 'Analyst',
  viewer: 'Viewer',
};

type AdminAction =
  | 'acknowledge'
  | 'block'
  | 'whitelist'
  | 'false_positive'
  | 'export'
  | 'clear'
  | 'unfreeze'
  | 'reset_honeytoken'
  | 'reset_trap'
  | 'clear_threat';

export function can(role: AdminRole, action: AdminAction): boolean {
  if (role === 'superadmin') return true;
  if (role === 'viewer') return false;
  // analyst
  return ['acknowledge', 'false_positive', 'export', 'clear_threat'].includes(action);
}
