import { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme.js';

/**
 * 30-day SVG bar chart for daily task completions.
 * Props: dailyCounts - array of { date, count }
 */
export default function ProductivityChart({ dailyCounts = [] }) {
  const { theme } = useTheme();
  const [animating, setAnimating] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setAnimating(false), 50);
    return () => clearTimeout(id);
  }, []);

  if (dailyCounts.length === 0) {
    return (
      <p style={{ color: theme.textTertiary, textAlign: 'center', padding: 32, fontSize: theme.font.body }}>
        Complete some tasks to see your chart
      </p>
    );
  }

  const maxCount = Math.max(...dailyCounts.map((d) => d.count), 1);
  // Round up y-axis max to a nice number
  const yMax = maxCount <= 5 ? 5 : Math.ceil(maxCount / 5) * 5;
  const yTicks = [];
  const tickCount = Math.min(5, yMax);
  for (let i = 0; i <= tickCount; i++) {
    yTicks.push(Math.round((yMax / tickCount) * i));
  }

  const padding = { top: 12, right: 12, bottom: 32, left: 32 };
  const chartW = 600;
  const chartH = 180;
  const plotW = chartW - padding.left - padding.right;
  const plotH = chartH - padding.top - padding.bottom;
  const barGap = 2;
  const barW = Math.max(2, (plotW - barGap * (dailyCounts.length - 1)) / dailyCounts.length);

  const [hovered, setHovered] = useState(null);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <svg
        viewBox={`0 0 ${chartW} ${chartH}`}
        width="100%"
        height="auto"
        style={{ display: 'block' }}
      >
        {/* Y-axis ticks and grid lines */}
        {yTicks.map((tick) => {
          const y = padding.top + plotH - (tick / yMax) * plotH;
          return (
            <g key={tick}>
              <line
                x1={padding.left}
                x2={chartW - padding.right}
                y1={y}
                y2={y}
                stroke={theme.border}
                strokeWidth={0.5}
                opacity={0.5}
              />
              <text
                x={padding.left - 6}
                y={y}
                textAnchor="end"
                dominantBaseline="central"
                fill={theme.textTertiary}
                fontSize={8}
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {dailyCounts.map((d, i) => {
          const barH = (d.count / yMax) * plotH;
          const x = padding.left + i * (barW + barGap);
          const y = padding.top + plotH - barH;
          const isHovered = hovered === i;

          return (
            <g key={i}>
              {/* Invisible wider hit area */}
              <rect
                x={x - 1}
                y={padding.top}
                width={barW + 2}
                height={plotH}
                fill="transparent"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
              <rect
                x={x}
                y={animating ? padding.top + plotH : y}
                width={barW}
                height={animating ? 0 : Math.max(barH, d.count > 0 ? 2 : 0)}
                rx={Math.min(2, barW / 2)}
                fill={d.count > 0 ? theme.accent : theme.border}
                opacity={d.count > 0 ? (isHovered ? 1 : 0.85) : 0.25}
                style={{ transition: `y 600ms ease ${i * 12}ms, height 600ms ease ${i * 12}ms, opacity ${theme.transition}` }}
              />
            </g>
          );
        })}

        {/* X-axis labels - every 5th day */}
        {dailyCounts.map((d, i) => {
          if (i % 5 !== 0 && i !== dailyCounts.length - 1) return null;
          const x = padding.left + i * (barW + barGap) + barW / 2;
          return (
            <text
              key={`label-${i}`}
              x={x}
              y={chartH - 4}
              textAnchor="middle"
              fill={theme.textTertiary}
              fontSize={7}
            >
              {formatDate(d.date)}
            </text>
          );
        })}

        {/* Tooltip */}
        {hovered !== null && (() => {
          const d = dailyCounts[hovered];
          const x = padding.left + hovered * (barW + barGap) + barW / 2;
          const barH = (d.count / yMax) * plotH;
          const y = padding.top + plotH - barH - 8;
          const text = `${formatDate(d.date)}: ${d.count}`;
          const tipW = text.length * 5.5 + 12;
          const tipX = Math.min(Math.max(tipW / 2 + 2, x), chartW - tipW / 2 - 2);

          return (
            <g>
              <rect
                x={tipX - tipW / 2}
                y={Math.max(2, y - 10)}
                width={tipW}
                height={16}
                rx={4}
                fill={theme.textPrimary}
                opacity={0.9}
              />
              <text
                x={tipX}
                y={Math.max(2, y - 10) + 8.5}
                textAnchor="middle"
                dominantBaseline="central"
                fill={theme.bg}
                fontSize={7.5}
                fontWeight={500}
              >
                {text}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
