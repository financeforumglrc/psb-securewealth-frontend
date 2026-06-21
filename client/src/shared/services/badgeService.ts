export function setAppBadge(count: number): void {
  if ('setAppBadge' in navigator) {
    try {
      (navigator as any).setAppBadge(count);
    } catch {
      // Badging API may fail silently
    }
  }
}

export function clearAppBadge(): void {
  if ('clearAppBadge' in navigator) {
    try {
      (navigator as any).clearAppBadge();
    } catch {
      // Badging API may fail silently
    }
  }
}
