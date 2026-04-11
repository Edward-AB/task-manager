import { useTheme } from '../../hooks/useTheme.js';

export default function StatsGrid({ total, done, left, scheduled }) {
  const { theme } = useTheme();

  const items = [
    { label: 'Total', value: total, color: theme.textPrimary },
    { label: 'Done', value: done, color: theme.success },
    { label: 'Remaining', value: left, color: theme.textSecondary },
    { label: 'Scheduled', value: scheduled, color: theme.accent },
  ];

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
  };

  const cellStyle = {
    padding: '10px 12px',
    borderRadius: theme.radius.md,
    background: theme.bgTertiary,
    textAlign: 'center',
  };

  const valueStyle = (color) => ({
    fontSize: theme.font.headingLg,
    fontWeight: 700,
    color,
    lineHeight: 1.2,
  });

  const labelStyle = {
    fontSize: theme.font.label,
    color: theme.textTertiary,
    fontWeight: 500,
    marginTop: 2,
  };

  return (
    <div style={gridStyle}>
      {items.map((item) => (
        <div key={item.label} style={cellStyle}>
          <div style={valueStyle(item.color)}>{item.value}</div>
          <div style={labelStyle}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}
