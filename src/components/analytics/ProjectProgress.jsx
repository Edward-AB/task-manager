import { useTheme } from '../../hooks/useTheme.js';

/**
 * Progress bars showing completion per project.
 * Props: projects - array of { name, task_count, done_count, color_idx }
 */
export default function ProjectProgress({ projects = [] }) {
  const { theme } = useTheme();

  if (projects.length === 0) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 32, color: theme.textTertiary, fontSize: theme.font.body,
      }}>
        No projects
      </div>
    );
  }

  // Sort by completion percentage descending
  const sorted = [...projects]
    .map((p) => ({
      ...p,
      pct: p.task_count > 0 ? Math.round((p.done_count / p.task_count) * 100) : 0,
    }))
    .sort((a, b) => b.pct - a.pct);

  const getColor = (colorIdx) => {
    const idx = (colorIdx ?? 0) % theme.deadline.length;
    return theme.deadline[idx].dot;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {sorted.map((proj, i) => {
        const color = getColor(proj.color_idx);
        return (
          <div key={proj.name || i}>
            {/* Header row */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 6,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <span style={{
                  width: 8,
                  height: 8,
                  borderRadius: theme.radius.full,
                  background: color,
                  flexShrink: 0,
                }} />
                <span style={{
                  fontSize: theme.font.body,
                  color: theme.textPrimary,
                  fontWeight: 500,
                }}>
                  {proj.name}
                </span>
              </div>
              <span style={{
                fontSize: theme.font.bodySmall,
                color: theme.textTertiary,
              }}>
                {proj.done_count}/{proj.task_count} ({proj.pct}%)
              </span>
            </div>

            {/* Progress bar */}
            <div style={{
              width: '100%',
              height: 8,
              background: theme.bgTertiary,
              borderRadius: theme.radius.full,
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${proj.pct}%`,
                height: '100%',
                background: color,
                borderRadius: theme.radius.full,
                transition: 'width 0.5s ease',
                minWidth: proj.pct > 0 ? 4 : 0,
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
