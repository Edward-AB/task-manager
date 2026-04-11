import { useTheme } from '../../hooks/useTheme.js';

const LABELS = { high: 'High', medium: 'Med', low: 'Low' };

export default function PriorityTag({ priority }) {
  const { theme } = useTheme();

  if (!priority || !theme.priority[priority]) return null;

  const p = theme.priority[priority];

  const tagStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '2px 8px',
    fontSize: theme.font.label,
    fontWeight: 600,
    color: p.text,
    background: p.bg,
    border: `1px solid ${p.border}`,
    borderRadius: theme.radius.full,
    lineHeight: 1.5,
    whiteSpace: 'nowrap',
  };

  const dotStyle = {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: p.dot,
    flexShrink: 0,
  };

  return (
    <span style={tagStyle}>
      <span style={dotStyle} />
      {LABELS[priority] || priority}
    </span>
  );
}
