import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme.js';
import DeadlineItem from './DeadlineItem.jsx';
import DeadlineForm from './DeadlineForm.jsx';

export default function DeadlineList({ deadlines, tasks, projects, onAdd, onDelete, onEdit }) {
  const { theme } = useTheme();
  const [showForm, setShowForm] = useState(false);

  // Group by project
  const grouped = {};
  const noProject = [];
  (deadlines || []).forEach(dl => {
    if (dl.project_id) {
      if (!grouped[dl.project_id]) grouped[dl.project_id] = [];
      grouped[dl.project_id].push(dl);
    } else {
      noProject.push(dl);
    }
  });

  return (
    <div style={{
      padding: 16, borderRadius: theme.radius.lg, border: `1px solid ${theme.border}`,
      background: theme.surface,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{
          fontSize: theme.font.label, fontWeight: 500, color: theme.textTertiary,
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>DEADLINES</div>
        <button onClick={() => setShowForm(!showForm)} style={{
          fontSize: 16, width: 24, height: 24, borderRadius: theme.radius.sm,
          border: `1px solid ${theme.border}`, color: theme.textTertiary,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{showForm ? '−' : '+'}</button>
      </div>

      {showForm && (
        <div style={{ marginBottom: 12 }}>
          <DeadlineForm projects={projects} onSubmit={(dl) => { onAdd(dl); setShowForm(false); }} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {(!deadlines || deadlines.length === 0) ? (
        <div style={{ textAlign: 'center', padding: '16px 0', color: theme.textTertiary, fontSize: theme.font.bodySmall }}>
          No upcoming deadlines
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Object.entries(grouped).map(([projId, dls]) => {
            const proj = (projects || []).find(p => p.id === projId);
            return (
              <div key={projId}>
                <div style={{
                  fontSize: theme.font.label, color: theme.textTertiary, fontWeight: 500,
                  marginBottom: 6, marginTop: 4,
                }}>{proj?.name || 'Project'}</div>
                {dls.map(dl => (
                  <DeadlineItem key={dl.id} deadline={dl} tasks={tasks || []} onDelete={onDelete} onEdit={onEdit} />
                ))}
              </div>
            );
          })}
          {noProject.map(dl => (
            <DeadlineItem key={dl.id} deadline={dl} tasks={tasks || []} onDelete={onDelete} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  );
}
