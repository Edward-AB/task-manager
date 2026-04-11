import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme.js';
import { apiGet, apiPatch, apiDelete } from '../api/client.js';
import ProjectSidebar from '../components/projects/ProjectSidebar.jsx';
import ProjectDetail from '../components/projects/ProjectDetail.jsx';
import ProjectAnalytics from '../components/projects/ProjectAnalytics.jsx';
import GanttChart from '../components/projects/GanttChart.jsx';

export default function ProjectDetailPage() {
  const { theme } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('manage');
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editColor, setEditColor] = useState(0);

  const fetchProject = useCallback(async () => {
    try {
      const res = await apiGet(`/api/projects/${id}`);
      setProject(res.data);
    } catch {}
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchProject(); }, [fetchProject]);

  const handleStartEdit = () => {
    setEditName(project.name);
    setEditDesc(project.description || '');
    setEditColor(project.color_idx ?? 0);
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) return;
    try {
      await apiPatch(`/api/projects/${id}`, { name: editName.trim(), description: editDesc, color_idx: editColor });
      setEditing(false);
      fetchProject();
    } catch {}
  };

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project? Tasks and deadlines will be unlinked.')) return;
    try { await apiDelete(`/api/projects/${id}`); navigate('/projects'); } catch {}
  };

  if (loading) return (
    <div style={{ padding: 32 }}>
      <div className="skeleton" style={{ width: 300, height: 32, marginBottom: 20 }} />
      <div className="skeleton" style={{ width: '100%', height: 400 }} />
    </div>
  );

  if (!project) return (
    <div style={{ padding: 32, textAlign: 'center' }}>
      <p style={{ color: theme.textSecondary }}>Project not found</p>
      <Link to="/projects" style={{ color: theme.accent }}>Back to projects</Link>
    </div>
  );

  const dlc = theme.deadline[project.color_idx % theme.deadline.length];
  const deadlines = project.deadlines || [];

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      <Link to="/projects" style={{ fontSize: theme.font.bodySmall, color: theme.textTertiary, marginBottom: 16, display: 'inline-block' }}>
        &larr; Back to projects
      </Link>
      {editing ? (
        <div style={{ padding: 20, borderRadius: theme.radius.md, border: `1px solid ${theme.border}`, background: theme.bgSecondary, marginBottom: 20 }}>
          <input value={editName} onChange={e => setEditName(e.target.value)} autoFocus style={{
            width: '100%', padding: '10px 14px', borderRadius: theme.radius.sm, border: `1px solid ${theme.border}`,
            background: theme.bg, color: theme.textPrimary, fontSize: theme.font.heading, fontWeight: 600,
            outline: 'none', boxSizing: 'border-box', marginBottom: 10,
          }} />
          <input value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Description (optional)" style={{
            width: '100%', padding: '8px 14px', borderRadius: theme.radius.sm, border: `1px solid ${theme.border}`,
            background: theme.bg, color: theme.textPrimary, fontSize: theme.font.body,
            outline: 'none', boxSizing: 'border-box', marginBottom: 10,
          }} />
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {theme.deadline.map((c, i) => (
              <button key={i} type="button" onClick={() => setEditColor(i)} style={{
                width: 24, height: 24, borderRadius: '50%', background: c.dot, padding: 0,
                border: editColor === i ? `2px solid ${theme.textPrimary}` : '2px solid transparent', cursor: 'pointer',
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSaveEdit} style={{ padding: '6px 16px', borderRadius: theme.radius.sm, background: theme.accentBtn, color: theme.accentBtnText, fontWeight: 500, border: 'none', cursor: 'pointer' }}>Save</button>
            <button onClick={() => setEditing(false)} style={{ padding: '6px 16px', borderRadius: theme.radius.sm, border: `1px solid ${theme.border}`, color: theme.textSecondary, cursor: 'pointer', background: 'transparent' }}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: dlc.dot }} />
            <h1 style={{ fontSize: theme.font.headingXl, fontWeight: 600, color: theme.textPrimary, margin: 0 }}>{project.name}</h1>
            <button onClick={handleStartEdit} title="Edit project" style={{
              padding: '4px 10px', borderRadius: theme.radius.sm, border: `1px solid ${theme.border}`,
              color: theme.textSecondary, fontSize: theme.font.bodySmall, cursor: 'pointer', background: 'transparent',
            }}>{'\u270E'} Edit</button>
            <button onClick={handleDeleteProject} title="Delete project" style={{
              padding: '4px 10px', borderRadius: theme.radius.sm, border: `1px solid ${theme.danger}40`,
              color: theme.danger, fontSize: theme.font.bodySmall, cursor: 'pointer', background: 'transparent',
            }}>{'\u00D7'} Delete</button>
          </div>
          {project.description && (
            <p style={{ color: theme.textSecondary, marginBottom: 20 }}>{project.description}</p>
          )}
        </>
      )}

      <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
        {['manage', 'analytics'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 20px', borderRadius: theme.radius.full, fontWeight: 500,
            fontSize: theme.font.bodySmall, textTransform: 'capitalize',
            background: tab === t ? theme.accentBg : 'transparent',
            color: tab === t ? theme.accentText : theme.textSecondary,
            border: `1px solid ${tab === t ? theme.accentBorder : 'transparent'}`,
            cursor: 'pointer',
          }}>{t}</button>
        ))}
      </div>

      {tab === 'manage' ? (
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <ProjectSidebar project={project} deadlines={deadlines} />
          <ProjectDetail project={project} onRefresh={fetchProject} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <ProjectAnalytics project={project} />
          <GanttChart deadlines={deadlines} />
        </div>
      )}
    </div>
  );
}
