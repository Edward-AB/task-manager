import { useTheme } from '../../hooks/useTheme.js';

export default function MiniPie({ pct = 0, color, size = 26 }) {
  const { theme } = useTheme();
  const c = color || theme.accent;
  const r = (size - 4) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  // Clamp to [0, 100]
  const clamped = Math.min(100, Math.max(0, pct));

  if (clamped === 0) {
    // Empty circle
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={c}
          strokeWidth={2}
          opacity={0.3}
        />
      </svg>
    );
  }

  if (clamped === 100) {
    // Full circle with checkmark
    const checkSize = size * 0.3;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill={c} />
        <polyline
          points={`${cx - checkSize * 0.5},${cy} ${cx - checkSize * 0.1},${cy + checkSize * 0.4} ${cx + checkSize * 0.5},${cy - checkSize * 0.3}`}
          fill="none"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // Partial donut - start at 12 o'clock (-PI/2)
  const dashOffset = circumference * (1 - clamped / 100);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={c}
        strokeWidth={2}
        opacity={0.15}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={c}
        strokeWidth={2}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    </svg>
  );
}
