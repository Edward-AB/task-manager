import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme.js';
import Tooltip from '../shared/Tooltip.jsx';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '\u25A6' },
  { to: '/projects', label: 'Projects', icon: '\u25CB' },
  { to: '/analytics', label: 'Analytics', icon: '\u25B3' },
  { to: '/settings', label: 'Settings', icon: '\u2699' },
  { to: '/help', label: 'Help', icon: '?' },
];

const COLLAPSED_WIDTH = 54;
const EXPANDED_WIDTH = 220;

export default function Sidebar({ collapsed, onToggle }) {
  const { theme } = useTheme();
  const location = useLocation();
  const width = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  const sidebarStyle = {
    position: 'fixed',
    top: 52,
    left: 0,
    bottom: 0,
    width,
    background: theme.bgSecondary,
    borderRight: `1px solid ${theme.border}`,
    padding: collapsed ? '16px 6px' : '16px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    overflowY: 'auto',
    overflowX: 'hidden',
    zIndex: 800,
    transition: 'width 200ms ease, padding 200ms ease',
  };

  const linkStyle = (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: collapsed ? 0 : '10px',
    justifyContent: collapsed ? 'center' : 'flex-start',
    padding: collapsed ? '8px 0' : '8px 12px',
    fontSize: theme.font.body,
    fontWeight: active ? 600 : 500,
    color: active ? theme.accentText : theme.textSecondary,
    background: active ? theme.accentBg : 'transparent',
    border: active ? `1px solid ${theme.accentBorder}` : '1px solid transparent',
    borderRadius: theme.radius.md,
    textDecoration: 'none',
    transition: `all ${theme.transition}`,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  });

  const iconStyle = {
    width: 20,
    textAlign: 'center',
    fontSize: '14px',
    flexShrink: 0,
  };

  const toggleStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    padding: '8px 0',
    border: 'none',
    background: 'transparent',
    color: theme.textTertiary,
    cursor: 'pointer',
    fontSize: '14px',
    borderRadius: theme.radius.sm,
    fontFamily: 'inherit',
  };

  return (
    <aside style={sidebarStyle}>
      {NAV_ITEMS.map(({ to, label, icon }) => {
        const link = (
          <Link key={to} to={to} style={linkStyle(location.pathname.startsWith(to))}>
            <span style={iconStyle}>{icon}</span>
            {!collapsed && label}
          </Link>
        );
        return collapsed ? (
          <Tooltip key={to} text={label}>
            {link}
          </Tooltip>
        ) : link;
      })}
      <button style={toggleStyle} onClick={onToggle} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
        {collapsed ? '\u276F' : '\u276E'}
      </button>
    </aside>
  );
}

export { COLLAPSED_WIDTH, EXPANDED_WIDTH };
