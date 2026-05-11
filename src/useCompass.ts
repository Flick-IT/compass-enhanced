import { createSignal, onCleanup, onMount } from "solid-js";

export type PermissionState = "prompt" | "granted" | "denied" | "unsupported";

function normalizeHeading(alpha: number, webkitHeading?: number): number {
  // iOS provides webkitCompassHeading directly (0=N, clockwise)
  if (webkitHeading != null && webkitHeading >= 0) {
    return Math.round(webkitHeading);
  }
  // Android: alpha is counter-clockwise rotation from north in device frame
  // Convert to compass heading (clockwise from north)
  return Math.round((360 - alpha) % 360);
}

export function useCompass() {
  const [heading, setHeading] = createSignal(0);
  const [permission, setPermission] = createSignal<PermissionState>("prompt");
  const [lockedHeading, setLockedHeading] = createSignal<number | null>(null);

  function handleOrientation(event: DeviceOrientationEvent) {
    const e = event as DeviceOrientationEvent & { webkitCompassHeading?: number };
    if (event.alpha == null) return;
    const h = normalizeHeading(event.alpha, e.webkitCompassHeading);
    setHeading(h);
  }

  function startListening() {
    window.addEventListener("deviceorientation", handleOrientation, true);
    setPermission("granted");
  }

  async function requestPermission() {
    const DOE = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };

    if (typeof DOE.requestPermission === "function") {
      try {
        const result = await DOE.requestPermission();
        if (result === "granted") {
          startListening();
        } else {
          setPermission("denied");
        }
      } catch {
        setPermission("denied");
      }
    } else if ("DeviceOrientationEvent" in window) {
      startListening();
    } else {
      setPermission("unsupported");
    }
  }

  onMount(() => {
    const DOE = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };
    // On Android / desktop, permission is not required
    if (typeof DOE.requestPermission !== "function" && "DeviceOrientationEvent" in window) {
      startListening();
    }
  });

  onCleanup(() => {
    window.removeEventListener("deviceorientation", handleOrientation, true);
  });

  function lockHeading() {
    setLockedHeading(heading());
  }

  function unlockHeading() {
    setLockedHeading(null);
  }

  function delta(): number | null {
    const locked = lockedHeading();
    if (locked == null) return null;
    let d = heading() - locked;
    // Normalize to -180..+180
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    return d;
  }

  return { heading, permission, requestPermission, lockedHeading, lockHeading, unlockHeading, delta };
}
