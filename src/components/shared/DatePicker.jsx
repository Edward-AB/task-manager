import { useState, useCallback } from 'react';
import { useTheme } from '../../hooks/useTheme.js';

export default function DatePicker({ value, onChange, min, max, style, ...rest }) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);

  const handleFocus = useCallback(() => setFocused(true), []);
  const handleBlur = useCallback(() => setFocused(false), []);

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    fontSize: theme.font.body,
    fontFamily: 'inherit',
    color: theme.textPrimary,
    background: theme.surface,
    border: `1.5px solid ${focused ? theme.borderFocus : theme.border}`,
    borderRadius: theme.radius.md,
    outline: 'none',
    transition: `border-color ${theme.transition}`,
    boxSizing: 'border-box',
    ...style,
  };

  return (
    <input
      type="date"
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      style={inputStyle}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...rest}
    />
  );
}
