import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface BatteryManager {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
}

interface DeviceStatus {
  batteryLevel: number | null;
  batteryCharging: boolean | null;
  deviceMemory: number | null;
  hardwareConcurrency: number | null;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  online: boolean;
}

export default function DeviceStatusCard() {
  const [status, setStatus] = useState<DeviceStatus>({
    batteryLevel: null,
    batteryCharging: null,
    deviceMemory: null,
    hardwareConcurrency: null,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    pixelRatio: window.devicePixelRatio || 1,
    online: navigator.onLine,
  });

  useEffect(() => {
    let batteryRef: BatteryManager | null = null;

    const updateBattery = (battery: BatteryManager) => {
      setStatus((prev) => ({
        ...prev,
        batteryLevel: battery.level,
        batteryCharging: battery.charging,
      }));
    };

    const initBattery = async () => {
      const nav = navigator as unknown as Record<string, unknown>;
      if (typeof nav.getBattery === 'function') {
        try {
          const battery = (await nav.getBattery()) as BatteryManager;
          batteryRef = battery;
          updateBattery(battery);

          const handler = () => updateBattery(battery);
          battery.addEventListener('levelchange', handler);
          battery.addEventListener('chargingchange', handler);
        } catch {
          // Battery API not available
        }
      }
    };

    void initBattery();

    // Device memory & concurrency
    const navAny = navigator as unknown as Record<string, unknown>;
    setStatus((prev) => ({
      ...prev,
      deviceMemory: typeof navAny.deviceMemory === 'number' ? navAny.deviceMemory : null,
      hardwareConcurrency: typeof navigator.hardwareConcurrency === 'number' ? navigator.hardwareConcurrency : null,
    }));

    // Online / offline
    const handleOnline = () => setStatus((prev) => ({ ...prev, online: true }));
    const handleOffline = () => setStatus((prev) => ({ ...prev, online: false }));
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Screen resize
    const handleResize = () => {
      setStatus((prev) => ({
        ...prev,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        pixelRatio: window.devicePixelRatio || 1,
      }));
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('resize', handleResize);
      if (batteryRef) {
        // Cleanup listeners if needed — simplified for strict mode safety
        batteryRef = null;
      }
    };
  }, []);

  const rows = [
    {
      label: 'Battery Level',
      value: status.batteryLevel !== null ? `${Math.round(status.batteryLevel * 100)}%` : 'N/A',
      icon: status.batteryCharging ? 'fa-bolt' : status.batteryLevel !== null && status.batteryLevel > 0.2 ? 'fa-battery-three-quarters' : 'fa-battery-quarter',
      color: status.batteryCharging ? 'text-emerald-500' : status.batteryLevel !== null && status.batteryLevel > 0.2 ? 'text-sky-500' : 'text-rose-500',
    },
    {
      label: 'Charging',
      value: status.batteryCharging === null ? 'N/A' : status.batteryCharging ? 'Yes' : 'No',
      icon: 'fa-plug',
      color: status.batteryCharging ? 'text-emerald-500' : 'text-slate-400',
    },
    {
      label: 'Device Memory',
      value: status.deviceMemory !== null ? `${status.deviceMemory} GB` : 'N/A',
      icon: 'fa-memory',
      color: 'text-violet-500',
    },
    {
      label: 'CPU Cores',
      value: status.hardwareConcurrency !== null ? `${status.hardwareConcurrency}` : 'N/A',
      icon: 'fa-microchip',
      color: 'text-amber-500',
    },
    {
      label: 'Screen Resolution',
      value: `${status.screenWidth} × ${status.screenHeight}`,
      icon: 'fa-display',
      color: 'text-cyan-500',
    },
    {
      label: 'Pixel Density',
      value: `${status.pixelRatio.toFixed(1)}x`,
      icon: 'fa-eye',
      color: 'text-pink-500',
    },
    {
      label: 'Network Status',
      value: status.online ? 'Online' : 'Offline',
      icon: status.online ? 'fa-wifi' : 'fa-wifi-slash',
      color: status.online ? 'text-emerald-500' : 'text-rose-500',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="card"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <i className="fas fa-mobile-screen-button text-primary text-sm" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">Device Status</h3>
          <p className="text-[10px] text-slate-400">Real-time hardware & environment info</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50"
          >
            <i className={`fas ${row.icon} ${row.color} text-xs w-4 text-center`} />
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">{row.label}</p>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{row.value}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
