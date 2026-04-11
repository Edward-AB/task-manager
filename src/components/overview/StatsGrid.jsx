import { useTheme } from '../../hooks/useTheme.js';

export default function StatsGrid({ total, done, left, scheduled }) {
  const { theme } = useTheme();

  const items = [
    { label: 'Total', value: total, color: theme.textPrimary },
    { label: 'Done', value: done, color: theme.success },
    { label: 'Remaining', value: left, color: theme.textSecondary },
    { label: 'Scheduled', value: scheduled, color: theme.accent },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
      {items.map((item) => (
        <div key={item.label} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '6px 10px', borderRadius: theme.radius.sm,
          border: `0.5px solid ${theme.border}`, background: theme.bgTertiary,
        }}>
          <span style={{ fontSize: theme.font.bodySmall, color: theme.textSecondary, fontWeight: 500 }}>
            {item.label}
          </span>
          <span style={{ fontSize: theme.font.body, fontWeight: 600, color: item.color }}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
