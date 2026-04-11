import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme.js';
import { useAuth } from '../hooks/useAuth.js';
import { apiPatch, apiPost, apiDelete } from '../api/client.js';

export default function AccountPage() {
  const { theme } = useTheme();
  const { user, loadUser, logout } = useAuth();
  const navigate = useNavigate();

  // Profile editing
  const [editUsername, setEditUsername] = useState(user?.username || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || null);
  const fileRef = useRef(null);

  // Password
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  const handleSaveUsername = async () => {
    try {
      const res = await apiPatch('/api/account', { username: editUsername.trim() });
      loadUser?.();
      setProfileMsg('Username updated');
    } catch (err) { setProfileMsg(err?.message || 'Error updating username'); }
  };

  const handleSaveEmail = async () => {
    try {
      await apiPatch('/api/account', { email: editEmail.trim() });
      loadUser?.();
      setProfileMsg('Email updated');
    } catch (err) { setProfileMsg(err?.message || 'Error updating email'); }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100000) { setProfileMsg('Image too large (max 100KB)'); return; }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      setAvatarPreview(base64);
      try {
        await apiPatch('/api/account', { avatar_url: base64 });
        loadUser?.();
        setProfileMsg('Avatar updated');
      } catch (err) { setProfileMsg('Error uploading avatar'); }
    };
    reader.readAsDataURL(file);
  };

  const handleChangePw = async (e) => {
    e.preventDefault();
    if (newPw !== confirmPw) { setPwMsg('Passwords do not match'); return; }
    try {
      await apiPost('/api/account/change-password', { currentPassword: currentPw, newPassword: newPw });
      setPwMsg('Password changed successfully');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) { setPwMsg(err.message); }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user?.username) return;
    try { await apiDelete('/api/account'); logout(); navigate('/'); } catch {}
  };

  const inputStyle = {
    width: '100%', padding: '8px 12px', borderRadius: theme.radius.sm,
    border: `1px solid ${theme.border}`, background: theme.bg,
    color: theme.textPrimary, fontSize: theme.font.body, outline: 'none',
    boxSizing: 'border-box',
  };

  const sectionStyle = {
    padding: 20, borderRadius: theme.radius.md, border: `0.5px solid ${theme.border}`,
    background: theme.bgSecondary, marginBottom: 16,
  };

  const saveBtn = {
    padding: '6px 14px', borderRadius: theme.radius.sm, background: theme.accentBtn,
    color: theme.accentBtnText, fontWeight: 500, fontSize: theme.font.bodySmall,
    border: 'none', cursor: 'pointer',
  };

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ fontSize: theme.font.headingLg, fontWeight: 600, color: theme.textPrimary, marginBottom: 20 }}>Account</h1>

      {profileMsg && (
        <div style={{
          padding: '8px 12px', borderRadius: theme.radius.sm, marginBottom: 12,
          background: profileMsg.includes('Error') || profileMsg.includes('too large') ? theme.dangerBg : theme.successBg,
          color: profileMsg.includes('Error') || profileMsg.includes('too large') ? theme.danger : theme.success,
          fontSize: theme.font.bodySmall,
        }}>{profileMsg}</div>
      )}

      {/* Avatar */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: theme.font.heading, fontWeight: 500, color: theme.textPrimary, marginBottom: 12 }}>Profile picture</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', overflow: 'hidden',
            background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `2px solid ${theme.border}`, flexShrink: 0,
          }}>
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: theme.accentBtnText, fontSize: '24px', fontWeight: 700 }}>
                {(user?.username || 'U')[0].toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
            <button onClick={() => fileRef.current?.click()} style={saveBtn}>Upload photo</button>
            <p style={{ fontSize: theme.font.label, color: theme.textTertiary, marginTop: 4 }}>Max 100KB. JPG or PNG.</p>
          </div>
        </div>
      </div>

      {/* Username */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: theme.font.heading, fontWeight: 500, color: theme.textPrimary, marginBottom: 12 }}>Username</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input value={editUsername} onChange={e => setEditUsername(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
          <button onClick={handleSaveUsername} style={saveBtn}>Save</button>
        </div>
      </div>

      {/* Email */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: theme.font.heading, fontWeight: 500, color: theme.textPrimary, marginBottom: 12 }}>Email</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input value={editEmail} onChange={e => setEditEmail(e.target.value)} type="email" style={{ ...inputStyle, flex: 1 }} />
          <button onClick={handleSaveEmail} style={saveBtn}>Save</button>
        </div>
      </div>

      {/* Change password */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: theme.font.heading, fontWeight: 500, color: theme.textPrimary, marginBottom: 12 }}>Change password</h2>
        {pwMsg && <div style={{ fontSize: theme.font.bodySmall, color: pwMsg.includes('success') ? theme.success : theme.danger, marginBottom: 10 }}>{pwMsg}</div>}
        <form onSubmit={handleChangePw} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="Current password" style={inputStyle} />
          <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="New password" style={inputStyle} />
          <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Confirm new password" style={inputStyle} />
          <button type="submit" style={{ ...saveBtn, alignSelf: 'flex-start' }}>Update password</button>
        </form>
      </div>

      {/* Team */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: theme.font.heading, fontWeight: 500, color: theme.textPrimary, marginBottom: 6 }}>Team</h2>
        <p style={{ fontSize: theme.font.bodySmall, color: theme.textTertiary, lineHeight: 1.5 }}>
          Team workspaces, shared projects, and collaboration features are coming soon.
          Upgrade to Pro + Team when available to unlock these features.
        </p>
        <div style={{
          marginTop: 10, padding: '6px 14px', borderRadius: theme.radius.sm,
          background: theme.accentBg, color: theme.accentText, fontSize: theme.font.bodySmall,
          fontWeight: 500, display: 'inline-block',
        }}>Coming soon</div>
      </div>

      {/* Danger zone */}
      <div style={{
        padding: 20, borderRadius: theme.radius.md, border: `1px solid ${theme.danger}40`,
        background: theme.dangerBg,
      }}>
        <h2 style={{ fontSize: theme.font.heading, fontWeight: 500, color: theme.danger, marginBottom: 6 }}>Danger zone</h2>
        <p style={{ fontSize: theme.font.bodySmall, color: theme.textSecondary, marginBottom: 12 }}>
          Permanently delete your account and all data. This cannot be undone.
        </p>
        {!showDelete ? (
          <button onClick={() => setShowDelete(true)} style={{
            padding: '8px 16px', borderRadius: theme.radius.sm, background: theme.danger,
            color: '#fff', fontWeight: 500, border: 'none', cursor: 'pointer',
          }}>Delete my account</button>
        ) : (
          <div>
            <p style={{ fontSize: theme.font.bodySmall, color: theme.textSecondary, marginBottom: 8 }}>
              Type <strong>{user?.username}</strong> to confirm:
            </p>
            <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
              style={{ ...inputStyle, marginBottom: 10, borderColor: theme.danger + '60' }}
              placeholder={user?.username} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleDeleteAccount} disabled={deleteConfirm !== user?.username}
                style={{
                  padding: '8px 16px', borderRadius: theme.radius.sm, background: theme.danger,
                  color: '#fff', fontWeight: 500, opacity: deleteConfirm !== user?.username ? 0.5 : 1,
                  border: 'none', cursor: 'pointer',
                }}>Permanently delete</button>
              <button onClick={() => { setShowDelete(false); setDeleteConfirm(''); }}
                style={{
                  padding: '8px 16px', borderRadius: theme.radius.sm, border: `1px solid ${theme.border}`,
                  color: theme.textSecondary, cursor: 'pointer', background: 'transparent',
                }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
