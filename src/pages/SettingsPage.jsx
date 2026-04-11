import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme.js';
import { apiGet, apiPut } from '../api/client.js';

export default function SettingsPage() {
  const { theme, themeMode, toggleTheme } = useTheme();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet('/api/account/settings');
        setSettings(res.data);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const save = async (updates) => {
    const next = { ...settings, ...updates };
    setSettings(next);
    try {
      await apiPut('/api/account/settings', next);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  if (loading) return (
    <div style={{ padding: 32 }}>
      <div className="skeleton" style={{ width: 200, height: 28, marginBottom: 20 }} />
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, marginBottom: 12 }} />)}
    </div>
  );

  const s = settings || {};

  const sectionStyle = {
    padding: 24, borderRadius: theme.radius.lg, border: `1px solid ${theme.border}`,
    background: theme.surface, marginBottom: 16,
  };

  const labelStyle = { fontSize: theme.font.bodySmall, color: theme.textTertiary, marginBottom: 6, display: 'block' };

  return (
    <div style={{ padding: 32, maxWidth: 640, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 style={{ fontSize: theme.font.headingXl, fontWeight: 600, color: theme.textPrimary }}>Settings</h1>
        {saved && <span style={{ fontSize: theme.font.bodySmall, color: theme.success }}>Saved</span>}
      </div>

      {/* Appearance */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: theme.font.heading, fontWeight: 500, color: theme.textPrimary, marginBottom: 16 }}>Appearance</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: theme.textSecondary }}>Theme</span>
          <button onClick={toggleTheme} style={{
            padding: '6px 16px', borderRadius: theme.radius.full, border: `1px solid ${theme.border}`,
            background: theme.accentBg, color: theme.accentText, fontWeight: 500, fontSize: theme.font.bodySmall,
          }}>{themeMode === 'forest' ? 'Dark' : 'Light'}</button>
        </div>
      </div>

      {/* Sounds & Celebrations */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: theme.font.heading, fontWeight: 500, color: theme.textPrimary, marginBottom: 16 }}>Sounds & Celebrations</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: theme.textSecondary }}>Sound effects</span>
            <button onClick={() => save({ enable_sounds: s.enable_sounds ? 0 : 1 })} style={{
              padding: '4px 12px', borderRadius: theme.radius.full, fontSize: theme.font.bodySmall,
              border: `1px solid ${theme.border}`, background: s.enable_sounds ? theme.accentBg : 'transparent',
              color: s.enable_sounds ? theme.accentText : theme.textTertiary,
            }}>{s.enable_sounds ? 'On' : 'Off'}</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: theme.textSecondary }}>Celebrations</span>
            <button onClick={() => save({ enable_celebrations: s.enable_celebrations ? 0 : 1 })} style={{
              padding: '4px 12px', borderRadius: theme.radius.full, fontSize: theme.font.bodySmall,
              border: `1px solid ${theme.border}`, background: s.enable_celebrations ? theme.accentBg : 'transparent',
              color: s.enable_celebrations ? theme.accentText : theme.textTertiary,
            }}>{s.enable_celebrations ? 'On' : 'Off'}</button>
          </div>
        </div>
      </div>

      {/* Work Hours */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: theme.font.heading, fontWeight: 500, color: theme.textPrimary, marginBottom: 16 }}>Work Hours</h2>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Start</label>
            <select value={Math.floor((s.work_hours_start || 32) / 4)}
              onChange={e => save({ work_hours_start: Number(e.target.value) * 4 })}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: theme.radius.md,
                border: `1px solid ${theme.border}`, background: theme.bg, color: theme.textPrimary,
              }}>
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>End</label>
            <select value={Math.floor((s.work_hours_end || 68) / 4)}
              onChange={e => save({ work_hours_end: Number(e.target.value) * 4 })}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: theme.radius.md,
                border: `1px solid ${theme.border}`, background: theme.bg, color: theme.textPrimary,
              }}>
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Task defaults */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: theme.font.heading, fontWeight: 500, color: theme.textPrimary, marginBottom: 16 }}>Task Defaults</h2>
        <div>
          <label style={labelStyle}>Default duration (slots of 15 min)</label>
          <select value={s.default_task_duration || 2}
            onChange={e => save({ default_task_duration: Number(e.target.value) })}
            style={{
              padding: '8px 12px', borderRadius: theme.radius.md,
              border: `1px solid ${theme.border}`, background: theme.bg, color: theme.textPrimary,
            }}>
            {[1,2,3,4,6,8,12].map(d => (
              <option key={d} value={d}>{d * 15} min</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
