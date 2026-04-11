import { useTheme } from '../../hooks/useTheme.js';

/**
 * Horizontal stacked bar + legend for task priority distribution.
 * Props: high, medium, low, none - task counts per priority
 */
export default function PriorityBreakdown({ high = 0, medium = 0, low = 0, none = 0 }) {
  const { theme } = useTheme();

  const total = high + medium + low + none;

  const segments = [
    { label: 'High', count: high, color: theme.chartHigh },
    { label: 'Medium', count: medium, color: theme.chartMedium },
    { label: 'Low', count: low, color: theme.chartLow },
    { label: 'None', count: none, color: theme.chartNone },
  ];

  if (total === 0) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 32, color: theme.textTertiary, fontSize: theme.font.body,
      }}>
        No tasks
      </div>
    );
  }

  const barH = 24;

  return (
    <div>
      {/* Stacked bar */}
      <div style={{
        display: 'flex',
        height: barH,
        borderRadius: theme.radius.md,
        overflow: 'hidden',
        background: theme.bgTertiary,
      }}>
        {segments.map((seg) => {
          if (seg.count === 0) return null;
          const pct = (seg.count / total) * 100;
          return (
            <div
              key={seg.label}
              title={`${seg.label}: ${seg.count} (${Math.round(pct)}%)`}
              style={{
                width: `${pct}%`,
                background: seg.color,
                height: '100%',
                transition: `width 0.4s ease`,
                minWidth: seg.count > 0 ? 4 : 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {pct > 12 && (
                <span style={{
                  fontSize: theme.font.label,
                  color: '#fff',
                  fontWeight: 600,
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  whiteSpace: 'nowrap',
                }}>
                  {Math.round(pct)}%
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: 20,
        flexWrap: 'wrap',
        marginTop: 16,
      }}>
        {segments.map((seg) => (
          <div key={seg.label} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: seg.color,
              flexShrink: 0,
            }} />
            <span style={{
              fontSize: theme.font.body,
              color: theme.textSecondary,
            }}>
              {seg.label}: {seg.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
