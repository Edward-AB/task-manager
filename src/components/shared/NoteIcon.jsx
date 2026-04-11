import { useTheme } from '../../hooks/useTheme.js';

export default function NoteIcon({ has = false, color, size = 12 }) {
  const { theme } = useTheme();
  const c = color || theme.textTertiary;

  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      {/* Notepad body */}
      <rect
        x={2}
        y={1}
        width={12}
        height={14}
        rx={2}
        stroke={c}
        strokeWidth={1.5}
        fill={has ? `${c}30` : 'none'}
      />
      {/* Lines */}
      <line x1={5} y1={5} x2={11} y2={5} stroke={c} strokeWidth={1} opacity={0.6} />
      <line x1={5} y1={8} x2={11} y2={8} stroke={c} strokeWidth={1} opacity={0.6} />
      <line x1={5} y1={11} x2={9} y2={11} stroke={c} strokeWidth={1} opacity={0.6} />
    </svg>
  );
}
