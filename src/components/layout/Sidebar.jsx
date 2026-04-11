import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme.js';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '\u25A6' },
  { to: '/projects', label: 'Projects', icon: '\u25CB' },
  { to: '/analytics', label: 'Analytics', icon: '\u25B3' },
  { to: '/settings', label: 'Settings', icon: '\u2699' },
  { to: '/help', label: 'Help', icon: '?' },
];

export default function Sidebar() {
  const { theme } = useTheme();
  const location = useLocation();

  const sidebarStyle = {
    position: 'fixed',
    top: 52,
    left: 0,
    bottom: 0,
    width: 220,
    background: theme.bgSecondary,
    borderRight: `1px solid ${theme.border}`,
    padding: '16px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    overflowY: 'auto',
    zIndex: 800,
  };

  const linkStyle = (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    fontSize: theme.font.body,
    fontWeight: active ? 600 : 500,
    color: active ? theme.accentText : theme.textSecondary,
    background: active ? theme.accentBg : 'transparent',
    border: active ? `1px solid ${theme.accentBorder}` : '1px solid transparent',
    borderRadius: theme.radius.md,
    textDecoration: 'none',
    transition: `all ${theme.transition}`,
  });

  const iconStyle = {
    width: 20,
    textAlign: 'center',
    fontSize: '14px',
    flexShrink: 0,
  };

  return (
    <aside style={sidebarStyle}>
      {NAV_ITEMS.map(({ to, label, icon }) => (
        <Link key={to} to={to} style={linkStyle(location.pathname.startsWith(to))}>
          <span style={iconStyle}>{icon}</span>
          {label}
        </Link>
      ))}
    </aside>
  );
}
