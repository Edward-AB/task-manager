import { useState, useCallback } from 'react';
import { useTheme } from '../../hooks/useTheme.js';

export default function SearchInput({ value, onChange, placeholder = 'Search...', style, ...rest }) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);

  const handleFocus = useCallback(() => setFocused(true), []);
  const handleBlur = useCallback(() => setFocused(false), []);

  const wrapperStyle = {
    position: 'relative',
    width: '100%',
    ...style,
  };

  const iconStyle = {
    position: 'absolute',
    left: 10,
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px 8px 32px',
    fontSize: theme.font.body,
    fontFamily: 'inherit',
    color: theme.textPrimary,
    background: theme.surface,
    border: `1.5px solid ${focused ? theme.borderFocus : theme.border}`,
    borderRadius: theme.radius.md,
    outline: 'none',
    transition: `border-color ${theme.transition}`,
    boxSizing: 'border-box',
  };

  return (
    <div style={wrapperStyle}>
      <span style={iconStyle}>
        <svg width={14} height={14} viewBox="0 0 16 16" fill="none">
          <circle cx={7} cy={7} r={5.5} stroke={theme.textTertiary} strokeWidth={1.5} />
          <line x1={11} y1={11} x2={14.5} y2={14.5} stroke={theme.textTertiary} strokeWidth={1.5} strokeLinecap="round" />
        </svg>
      </span>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={inputStyle}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...rest}
      />
    </div>
  );
}
