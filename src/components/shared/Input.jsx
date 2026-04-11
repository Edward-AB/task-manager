import { useState, useCallback } from 'react';
import { useTheme } from '../../hooks/useTheme.js';

export default function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  style,
  ...rest
}) {
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
    border: `1.5px solid ${error ? theme.danger : focused ? theme.borderFocus : theme.border}`,
    borderRadius: theme.radius.md,
    outline: 'none',
    transition: `border-color ${theme.transition}`,
    boxSizing: 'border-box',
    ...style,
  };

  const errorStyle = {
    color: theme.danger,
    fontSize: theme.font.bodySmall,
    marginTop: '4px',
  };

  return (
    <div style={{ width: '100%' }}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={inputStyle}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...rest}
      />
      {error && <div style={errorStyle}>{error}</div>}
    </div>
  );
}
