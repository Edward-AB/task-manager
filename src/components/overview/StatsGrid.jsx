import { useTheme } from '../../hooks/useTheme.js';

export default function StatsGrid({ total, done, left, scheduled }) {
  const { theme } = useTheme();

  const items = [
    { label: 'Total', value: total },
    { label: 'Done', value: done },
    { label: 'Remaining', value: left },
    { label: 'Scheduled', value: scheduled },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginTop: 14 }}>
      {items.map((item) => (
        <div key={item.label} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '5px 10px', borderRadius: theme.radius.sm,
          border: `0.5px solid ${theme.border}`, background: theme.bg, gap: 6,
        }}>
          <span style={{ fontSize: 10, color: theme.textTertiary }}>
            {item.label}
          </span>
          <span style={{ fontSize: 15, fontWeight: 500, color: theme.textPrimary }}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
