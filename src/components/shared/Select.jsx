import { useState, useCallback } from 'react';
import { useTheme } from '../../hooks/useTheme.js';

export default function Select({ value, onChange, options = [], placeholder, style, ...rest }) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);

  const handleFocus = useCallback(() => setFocused(true), []);
  const handleBlur = useCallback(() => setFocused(false), []);

  const selectStyle = {
    width: '100%',
    padding: '8px 32px 8px 12px',
    fontSize: theme.font.body,
    fontFamily: 'inherit',
    color: theme.textPrimary,
    background: theme.surface,
    border: `1.5px solid ${focused ? theme.borderFocus : theme.border}`,
    borderRadius: theme.radius.md,
    outline: 'none',
    appearance: 'none',
    cursor: 'pointer',
    transition: `border-color ${theme.transition}`,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0l5 6 5-6z' fill='${encodeURIComponent(theme.textTertiary)}'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    boxSizing: 'border-box',
    ...style,
  };

  return (
    <select
      value={value}
      onChange={onChange}
      style={selectStyle}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...rest}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
