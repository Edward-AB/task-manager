import { useTheme } from '../../hooks/useTheme.js';
import PieChart from './PieChart.jsx';
import StatsGrid from './StatsGrid.jsx';

export default function OverviewCard({ tasks, embedded }) {
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
  const noneCount = remaining.filter((t) => !t.priority).length;

  const segments = [
    { value: done, color: theme.chartDone, label: 'Done' },
    { value: highCount, color: theme.chartHigh, label: 'High' },
    { value: medCount, color: theme.chartMedium, label: 'Medium' },
    { value: lowCount, color: theme.chartLow, label: 'Low' },
    { value: noneCount, color: theme.chartNone, label: 'None' },
  ];

  const cardStyle = {
    background: theme.bgSecondary,
    border: `0.5px solid ${theme.border}`,
    borderRadius: theme.radius.md,
    padding: '14px',
  };

  const titleStyle = {
    fontSize: theme.font.label,
    fontWeight: 500,
    color: theme.textTertiary,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 10,
  };

  const chartRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  };

  const legendStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    flex: 1,
  };

  const legendItem = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 12,
    color: theme.textSecondary,
  };

  const legendDot = (color) => ({
    width: 8,
    height: 8,
    borderRadius: 2,
    background: color,
    flexShrink: 0,
  });

  const trackStyle = {
    width: '100%',
    height: 4,
    background: theme.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 4,
  };

  const fillStyle = {
    width: `${pct}%`,
    height: '100%',
    background: '#2D9B6F',
    borderRadius: 4,
    transition: 'width 0.4s ease',
  };

  const content = (
    <>
      <div style={titleStyle}>OVERVIEW</div>
      <div style={chartRowStyle}>
        <PieChart segments={segments} size={108} centerCount={total} />
        <div style={legendStyle}>
          {segments.filter((s) => s.value > 0).map((s) => (
            <div key={s.label} style={legendItem}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={legendDot(s.color)} />
                {s.label}
              </span>
              <span style={{ fontWeight: 500, color: theme.textPrimary }}>{s.value}</span>
            </div>
          ))}
          <div style={trackStyle}>
            <div style={fillStyle} />
          </div>
          <div style={{ fontSize: 11, color: theme.textTertiary }}>{pct}% complete</div>
        </div>
      </div>
      <StatsGrid total={total} done={done} left={left} scheduled={scheduled} />
    </>
  );

  if (embedded) return content;

  return (
    <div style={cardStyle}>
      {content}
    </div>
  );
}
