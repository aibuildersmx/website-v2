"use client";

import { useEffect } from "react";

/**
 * Keeps the laptop driving the projector from dimming or sleeping while the
 * QR is up. Browsers drop the lock when the tab is hidden, so it's re-taken
 * whenever the tab comes back. Silently does nothing where unsupported.
 */
export function StayAwake() {
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    const take = async () => {
      if (document.visibilityState !== "visible" || !("wakeLock" in navigator)) return;
      try {
        lock = await navigator.wakeLock.request("screen");
      } catch {
        // Denied (battery saver, permissions policy): the page still works.
      }
    };
    take();
    document.addEventListener("visibilitychange", take);
    return () => {
      document.removeEventListener("visibilitychange", take);
      lock?.release().catch(() => {});
    };
  }, []);
  return null;
}
