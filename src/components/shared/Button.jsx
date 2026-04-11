import { useState, useCallback } from 'react';
import { useTheme } from '../../hooks/useTheme.js';

const VARIANTS = {
  primary: (t) => ({
    background: t.accentBtn,
    color: t.accentBtnText,
    border: '1.5px solid transparent',
  }),
  secondary: (t) => ({
    background: 'transparent',
    color: t.textPrimary,
    border: `1.5px solid ${t.border}`,
  }),
  danger: (t) => ({
    background: t.dangerBg,
    color: t.danger,
    border: `1.5px solid ${t.danger}`,
  }),
  ghost: (t) => ({
    background: 'transparent',
    color: t.textSecondary,
    border: '1.5px solid transparent',
  }),
};

const SIZES = {
  sm: { padding: '5px 12px', fontSize: '12px' },
  md: { padding: '8px 18px', fontSize: '13px' },
};

export default function Button({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  style,
  ...rest
}) {
  const { theme } = useTheme();
  const [pressed, setPressed] = useState(false);

  const variantStyles = (VARIANTS[variant] || VARIANTS.primary)(theme);
  const sizeStyles = SIZES[size] || SIZES.md;

  const handleMouseDown = useCallback(() => setPressed(true), []);
  const handleMouseUp = useCallback(() => setPressed(false), []);

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    borderRadius: theme.radius.md,
    fontWeight: 600,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: `all ${theme.transition}`,
    transform: pressed && !disabled ? 'scale(0.97)' : 'scale(1)',
    outline: 'none',
    whiteSpace: 'nowrap',
    lineHeight: 1.4,
    fontFamily: 'inherit',
    ...variantStyles,
    ...sizeStyles,
    ...style,
  };

  return (
    <button
      style={baseStyle}
      onClick={!disabled && !loading ? onClick : undefined}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Spinner color={variantStyles.color} />}
      {children}
    </button>
  );
}

function Spinner({ color }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 14,
        height: 14,
        border: `2px solid ${color}`,
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'btn-spin 0.6s linear infinite',
      }}
    >
      <style>{`@keyframes btn-spin { to { transform: rotate(360deg); } }`}</style>
    </span>
  );
}
