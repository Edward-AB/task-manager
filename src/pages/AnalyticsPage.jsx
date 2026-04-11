import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme.js';
import { apiGet } from '../api/client.js';
import ProductivityChart from '../components/analytics/ProductivityChart.jsx';
import CompletionHeatmap from '../components/analytics/CompletionHeatmap.jsx';
import PriorityBreakdown from '../components/analytics/PriorityBreakdown.jsx';
import TimeDistribution from '../components/analytics/TimeDistribution.jsx';
import ProjectProgress from '../components/analytics/ProjectProgress.jsx';

export default function AnalyticsPage() {
  const { theme } = useTheme();
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, projRes] = await Promise.all([
          apiGet('/api/stats'),
          apiGet('/api/projects').catch(() => ({ data: [] })),
        ]);
        setStats(statsRes.data);
        setProjects(projRes.data || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) return (
    <div style={{ padding: 32 }}>
      <div className="skeleton" style={{ width: 200, height: 28, marginBottom: 20 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}
      </div>
    </div>
  );

  const s = stats || {};

  const cardStyle = {
    padding: 28,
    borderRadius: theme.radius.lg,
    border: `1px solid ${theme.border}`,
    background: theme.surface,
  };

  const sectionTitle = {
    fontSize: theme.font.heading,
    fontWeight: 500,
    color: theme.textPrimary,
    marginBottom: 20,
  };

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: theme.font.headingXl, fontWeight: 600, color: theme.textPrimary, marginBottom: 28 }}>Analytics</h1>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Tasks', value: s.total_tasks || 0, icon: '\ud83d\udccb' },
          { label: 'Completed', value: s.completed_tasks || 0, icon: '\u2705' },
          { label: 'Completion Rate', value: `${s.completion_rate || 0}%`, icon: '\ud83d\udcca' },
          { label: 'Current Streak', value: `${s.current_streak || 0} days`, icon: '\ud83d\udd25' },
          { label: 'Longest Streak', value: `${s.longest_streak || 0} days`, icon: '\ud83c\udfc6' },
          { label: 'Tasks This Week', value: s.tasks_this_week || 0, icon: '\ud83d\udcc5' },
        ].map((item, i) => (
          <div key={i} style={{
            padding: 24, borderRadius: theme.radius.lg, border: `1px solid ${theme.border}`,
            background: theme.surface,
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
            <div style={{ fontSize: theme.font.headingLg, fontWeight: 600, color: theme.textPrimary }}>{item.value}</div>
            <div style={{ fontSize: theme.font.bodySmall, color: theme.textTertiary, marginTop: 4 }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Streak highlight */}
      <div style={{
        ...cardStyle,
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 36 }}>{'\ud83d\udd25'}</span>
          <div>
            <div style={{ fontSize: theme.font.headingLg, fontWeight: 700, color: theme.textPrimary }}>
              {s.current_streak || 0} day streak
            </div>
            <div style={{ fontSize: theme.font.bodySmall, color: theme.textTertiary, marginTop: 2 }}>
              Keep completing tasks daily!
            </div>
          </div>
        </div>
        <div style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          borderRadius: theme.radius.md,
          background: theme.accentBg,
        }}>
          <span style={{ fontSize: 16 }}>{'\ud83c\udfc6'}</span>
          <span style={{ fontSize: theme.font.body, color: theme.accentText, fontWeight: 500 }}>
            Best: {s.longest_streak || 0} days
          </span>
        </div>
      </div>

      {/* 30-Day Productivity chart */}
      <div style={{ ...cardStyle, marginBottom: 20 }}>
        <h2 style={sectionTitle}>30-Day Productivity</h2>
        <ProductivityChart dailyCounts={s.daily_counts || []} />
      </div>

      {/* Completion Heatmap */}
      <div style={{ ...cardStyle, marginBottom: 20 }}>
        <h2 style={sectionTitle}>Activity Heatmap</h2>
        <CompletionHeatmap dailyCounts={s.daily_counts || []} />
      </div>

      {/* Two-column row: Priority Breakdown + Time Distribution */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: 20,
        marginBottom: 20,
      }}>
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Priority Breakdown</h2>
          <PriorityBreakdown
            high={s.priority_high || 0}
            medium={s.priority_medium || 0}
            low={s.priority_low || 0}
            none={s.priority_none || 0}
          />
        </div>

        <div style={cardStyle}>
          <h2 style={sectionTitle}>Task Distribution</h2>
          <TimeDistribution stats={s} />
        </div>
      </div>

      {/* Project Progress */}
      <div style={{ ...cardStyle, marginBottom: 20 }}>
        <h2 style={sectionTitle}>Project Progress</h2>
        <ProjectProgress projects={projects} />
      </div>
    </div>
  );
}
