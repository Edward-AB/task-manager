import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme.js';
import { apiGet, apiPost, apiPatch, apiDelete } from '../api/client.js';

export default function ProjectsPage() {
  const { theme } = useTheme();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [colorIdx, setColorIdx] = useState(0);
  const [search, setSearch] = useState('');

  const fetchProjects = async () => {
    try {
      const res = await apiGet('/api/projects');
      setProjects(res.data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, []);

  const resetForm = () => { setName(''); setDesc(''); setColorIdx(0); setShowForm(false); setEditingId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      if (editingId) {
        await apiPatch(`/api/projects/${editingId}`, { name: name.trim(), description: desc, color_idx: colorIdx });
      } else {
        await apiPost('/api/projects', { name: name.trim(), description: desc, color_idx: colorIdx });
      }
      resetForm();
      fetchProjects();
    } catch {}
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setName(p.name);
    setDesc(p.description || '');
    setColorIdx(p.color_idx ?? 0);
    setShowForm(true);
  };

  const handleDelete = async (id, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!confirm('Delete this project? Tasks and deadlines will be unlinked.')) return;
    try { await apiDelete(`/api/projects/${id}`); fetchProjects(); } catch {}
  };

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div style={{ padding: 32 }}>
      <div className="skeleton" style={{ width: 200, height: 28, marginBottom: 20 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 140 }} />)}
      </div>
    </div>
  );

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: theme.font.headingXl, fontWeight: 600, color: theme.textPrimary }}>Projects</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..."
            style={{
              padding: '8px 14px', borderRadius: theme.radius.md, border: `1px solid ${theme.border}`,
              background: theme.surface, color: theme.textPrimary, fontSize: theme.font.bodySmall,
              outline: 'none', width: 200,
            }} />
          <button onClick={() => setShowForm(true)} style={{
            padding: '8px 20px', borderRadius: theme.radius.md, background: theme.accentBtn,
            color: theme.accentBtnText, fontWeight: 500, fontSize: theme.font.bodySmall,
          }}>New project</button>
        </div>
      </div>

      {showForm && (
        <div style={{
          padding: 24, borderRadius: theme.radius.lg, border: `1px solid ${theme.border}`,
          background: theme.surface, marginBottom: 20,
        }}>
          <div style={{ fontSize: theme.font.heading, fontWeight: 600, color: theme.textPrimary, marginBottom: 8 }}>
            {editingId ? 'Edit project' : 'New project'}
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Project name" autoFocus
              style={{
                padding: '10px 14px', borderRadius: theme.radius.md, border: `1px solid ${theme.border}`,
                background: theme.bg, color: theme.textPrimary, fontSize: theme.font.body, outline: 'none',
              }} />
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description (optional)"
              style={{
                padding: '10px 14px', borderRadius: theme.radius.md, border: `1px solid ${theme.border}`,
                background: theme.bg, color: theme.textPrimary, fontSize: theme.font.body, outline: 'none',
              }} />
            <div style={{ display: 'flex', gap: 6 }}>
              {theme.deadline.map((c, i) => (
                <button key={i} type="button" onClick={() => setColorIdx(i)} style={{
                  width: 28, height: 28, borderRadius: '50%', background: c.dot, border: colorIdx === i ? `2px solid ${theme.textPrimary}` : '2px solid transparent',
                  cursor: 'pointer',
                }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" style={{
                padding: '8px 20px', borderRadius: theme.radius.md, background: theme.accentBtn,
                color: theme.accentBtnText, fontWeight: 500,
              }}>{editingId ? 'Update' : 'Create'}</button>
              <button type="button" onClick={resetForm} style={{
                padding: '8px 20px', borderRadius: theme.radius.md, border: `1px solid ${theme.border}`,
                color: theme.textSecondary,
              }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
          <p style={{ color: theme.textSecondary, marginBottom: 8, fontWeight: 500 }}>No projects yet</p>
          <p style={{ color: theme.textTertiary, fontSize: theme.font.bodySmall }}>Create your first project to organise your work</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filtered.map(p => {
            const dlc = theme.deadline[p.color_idx % theme.deadline.length];
            return (
              <Link to={`/projects/${p.id}`} key={p.id} style={{
                padding: 24, borderRadius: theme.radius.lg, border: `1px solid ${theme.border}`,
                background: theme.surface, textDecoration: 'none', display: 'block',
                transition: 'transform 200ms, box-shadow 200ms',
                borderLeft: `4px solid ${dlc.dot}`,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = theme.shadow.md; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <h3 style={{ fontSize: theme.font.heading, fontWeight: 600, color: theme.textPrimary, margin: 0 }}>{p.name}</h3>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEdit(p); }} title="Edit" style={{
                      width: 22, height: 22, borderRadius: theme.radius.sm, fontSize: 11,
                      color: theme.textTertiary, border: `0.5px solid ${theme.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', background: theme.bg, padding: 0,
                    }}>{'\u270E'}</button>
                    <button onClick={(e) => handleDelete(p.id, e)} title="Delete" style={{
                      width: 22, height: 22, borderRadius: theme.radius.sm, fontSize: 11,
                      color: theme.danger, border: `0.5px solid ${theme.danger}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', background: theme.bg, padding: 0,
                    }}>{'\u00D7'}</button>
                  </div>
                </div>
                {p.description && <p style={{ fontSize: theme.font.bodySmall, color: theme.textSecondary, marginBottom: 12 }}>{p.description}</p>}
                <div style={{ display: 'flex', gap: 16, fontSize: theme.font.label, color: theme.textTertiary }}>
                  <span>{p.task_count || 0} tasks</span>
                  <span>{p.deadline_count || 0} deadlines</span>
                </div>
                {p.task_count > 0 && (
                  <div style={{ marginTop: 12, height: 4, borderRadius: 2, background: theme.border, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 2, background: theme.accent,
                      width: `${Math.round((p.done_count || 0) / p.task_count * 100)}%`,
                      transition: 'width 300ms',
                    }} />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
