import { useTheme } from '../../hooks/useTheme.js';

/**
 * SVG donut chart showing task distribution by status.
 * Props: stats - { total_tasks, completed_tasks, priority_high }
 */
export default function TimeDistribution({ stats = {} }) {
  const { theme } = useTheme();

  const total = stats.total_tasks || 0;
  const completed = stats.completed_tasks || 0;
  const highPriority = stats.priority_high || 0;
  // Remaining = total - completed - high priority remaining (avoid double-counting)
  // "High priority" from API is total high-priority tasks; some may be done.
  // Show: completed, high-priority-remaining, other-remaining
  const remaining = total - completed;
  const highRemaining = Math.min(highPriority, remaining);
  const otherRemaining = remaining - highRemaining;

  const segments = [
    { value: completed, color: theme.chartDone, label: 'Completed' },
    { value: highRemaining, color: theme.chartHigh, label: 'High Priority' },
    { value: otherRemaining, color: theme.chartNone, label: 'Remaining' },
  ];

  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - 20) / 2;
  const circumference = 2 * Math.PI * r;
  const strokeW = 14;

  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (total === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={theme.border} strokeWidth={strokeW} opacity={0.3} />
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
            fill={theme.textTertiary} fontSize={theme.font.bodySmall} fontWeight={500}>
            No tasks
          </text>
        </svg>
      </div>
    );
  }

  // Check for single-segment 100%
  const full = segments.find((s) => s.value === total && s.value > 0);
  let arcs = [];
  if (full) {
    arcs = [{ ...full, dash: circumference, gap: 0, rotation: -90 }];
  } else {
    let offset = 0;
    arcs = segments
      .filter((s) => s.value > 0)
      .map((seg) => {
        const frac = seg.value / total;
        const dash = circumference * frac;
        const gap = circumference - dash;
        const rotation = (offset / total) * 360 - 90;
        offset += seg.value;
        return { ...seg, dash, gap, rotation };
      });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={theme.border} strokeWidth={strokeW} opacity={0.1} />

        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeW}
            strokeDasharray={`${arc.dash} ${arc.gap}`}
            strokeLinecap="butt"
            transform={`rotate(${arc.rotation} ${cx} ${cy})`}
            style={{ transition: 'stroke-dasharray 0.5s ease' }}
          />
        ))}

        {/* Center percentage */}
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          dominantBaseline="central"
          fill={theme.textPrimary}
          fontSize={22}
          fontWeight={700}
        >
          {pct}%
        </text>
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          dominantBaseline="central"
          fill={theme.textTertiary}
          fontSize={9}
          fontWeight={400}
        >
          complete
        </text>
      </svg>

      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: 16,
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {segments.filter((s) => s.value > 0).map((seg) => (
          <div key={seg.label} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: seg.color,
              flexShrink: 0,
            }} />
            <span style={{
              fontSize: theme.font.bodySmall,
              color: theme.textSecondary,
            }}>
              {seg.label} ({seg.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
