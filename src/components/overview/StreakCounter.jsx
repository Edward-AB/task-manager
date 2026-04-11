import { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme.js';

export default function StreakCounter({ currentStreak, longestStreak }) {
  const { theme } = useTheme();
  const [displayCount, setDisplayCount] = useState(0);

  // Animate count-up
  useEffect(() => {
    if (currentStreak <= 0) {
      setDisplayCount(0);
      return;
    }

    setDisplayCount(0);
    const duration = 600; // ms
    const steps = Math.min(currentStreak, 30);
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setDisplayCount(Math.round(progress * currentStreak));
      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, [currentStreak]);

  const containerStyle = {
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: theme.radius.lg,
    padding: '16px 20px',
    textAlign: 'center',
  };

  const fireRowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 4,
  };

  const numberStyle = {
    fontSize: 32,
    fontWeight: 700,
    color: currentStreak > 0 ? theme.warning : theme.textTertiary,
    lineHeight: 1.1,
    transition: 'color 300ms',
  };

  const labelStyle = {
    fontSize: theme.font.body,
    fontWeight: 500,
    color: theme.textPrimary,
    marginBottom: 6,
  };

  const longestStyle = {
    fontSize: theme.font.label,
    color: theme.textTertiary,
  };

  const encourageStyle = {
    fontSize: theme.font.bodySmall,
    color: theme.textTertiary,
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 1.4,
  };

  if (currentStreak === 0) {
    return (
      <div style={containerStyle}>
        <div style={fireRowStyle}>
          <span style={{ fontSize: 24, opacity: 0.4 }}><svg width={24} height={24} viewBox="0 0 24 24" fill="none"><path d="M12 2c0 4-4 6-4 10a4 4 0 108 0c0-4-4-6-4-10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg></span>
          <span style={numberStyle}>0</span>
        </div>
        <div style={labelStyle}>day streak</div>
        <div style={encourageStyle}>
          Complete all today's tasks to start a streak!
        </div>
        {longestStreak > 0 && (
          <div style={{ ...longestStyle, marginTop: 8 }}>
            Longest: {longestStreak} day{longestStreak !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={fireRowStyle}>
        <span style={{ fontSize: 28 }}><svg width={24} height={24} viewBox="0 0 24 24" fill="none"><path d="M12 2c0 4-4 6-4 10a4 4 0 108 0c0-4-4-6-4-10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg></span>
        <span style={numberStyle}>{displayCount}</span>
      </div>
      <div style={labelStyle}>
        day streak{currentStreak > 1 ? '' : ''}
      </div>
      <div style={longestStyle}>
        Longest: {longestStreak} day{longestStreak !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
