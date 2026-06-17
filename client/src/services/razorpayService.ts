/**
 * Razorpay Checkout loader
 * Dynamically injects https://checkout.razorpay.com/v1/checkout.js
 * and exposes a promise-based loader so multiple callers share one script load.
 */

let loadPromise: Promise<boolean> | null = null;

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  return loadPromise;
}

export function isRazorpayAvailable(): boolean {
  return typeof window !== 'undefined' && Boolean(window.Razorpay);
}
