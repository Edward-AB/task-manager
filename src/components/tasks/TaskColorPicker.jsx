import { useTheme } from '../../hooks/useTheme.js';

export default function TaskColorPicker({ value, onChange }) {
  const { theme } = useTheme();

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {theme.taskColor.map(c => (
        <button key={c.id} type="button" onClick={() => onChange(c.id)} style={{
          width: 32, height: 32, borderRadius: theme.radius.sm, background: c.bg,
          border: value === c.id ? `2px solid ${theme.textPrimary}` : `1.5px solid ${c.border}`,
          cursor: 'pointer', padding: 0,
          transition: 'transform 150ms',
          transform: value === c.id ? 'scale(1.1)' : 'scale(1)',
        }} />
      ))}
    </div>
  );
}
