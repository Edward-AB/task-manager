import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme.js';
import logoLight from '../../assets/logo-light.png';
import logoDark from '../../assets/logo-dark.png';
import ProfileDropdown from './ProfileDropdown.jsx';
import Tooltip from '../shared/Tooltip.jsx';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/projects', label: 'Projects' },
  { to: '/analytics', label: 'Analytics' },
];

export default function Header() {
  const { theme, themeMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);

  const logo = themeMode === 'dark' ? logoDark : logoLight;

  const headerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: 52,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    background: theme.headerBg,
    borderBottom: `1px solid ${theme.headerBorder}`,
    zIndex: 900,
  };

  const leftStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  };

  const logoStyle = {
    height: 26,
    display: 'block',
  };

  const navStyle = {
    display: 'flex',
    gap: '4px',
  };

  const linkStyle = (active) => ({
    padding: '6px 12px',
    fontSize: theme.font.body,
    fontWeight: active ? 600 : 500,
    color: active ? theme.accent : theme.headerText,
    textDecoration: 'none',
    borderRadius: theme.radius.sm,
    background: active ? `${theme.accent}15` : 'transparent',
    transition: `all ${theme.transition}`,
  });

  const rightStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
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
    color: theme.headerText,
    fontSize: '16px',
    transition: `background ${theme.transition}`,
  };

  const profileBtnStyle = {
    ...iconBtnStyle,
    width: 30,
    height: 30,
    borderRadius: theme.radius.full,
    background: theme.accent,
    color: theme.accentBtnText,
    fontSize: '12px',
    fontWeight: 700,
    position: 'relative',
  };

  // Sun / moon icon via SVG for crisp rendering
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

  return (
    <header style={headerStyle}>
      <div style={leftStyle}>
        <Link to="/dashboard">
          <img src={logo} alt="PineTask" style={logoStyle} />
        </Link>
        <nav style={navStyle}>
          {NAV_LINKS.map(({ to, label }) => (
            <Link key={to} to={to} style={linkStyle(location.pathname.startsWith(to))}>
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <div style={rightStyle}>
        {/* Timer placeholder slot */}
        <div id="timer-slot" />

        <Tooltip text={themeMode === 'dark' ? 'Light mode' : 'Dark mode'}>
          <button style={iconBtnStyle} onClick={toggleTheme} aria-label="Toggle theme">
            <ThemeIcon />
          </button>
        </Tooltip>

        <div style={{ position: 'relative' }}>
          <button
            style={profileBtnStyle}
            onClick={() => setProfileOpen((o) => !o)}
            aria-label="Profile menu"
          >
            P
          </button>
          {profileOpen && <ProfileDropdown onClose={() => setProfileOpen(false)} />}
        </div>
      </div>
    </header>
  );
}
