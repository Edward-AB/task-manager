import { useState, useRef } from 'react';
import { useTheme } from '../../hooks/useTheme.js';

export default function Tooltip({ text, children }) {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef(null);

  const show = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setVisible(true), 400);
  };

  const hide = () => {
    clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  const wrapperStyle = {
    position: 'relative',
    display: 'inline-flex',
  };

  const tipStyle = {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginBottom: 6,
    padding: '4px 10px',
    fontSize: theme.font.bodySmall,
    fontWeight: 500,
    color: theme.surface,
    background: theme.textPrimary,
    borderRadius: theme.radius.sm,
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    opacity: visible ? 1 : 0,
    transition: `opacity 0.15s ease`,
    zIndex: 1100,
  };

  return (
    <span
      style={wrapperStyle}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {text && <span style={tipStyle}>{text}</span>}
    </span>
  );
}
