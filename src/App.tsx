import { createSignal, Show } from "solid-js";
import { useCompass } from "./useCompass";
import CompassRose from "./CompassRose";

export default function App() {
  const { heading, permission, requestPermission, lockedHeading, lockHeading, unlockHeading, delta } =
    useCompass();

  const [pressing, setPressing] = createSignal(false);
  let longPressTimer: ReturnType<typeof setTimeout> | null = null;

  function startPress() {
    setPressing(true);
    longPressTimer = setTimeout(() => {
      if (lockedHeading() == null) {
        lockHeading();
      } else {
        unlockHeading();
      }
      setPressing(false);
    }, 600);
  }

  function cancelPress() {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
    setPressing(false);
  }

  const cardinalLabel = (deg: number) => {
    const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return dirs[Math.round(deg / 22.5) % 16];
  };

  const deltaSuffix = () => {
    const d = delta();
    if (d == null) return null;
    if (d === 0) return "0°";
    return (d > 0 ? "+" : "") + d + "°";
  };

  return (
    <div class="app">
      <Show when={permission() === "prompt"}>
        <div class="permission-screen">
          <div class="permission-content">
            <div class="permission-icon">🧭</div>
            <h1>Compass</h1>
            <p>Requires access to your device's motion sensors to determine direction.</p>
            <button class="permission-btn" onClick={requestPermission}>
              Enable Compass
            </button>
          </div>
        </div>
      </Show>

      <Show when={permission() === "denied"}>
        <div class="permission-screen">
          <div class="permission-content">
            <div class="permission-icon">⚠️</div>
            <h1>Permission Denied</h1>
            <p>Please allow motion sensor access in your browser settings and reload the page.</p>
          </div>
        </div>
      </Show>

      <Show when={permission() === "unsupported"}>
        <div class="permission-screen">
          <div class="permission-content">
            <div class="permission-icon">📵</div>
            <h1>Not Supported</h1>
            <p>This device does not have the required motion sensors.</p>
          </div>
        </div>
      </Show>

      <Show when={permission() === "granted"}>
        <div class="compass-screen">
          <div class="heading-display">
            <span class="heading-degrees">{heading()}°</span>
            <span class="heading-cardinal">{cardinalLabel(heading())}</span>
          </div>

          <Show when={lockedHeading() != null}>
            <div class="delta-display">
              <span class="delta-label">Locked {lockedHeading()}°</span>
              <span class={`delta-value ${(delta() ?? 0) < 0 ? "neg" : (delta() ?? 0) > 0 ? "pos" : ""}`}>
                {deltaSuffix()}
              </span>
            </div>
          </Show>

          <div
            class={`compass-wrapper${pressing() ? " pressing" : ""}${lockedHeading() != null ? " locked" : ""}`}
            onPointerDown={startPress}
            onPointerUp={cancelPress}
            onPointerLeave={cancelPress}
            onContextMenu={(e) => e.preventDefault()}
          >
            <CompassRose heading={heading()} lockedHeading={lockedHeading()} />
          </div>

          <div class="hint">
            {lockedHeading() == null
              ? "Hold to lock heading"
              : "Hold to clear lock"}
          </div>
        </div>
      </Show>
    </div>
  );
}
