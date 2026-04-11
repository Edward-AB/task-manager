import { Link } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme.js';
import logoLight from '../../assets/logo-light.png';
import logoDark from '../../assets/logo-dark.png';
import Tooltip from '../shared/Tooltip.jsx';

export default function PublicLayout({ children }) {
  const { theme, themeMode, toggleTheme } = useTheme();
  const logo = themeMode === 'dark' ? logoDark : logoLight;

  const layoutStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: theme.bg,
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    borderBottom: `1px solid ${theme.borderLight}`,
  };

  const logoStyle = {
    height: 24,
    display: 'block',
  };

  const rightStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const linkStyle = {
    fontSize: theme.font.body,
    fontWeight: 600,
    color: theme.textPrimary,
    textDecoration: 'none',
    padding: '6px 14px',
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.border}`,
    transition: `all ${theme.transition}`,
  };

  const signUpStyle = {
    ...linkStyle,
    background: theme.accentBtn,
    color: theme.accentBtnText,
    border: `1px solid transparent`,
  };

  const iconBtnStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
    border: 'none',
    background: 'transparent',
    borderRadius: theme.radius.sm,
    cursor: 'pointer',
    color: theme.textSecondary,
    fontSize: '16px',
  };

  const ThemeIcon = () =>
    themeMode === 'dark' ? (
      <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
        <circle cx={8} cy={8} r={4} stroke="currentColor" strokeWidth={1.5} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
          const rad = (a * Math.PI) / 180;
          return (
            <line
              key={a}
              x1={8 + Math.cos(rad) * 5.5}
              y1={8 + Math.sin(rad) * 5.5}
              x2={8 + Math.cos(rad) * 7}
              y2={8 + Math.sin(rad) * 7}
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    ) : (
      <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
        <path
          d="M13.5 9.5A5.5 5.5 0 016.5 2.5 5.5 5.5 0 1013.5 9.5z"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      </svg>
    );

  const mainStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div style={layoutStyle}>
      <header style={headerStyle}>
        <Link to="/">
          <img src={logo} alt="PineTask" style={logoStyle} />
        </Link>
        <div style={rightStyle}>
          <Tooltip text={themeMode === 'dark' ? 'Light mode' : 'Dark mode'}>
            <button style={iconBtnStyle} onClick={toggleTheme} aria-label="Toggle theme">
              <ThemeIcon />
            </button>
          </Tooltip>
          <Link to="/login" style={linkStyle}>
            Sign in
          </Link>
          <Link to="/signup" style={signUpStyle}>
            Sign up
          </Link>
        </div>
      </header>
      <main style={mainStyle}>{children}</main>
    </div>
  );
}
