import { useTheme } from '../../hooks/useTheme.js';

/**
 * Filled pie chart for task breakdown (matches v1 PieDt design).
 * segments: [{ value, color, label }]
 */
export default function PieChart({ segments, size = 108, centerCount }) {
  const { theme } = useTheme();
  const R = 44, cx = 54, cy = 54;

  const total = segments.reduce((s, seg) => s + seg.value, 0);

  if (total === 0) {
    return (
      <div style={{ fontSize: 12, color: theme.textTertiary, textAlign: 'center', padding: '16px 0' }}>
        No tasks yet
      </div>
    );
  }

  const sd = segments.filter((s) => s.value > 0);
  let paths = [];

  if (sd.length === 1) {
    paths = [{ ...sd[0], circle: true }];
  } else {
    let angle = -Math.PI / 2;
    sd.forEach((s) => {
      const sw = (s.value / total) * 2 * Math.PI;
      const x1 = cx + R * Math.cos(angle);
      const y1 = cy + R * Math.sin(angle);
      angle += sw;
      const x2 = cx + R * Math.cos(angle);
      const y2 = cy + R * Math.sin(angle);
      paths.push({
        ...s,
        d: `M${cx},${cy} L${x1},${y1} A${R},${R},0,${sw > Math.PI ? 1 : 0},1,${x2},${y2} Z`,
        circle: false,
      });
    });
  }

  return (
    <svg width={108} height={108} viewBox="0 0 108 108" style={{ flexShrink: 0 }}>
      {paths.map((p, i) =>
        p.circle
          ? <circle key={i} cx={cx} cy={cy} r={R} fill={p.color} />
          : <path key={i} d={p.d} fill={p.color} stroke="#fff" strokeWidth={0.5} />
      )}
      <circle cx={cx} cy={cy} r={27} fill={theme.bg} />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={17} fontWeight="500" fill={theme.textPrimary}>
        {centerCount ?? total}
      </text>
      <text x={cx} y={cy + 9} textAnchor="middle" fontSize={10} fill={theme.textSecondary}>
        tasks
      </text>
    </svg>
  );
}
