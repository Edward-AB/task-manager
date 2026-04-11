import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme.js';
import { useAuth } from '../../hooks/useAuth.js';

const LINKS = [
  { to: '/account', label: 'Account' },
  { to: '/settings', label: 'Settings' },
  { to: '/help', label: 'Help' },
  { to: '/changelog', label: 'Changelog' },
];

export default function ProfileDropdown({ onClose }) {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const dropdownStyle = {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 8,
    width: 200,
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: theme.radius.lg,
    boxShadow: theme.shadow.lg,
    padding: '6px',
    zIndex: 1000,
    animation: 'dropdown-in 0.15s ease',
  };

  const userStyle = {
    padding: '10px 12px',
    fontSize: theme.font.bodySmall,
    color: theme.textSecondary,
    borderBottom: `1px solid ${theme.borderLight}`,
    marginBottom: 4,
    fontWeight: 600,
  };

  const itemStyle = {
    display: 'block',
    padding: '8px 12px',
    fontSize: theme.font.body,
    color: theme.textPrimary,
    textDecoration: 'none',
    borderRadius: theme.radius.sm,
    transition: `background ${theme.transition}`,
  };

  const logoutStyle = {
    ...itemStyle,
    color: theme.danger,
    border: 'none',
    background: 'none',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer',
    fontFamily: 'inherit',
    borderTop: `1px solid ${theme.borderLight}`,
    marginTop: 4,
    paddingTop: 10,
    borderRadius: 0,
  };

  const handleLogout = () => {
    logout();
    onClose?.();
  };

  return (
    <div ref={ref} style={dropdownStyle}>
      <style>{`@keyframes dropdown-in { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <div style={userStyle}>{user?.username || user?.email || 'User'}</div>
      {LINKS.map(({ to, label }) => (
        <Link key={to} to={to} style={itemStyle} onClick={onClose}>
          {label}
        </Link>
      ))}
      {user?.is_admin && (
        <Link to="/admin" style={itemStyle} onClick={onClose}>
          Admin
        </Link>
      )}
      <button style={logoutStyle} onClick={handleLogout}>
        Log out
      </button>
    </div>
  );
}
