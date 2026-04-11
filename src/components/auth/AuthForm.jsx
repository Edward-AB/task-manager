import { useTheme } from '../../hooks/useTheme.js';
import logoLight from '../../assets/logo-light.png';
import logoDark from '../../assets/logo-dark.png';

export default function AuthForm({ title, children, footer }) {
  const { theme, themeMode } = useTheme();
  const logo = themeMode === 'dark' ? logoDark : logoLight;

  const wrapperStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
    padding: '40px 16px',
  };

  const cardStyle = {
    width: '100%',
    maxWidth: 400,
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: theme.radius.xl,
    boxShadow: theme.shadow.lg,
    padding: '32px',
  };

  const logoStyle = {
    display: 'block',
    height: 28,
    margin: '0 auto 24px',
  };

  const titleStyle = {
    fontSize: theme.font.headingLg,
    fontWeight: 700,
    color: theme.textPrimary,
    textAlign: 'center',
    marginBottom: '24px',
  };

  const footerStyle = {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: theme.font.bodySmall,
    color: theme.textSecondary,
  };

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        <img src={logo} alt="PineTask" style={logoStyle} />
        {title && <h1 style={titleStyle}>{title}</h1>}
        {children}
        {footer && <div style={footerStyle}>{footer}</div>}
      </div>
    </div>
  );
}
