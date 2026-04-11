import { useTheme } from '../../hooks/useTheme.js';
import PieChart from './PieChart.jsx';
import StatsGrid from './StatsGrid.jsx';

export default function OverviewCard({ tasks }) {
  const { theme } = useTheme();

  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const left = total - done;
  const scheduled = tasks.filter((t) => t.slot != null).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  // Remaining tasks by priority
  const remaining = tasks.filter((t) => !t.done);
  const highCount = remaining.filter((t) => t.priority === 'high').length;
  const medCount = remaining.filter((t) => t.priority === 'medium').length;
  const lowCount = remaining.filter((t) => t.priority === 'low').length;

  const segments = [
    { value: done, color: theme.chartDone, label: 'Done' },
    { value: highCount, color: theme.chartHigh, label: 'High' },
    { value: medCount, color: theme.chartMedium, label: 'Medium' },
    { value: lowCount, color: theme.chartLow, label: 'Low' },
  ];

  const cardStyle = {
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: theme.radius.lg,
    padding: '20px',
  };

  const titleStyle = {
    fontSize: theme.font.label,
    fontWeight: 500,
    color: theme.textTertiary,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 14,
  };

  const chartRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  };

  const legendStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    flex: 1,
  };

  const legendItem = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: theme.font.bodySmall,
    color: theme.textSecondary,
  };

  const legendDot = (color) => ({
    width: 8,
    height: 8,
    borderRadius: 2,
    background: color,
    flexShrink: 0,
  });

  const progressText = {
    fontSize: theme.font.bodySmall,
    color: theme.textTertiary,
    marginBottom: 6,
    textAlign: 'center',
  };

  const trackStyle = {
    width: '100%',
    height: 5,
    background: theme.bgTertiary,
    borderRadius: theme.radius.full,
    overflow: 'hidden',
    marginBottom: 16,
  };

  const fillStyle = {
    width: `${pct}%`,
    height: '100%',
    background: theme.accent,
    borderRadius: theme.radius.full,
    transition: 'width 0.4s ease',
  };

  return (
    <div style={cardStyle}>
      <div style={titleStyle}>OVERVIEW</div>
      <div style={chartRowStyle}>
        <PieChart segments={segments} />
        <div style={legendStyle}>
          {segments.filter((s) => s.value > 0).map((s) => (
            <div key={s.label} style={legendItem}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={legendDot(s.color)} />
                {s.label}
              </span>
              <span style={{ fontWeight: 600, color: theme.textPrimary }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={progressText}>{pct}% complete</div>
      <div style={trackStyle}>
        <div style={fillStyle} />
      </div>
      <StatsGrid total={total} done={done} left={left} scheduled={scheduled} />
    </div>
  );
}
