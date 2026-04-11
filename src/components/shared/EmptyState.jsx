import { useTheme } from '../../hooks/useTheme.js';

export default function EmptyState({ icon = '', title, description }) {
  const { theme } = useTheme();

  const wrapperStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    textAlign: 'center',
  };

  const iconStyle = {
    fontSize: '36px',
    marginBottom: '12px',
  };

  const titleStyle = {
    fontSize: theme.font.heading,
    fontWeight: 600,
    color: theme.textSecondary,
    marginBottom: '6px',
  };

  const descStyle = {
    fontSize: theme.font.body,
    color: theme.textTertiary,
    maxWidth: 320,
    lineHeight: 1.5,
  };

  return (
    <div style={wrapperStyle}>
      {icon && <div style={iconStyle}>{icon}</div>}
      {title && <div style={titleStyle}>{title}</div>}
      {description && <div style={descStyle}>{description}</div>}
    </div>
  );
}
