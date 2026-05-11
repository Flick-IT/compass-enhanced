type Props = {
  heading: number;
  lockedHeading: number | null;
};

const TICK_COUNT = 72; // every 5 degrees
const LABEL_DEGREES = [0, 45, 90, 135, 180, 225, 270, 315];
const CARDINALS: Record<number, string> = { 0: "N", 90: "E", 180: "S", 270: "W" };

export default function CompassRose(props: Props) {
  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 148;
  const innerR = 132;
  const labelR = 112;

  function tickAt(deg: number) {
    const isMajor = deg % 90 === 0;
    const isMid = deg % 45 === 0;
    const tickOuter = outerR;
    const tickInner = isMajor ? innerR - 10 : isMid ? innerR - 4 : innerR + 2;

    const rad = ((deg - props.heading) - 90) * (Math.PI / 180);
    const x1 = cx + tickOuter * Math.cos(rad);
    const y1 = cy + tickOuter * Math.sin(rad);
    const x2 = cx + tickInner * Math.cos(rad);
    const y2 = cy + tickInner * Math.sin(rad);

    return { x1, y1, x2, y2, isMajor, isMid };
  }

  function labelAt(deg: number) {
    const rad = ((deg - props.heading) - 90) * (Math.PI / 180);
    const x = cx + labelR * Math.cos(rad);
    const y = cy + labelR * Math.sin(rad);
    return { x, y };
  }

  function needlePoints(offsetDeg: number, color: string) {
    // Needle pointing up (north) with no offset, rotated by offsetDeg
    const rad = (offsetDeg - 90) * (Math.PI / 180);
    const radBack = (offsetDeg + 90) * (Math.PI / 180);
    const tipR = 82;
    const baseR = 82;
    const sideR = 10;

    const tip = {
      x: cx + tipR * Math.cos(rad),
      y: cy + tipR * Math.sin(rad),
    };
    const base = {
      x: cx + baseR * Math.cos(radBack),
      y: cy + baseR * Math.sin(radBack),
    };
    const radLeft = (offsetDeg - 180) * (Math.PI / 180);
    const radRight = (offsetDeg) * (Math.PI / 180);
    const left = {
      x: cx + sideR * Math.cos(radLeft),
      y: cy + sideR * Math.sin(radLeft),
    };
    const right = {
      x: cx + sideR * Math.cos(radRight),
      y: cy + sideR * Math.sin(radRight),
    };

    return `${tip.x},${tip.y} ${left.x},${left.y} ${base.x},${base.y} ${right.x},${right.y}`;
  }

  // North needle points in direction (0 - heading) relative to screen up
  const northAngle = -props.heading; // screen rotation to show north up
  // Actually the rose rotates so that current heading faces up
  // North needle: fixed at top when heading=0, always points to actual north
  // The rose rotates by -heading degrees (so that north=0 stays up when heading=0)
  // Needle is fixed pointing up (north)

  const lockedAngle = props.lockedHeading != null ? props.lockedHeading - props.heading : null;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ "touch-action": "none", "user-select": "none" }}
    >
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="#333" stroke-width="1" />

      {/* Ticks */}
      {Array.from({ length: TICK_COUNT }, (_, i) => i * 5).map((deg) => {
        const t = tickAt(deg);
        return (
          <line
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={deg === 0 ? "#ff3b30" : t.isMajor ? "#fff" : t.isMid ? "#888" : "#555"}
            stroke-width={t.isMajor ? 2 : 1}
          />
        );
      })}

      {/* Degree labels */}
      {LABEL_DEGREES.map((deg) => {
        const pos = labelAt(deg);
        const isCardinal = deg % 90 === 0;
        const label = CARDINALS[deg] ?? String(deg);
        return (
          <text
            x={pos.x}
            y={pos.y}
            text-anchor="middle"
            dominant-baseline="central"
            fill={deg === 0 ? "#ff3b30" : "#fff"}
            font-size={isCardinal ? "16" : "11"}
            font-weight={isCardinal ? "700" : "400"}
            font-family="-apple-system, system-ui, sans-serif"
          >
            {label}
          </text>
        );
      })}

      {/* Locked heading marker */}
      {lockedAngle != null && (() => {
        const rad = (lockedAngle - 90) * (Math.PI / 180);
        const mx = cx + outerR * Math.cos(rad);
        const my = cy + outerR * Math.sin(rad);
        const mx2 = cx + (outerR - 20) * Math.cos(rad);
        const my2 = cy + (outerR - 20) * Math.sin(rad);
        return (
          <line
            x1={mx}
            y1={my}
            x2={mx2}
            y2={my2}
            stroke="#ff9f0a"
            stroke-width="3"
            stroke-linecap="round"
          />
        );
      })()}

      {/* Red north needle half */}
      <polygon
        points={needlePoints(-props.heading, "red")}
        fill="#ff3b30"
        opacity="0.95"
      />
      {/* White south needle half */}
      <polygon
        points={needlePoints(-props.heading + 180, "white")}
        fill="#ffffff"
        opacity="0.85"
      />

      {/* Center dot */}
      <circle cx={cx} cy={cy} r="6" fill="#1c1c1e" stroke="#555" stroke-width="1.5" />

      {/* Indicator triangle at top */}
      <polygon
        points={`${cx},${cy - outerR - 2} ${cx - 6},${cy - outerR - 12} ${cx + 6},${cy - outerR - 12}`}
        fill="#ff3b30"
      />
    </svg>
  );
}
