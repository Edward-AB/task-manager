import { useTheme } from '../../hooks/useTheme.js';

export default function DateSeparator({ label }) {
  const { theme } = useTheme();
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 0',
    }}>
      <div style={{ flex: 1, height: 0.5, background: theme.borderLight }} />
      <span style={{ fontSize: 10, color: theme.textTertiary, letterSpacing: '0.05em' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 0.5, background: theme.borderLight }} />
    </div>
  );
}
