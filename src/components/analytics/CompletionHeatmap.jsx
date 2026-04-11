import { useState, useMemo } from 'react';
import { useTheme } from '../../hooks/useTheme.js';

/**
 * GitHub-style contribution heatmap for task completions.
 * Props: dailyCounts - array of { date, count }
 */
export default function CompletionHeatmap({ dailyCounts = [] }) {
  const { theme } = useTheme();
  const [hovered, setHovered] = useState(null);

  const grid = useMemo(() => {
    // Build a map from date string to count
    const countMap = {};
    dailyCounts.forEach((d) => { countMap[d.date] = d.count; });

    // Generate 84 days (12 weeks) ending today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = [];
    for (let i = 83; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        date: key,
        count: countMap[key] || 0,
        dayOfWeek: d.getDay(), // 0=Sun, 6=Sat
      });
    }
    return days;
  }, [dailyCounts]);

  // Arrange into columns (weeks). Each column has 7 rows (Mon-Sun, starting Monday).
  const weeks = useMemo(() => {
    const cols = [];
    let col = [];
    grid.forEach((day) => {
      // Convert so Monday=0, Sunday=6
      const row = day.dayOfWeek === 0 ? 6 : day.dayOfWeek - 1;
      if (col.length > 0 && row === 0) {
        cols.push(col);
        col = [];
      }
      col.push({ ...day, row });
    });
    if (col.length > 0) cols.push(col);
    return cols;
  }, [grid]);

  // Month labels
  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      const firstDay = week[0];
      const month = new Date(firstDay.date + 'T00:00:00').getMonth();
      if (month !== lastMonth) {
        labels.push({
          text: new Date(firstDay.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' }),
          col: wi,
        });
        lastMonth = month;
      }
    });
    return labels;
  }, [weeks]);

  const cellSize = 12;
  const cellGap = 2;
  const labelW = 28;
  const topPad = 16;
  const svgW = labelW + weeks.length * (cellSize + cellGap);
  const svgH = topPad + 7 * (cellSize + cellGap);

  const getOpacity = (count) => {
    if (count === 0) return 0.08;
    if (count <= 2) return 0.3;
    if (count <= 4) return 0.6;
    return 1;
  };

  const dayLabels = [
    { label: 'Mon', row: 0 },
    { label: 'Wed', row: 2 },
    { label: 'Fri', row: 4 },
  ];

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${svgW} ${svgH + 36}`}
        width="100%"
        height="auto"
        style={{ display: 'block', maxWidth: svgW }}
      >
        {/* Month labels */}
        {monthLabels.map((ml, i) => (
          <text
            key={i}
            x={labelW + ml.col * (cellSize + cellGap)}
            y={10}
            fill={theme.textTertiary}
            fontSize={8}
          >
            {ml.text}
          </text>
        ))}

        {/* Day labels */}
        {dayLabels.map((dl) => (
          <text
            key={dl.label}
            x={0}
            y={topPad + dl.row * (cellSize + cellGap) + cellSize / 2 + 1}
            fill={theme.textTertiary}
            fontSize={7}
            dominantBaseline="central"
          >
            {dl.label}
          </text>
        ))}

        {/* Cells */}
        {weeks.map((week, wi) =>
          week.map((day) => {
            const x = labelW + wi * (cellSize + cellGap);
            const y = topPad + day.row * (cellSize + cellGap);
            const cellKey = `${wi}-${day.row}`;
            const isHovered = hovered === cellKey;

            return (
              <g key={cellKey}>
                <rect
                  x={x}
                  y={y}
                  width={cellSize}
                  height={cellSize}
                  rx={2}
                  fill={theme.accent}
                  opacity={getOpacity(day.count)}
                  stroke={isHovered ? theme.textSecondary : 'none'}
                  strokeWidth={isHovered ? 1 : 0}
                  onMouseEnter={() => setHovered(cellKey)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: 'default' }}
                />
                {/* Tooltip */}
                {isHovered && (() => {
                  const text = `${formatDate(day.date)}: ${day.count} task${day.count !== 1 ? 's' : ''}`;
                  const tipW = text.length * 4.5 + 14;
                  const tipX = Math.min(Math.max(tipW / 2, x + cellSize / 2), svgW - tipW / 2);
                  const tipY = y - 4;

                  return (
                    <g>
                      <rect
                        x={tipX - tipW / 2}
                        y={tipY - 14}
                        width={tipW}
                        height={14}
                        rx={3}
                        fill={theme.textPrimary}
                        opacity={0.9}
                      />
                      <text
                        x={tipX}
                        y={tipY - 7}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={theme.bg}
                        fontSize={7}
                        fontWeight={500}
                      >
                        {text}
                      </text>
                    </g>
                  );
                })()}
              </g>
            );
          })
        )}

        {/* Legend */}
        {(() => {
          const legendY = svgH + 8;
          const legendX = svgW - 140;
          const stops = [0, 0.08, 0.3, 0.6, 1];
          return (
            <g>
              <text x={legendX} y={legendY + 6} fill={theme.textTertiary} fontSize={7} dominantBaseline="central">
                Less
              </text>
              {stops.map((op, i) => (
                <rect
                  key={i}
                  x={legendX + 26 + i * (cellSize + 2)}
                  y={legendY}
                  width={cellSize}
                  height={cellSize}
                  rx={2}
                  fill={theme.accent}
                  opacity={Math.max(op, 0.08)}
                />
              ))}
              <text
                x={legendX + 26 + stops.length * (cellSize + 2) + 4}
                y={legendY + 6}
                fill={theme.textTertiary}
                fontSize={7}
                dominantBaseline="central"
              >
                More
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
