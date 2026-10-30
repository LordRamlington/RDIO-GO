import { useState, useEffect } from 'react';

export interface DeviceStatus {
  timeStr: string;
  isOnline: boolean;
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'offline';
  cellularGeneration: '5G' | '4G' | 'LTE' | '3G' | '2G' | 'E';
  signalBars: number; // 1 to 4 bars
  downlinkMbps: number | null;
  rttMs: number | null;
  batteryLevel: number; // 0 to 100
  isCharging: boolean;
  isBatterySupported: boolean;
}

export function useDeviceStatus(): DeviceStatus {
  // 1. Clock State - formatted as HH:MM
  const [timeStr, setTimeStr] = useState<string>(() => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  });

  // 2. Network State
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [connectionType, setConnectionType] = useState<'wifi' | 'cellular' | 'ethernet' | 'offline'>('wifi');
  const [cellularGeneration, setCellularGeneration] = useState<'5G' | '4G' | 'LTE' | '3G' | '2G' | 'E'>('5G');
  const [signalBars, setSignalBars] = useState<number>(4);
  const [downlinkMbps, setDownlinkMbps] = useState<number | null>(null);
  const [rttMs, setRttMs] = useState<number | null>(null);

  // 3. Battery State
  const [batteryLevel, setBatteryLevel] = useState<number>(88);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [isBatterySupported, setIsBatterySupported] = useState<boolean>(false);

  // Live Clock Interval (1 second)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Network Information API & Connectivity Listeners
  useEffect(() => {
    const readNetworkInfo = () => {
      const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
      setIsOnline(online);

      if (!online) {
        setConnectionType('offline');
        setSignalBars(0);
        return;
      }

      const conn =
        typeof navigator !== 'undefined'
          ? (navigator as any).connection ||
            (navigator as any).mozConnection ||
            (navigator as any).webkitConnection
          : null;

      if (conn) {
        const type = conn.type;
        const effectiveType = conn.effectiveType;
        const downlink = typeof conn.downlink === 'number' ? conn.downlink : null;
        const rtt = typeof conn.rtt === 'number' ? conn.rtt : null;

        setDownlinkMbps(downlink);
        setRttMs(rtt);

        // Determine Connection Type
        if (type === 'wifi') {
          setConnectionType('wifi');
        } else if (type === 'cellular') {
          setConnectionType('cellular');
        } else if (type === 'ethernet') {
          setConnectionType('ethernet');
        } else if (type === 'none') {
          setConnectionType('offline');
        } else {
          // If type is unspecified (standard in mobile browser privacy), infer from downlink / effectiveType
          if (downlink !== null && downlink >= 15) {
            setConnectionType('wifi');
          } else {
            setConnectionType('cellular');
          }
        }

        // Determine Cellular Generation Badge (5G / 4G / 3G / 2G)
        if (effectiveType === '4g') {
          if (downlink !== null && (downlink >= 15 || (rtt !== null && rtt <= 45))) {
            setCellularGeneration('5G');
          } else {
            setCellularGeneration('4G');
          }
        } else if (effectiveType === '3g') {
          setCellularGeneration('3G');
        } else if (effectiveType === '2g') {
          setCellularGeneration('2G');
        } else if (effectiveType === 'slow-2g') {
          setCellularGeneration('E');
        } else {
          setCellularGeneration('5G');
        }

        // Calculate Signal Strength Bars (1 to 4)
        if (downlink !== null || rtt !== null) {
          const d = downlink || 5;
          const r = rtt || 50;

          if (d >= 8 || r <= 50) {
            setSignalBars(4);
          } else if (d >= 3.5 || r <= 100) {
            setSignalBars(3);
          } else if (d >= 1.0 || r <= 220) {
            setSignalBars(2);
          } else {
            setSignalBars(1);
          }
        } else {
          setSignalBars(4);
        }
      } else {
        // Fallback for environments without Network Information API
        setConnectionType('wifi');
        setCellularGeneration('5G');
        setSignalBars(4);
      }
    };

    readNetworkInfo();

    const conn =
      typeof navigator !== 'undefined'
        ? (navigator as any).connection ||
          (navigator as any).mozConnection ||
          (navigator as any).webkitConnection
        : null;

    if (conn && conn.addEventListener) {
      conn.addEventListener('change', readNetworkInfo);
    }

    window.addEventListener('online', readNetworkInfo);
    window.addEventListener('offline', readNetworkInfo);

    return () => {
      if (conn && conn.removeEventListener) {
        conn.removeEventListener('change', readNetworkInfo);
      }
      window.removeEventListener('online', readNetworkInfo);
      window.removeEventListener('offline', readNetworkInfo);
    };
  }, []);

  // Battery Status API
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('getBattery' in navigator)) {
      return;
    }

    let batteryInstance: any = null;

    (navigator as any)
      .getBattery()
      .then((battery: any) => {
        batteryInstance = battery;
        setIsBatterySupported(true);

        const updateBattery = () => {
          setBatteryLevel(Math.round(battery.level * 100));
          setIsCharging(Boolean(battery.charging));
        };

        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
      })
      .catch((err: any) => {
        console.warn('Battery API not available:', err);
      });

    return () => {
      if (batteryInstance) {
        batteryInstance.removeEventListener?.('levelchange', () => {});
        batteryInstance.removeEventListener?.('chargingchange', () => {});
      }
    };
  }, []);

  return {
    timeStr,
    isOnline,
    connectionType,
    cellularGeneration,
    signalBars,
    downlinkMbps,
    rttMs,
    batteryLevel,
    isCharging,
    isBatterySupported,
  };
}
