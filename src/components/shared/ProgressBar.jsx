import { useTheme } from '../../hooks/useTheme.js';

export default function ProgressBar({ value = 0, color, style }) {
  const { theme } = useTheme();
  const c = color || theme.accent;
  const clamped = Math.min(100, Math.max(0, value));

  const trackStyle = {
    width: '100%',
    height: 6,
    background: theme.bgTertiary,
    borderRadius: theme.radius.full,
    overflow: 'hidden',
    ...style,
  };

  const fillStyle = {
    width: `${clamped}%`,
    height: '100%',
    background: c,
    borderRadius: theme.radius.full,
    transition: `width 0.4s ease`,
  };

  return (
    <div style={trackStyle}>
      <div style={fillStyle} />
    </div>
  );
}
