import { useTheme } from '../../hooks/useTheme.js';

export default function Badge({ children, color, style }) {
  const { theme } = useTheme();
  const c = color || theme.accent;

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    fontSize: theme.font.label,
    fontWeight: 600,
    color: c,
    background: `${c}18`,
    border: `1px solid ${c}40`,
    borderRadius: theme.radius.full,
    lineHeight: 1.5,
    whiteSpace: 'nowrap',
    ...style,
  };

  return <span style={badgeStyle}>{children}</span>;
}
