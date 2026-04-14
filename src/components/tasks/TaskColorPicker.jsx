import { useTheme } from '../../hooks/useTheme.js';

export default function TaskColorPicker({ value, onChange }) {
  const { theme } = useTheme();

  return (
    <div style={{ display: 'flex', gap: 5 }}>
      {theme.taskColor.map(c => (
        <button key={c.id} type="button" onClick={() => onChange(c.id)} style={{
          flex: 1, height: 28, borderRadius: 20, background: c.bg,
          border: value === c.id ? `1.5px solid ${c.border}` : `1.5px solid ${c.border}88`,
          boxShadow: value === c.id ? '0 0 0 2px ' + c.border : 'none',
          cursor: 'pointer', padding: 0, minWidth: 0,
          transition: 'transform 150ms',
          transform: value === c.id ? 'scale(1.05)' : 'scale(1)',
        }} />
      ))}
    </div>
  );
}
