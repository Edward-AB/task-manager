import { useEffect, useState } from 'react';
import { useTheme } from '../../hooks/useTheme.js';

const TYPE_STYLES = (theme) => ({
  success: { background: theme.successBg, color: theme.success, borderColor: theme.success },
  error: { background: theme.dangerBg, color: theme.danger, borderColor: theme.danger },
  info: { background: theme.accentBg, color: theme.accentText, borderColor: theme.accentBorder },
});

export default function Toast({ message, type = 'info', onClose }) {
  const { theme } = useTheme();
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setExiting(true), 2700);
    const removeTimer = setTimeout(() => onClose?.(), 3000);
    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, [onClose]);

  const typeStyle = TYPE_STYLES(theme)[type] || TYPE_STYLES(theme).info;

  const toastStyle = {
    position: 'fixed',
    top: 68,
    right: 20,
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 18px',
    borderRadius: theme.radius.md,
    border: `1px solid ${typeStyle.borderColor}`,
    background: typeStyle.background,
    color: typeStyle.color,
    fontSize: theme.font.body,
    fontWeight: 500,
    boxShadow: theme.shadow.lg,
    animation: exiting ? 'toast-out 0.3s ease forwards' : 'toast-in 0.3s ease',
    maxWidth: 380,
  };

  const closeStyle = {
    background: 'none',
    border: 'none',
    color: typeStyle.color,
    cursor: 'pointer',
    fontSize: '16px',
    padding: '0 0 0 8px',
    lineHeight: 1,
    opacity: 0.7,
  };

  return (
    <div style={toastStyle}>
      <style>{`
        @keyframes toast-in { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes toast-out { from { transform: translateX(0); opacity: 1; } to { transform: translateX(120%); opacity: 0; } }
      `}</style>
      <span>{message}</span>
      <button style={closeStyle} onClick={onClose} aria-label="Close">
        &times;
      </button>
    </div>
  );
}
