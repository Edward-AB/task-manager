// API Keys section for the Settings page.
//
// Lets the user generate, view (masked, with reveal-once plaintext on
// creation), and revoke their personal API key used by the /api/schedule
// endpoints.

import { useEffect, useState } from 'react';
import { useTheme } from '../../hooks/useTheme.js';
import { useToast } from '../../hooks/useToast.js';
import { apiGet, apiPost, apiDelete } from '../../api/client.js';

export default function ApiKeySection({ sectionStyle }) {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [status, setStatus] = useState(null); // { present, masked, created_at }
  const [plaintext, setPlaintext] = useState(null); // shown once after generation
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [confirmRegen, setConfirmRegen] = useState(false);
  const [reveal, setReveal] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await apiGet('/api/account/api-key');
      setStatus(res?.data || { present: false });
    } catch (err) {
      showToast?.(err?.message || 'Failed to load API key');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const generate = async () => {
    if (status?.present && !confirmRegen) {
      setConfirmRegen(true);
      return;
    }
    setWorking(true);
    setConfirmRegen(false);
    try {
      const res = await apiPost('/api/account/api-key');
      setPlaintext(res?.data?.key || null);
      setReveal(true);
      setStatus({
        present: true,
        masked: res?.data?.masked,
        created_at: res?.data?.created_at,
      });
    } catch (err) {
      showToast?.(err?.message || 'Failed to generate API key');
    } finally {
      setWorking(false);
    }
  };

  const revoke = async () => {
    if (!confirmRevoke) {
      setConfirmRevoke(true);
      return;
    }
    setWorking(true);
    setConfirmRevoke(false);
    try {
      await apiDelete('/api/account/api-key');
      setPlaintext(null);
      setReveal(false);
      setStatus({ present: false });
    } catch (err) {
      showToast?.(err?.message || 'Failed to revoke API key');
    } finally {
      setWorking(false);
    }
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast?.('Copied to clipboard');
    } catch {
      showToast?.('Copy failed — select and copy manually');
    }
  };

  const btn = {
    padding: '6px 14px', borderRadius: theme.radius.full,
    border: `1px solid ${theme.border}`,
    background: theme.accentBg, color: theme.accentText,
    fontWeight: 500, fontSize: theme.font.bodySmall,
    cursor: 'pointer', fontFamily: 'inherit',
  };
  const btnMuted = { ...btn, background: 'transparent', color: theme.textSecondary };
  const btnDanger = { ...btn, background: 'transparent', color: theme.danger, borderColor: theme.danger };

  return (
    <div style={sectionStyle}>
      <h2 style={{
        fontSize: theme.font.heading, fontWeight: 500,
        color: theme.textPrimary, marginBottom: 6,
      }}>API Key</h2>
      <p style={{
        fontSize: theme.font.bodySmall, color: theme.textTertiary,
        lineHeight: 1.5, marginBottom: 14,
      }}>
        Use an API key with external tools to read your schedule and add tasks.
        See <code style={{
          padding: '1px 5px', borderRadius: 4,
          background: theme.bg, fontSize: 11,
        }}>/API.md</code> for endpoint docs. Send as <code style={{
          padding: '1px 5px', borderRadius: 4,
          background: theme.bg, fontSize: 11,
        }}>Authorization: Bearer …</code>.
      </p>

      {loading ? (
        <div className="skeleton" style={{ height: 44, borderRadius: 10 }} />
      ) : plaintext ? (
        <div style={{
          padding: 14, borderRadius: theme.radius.md,
          border: `1px solid ${theme.warning || theme.accent}`,
          background: theme.bg, marginBottom: 10,
        }}>
          <div style={{
            fontSize: theme.font.bodySmall, color: theme.textSecondary,
            marginBottom: 6, fontWeight: 500,
          }}>
            Your new key — copy it now. For security, we won't show it again.
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 10px', borderRadius: 8,
            background: theme.bgSecondary,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
            fontSize: 12, color: theme.textPrimary,
            overflowWrap: 'anywhere',
          }}>
            <span style={{ flex: 1 }}>{reveal ? plaintext : plaintext.replace(/./g, '•')}</span>
            <button onClick={() => setReveal((r) => !r)} style={btnMuted}>
              {reveal ? 'Hide' : 'Show'}
            </button>
            <button onClick={() => copy(plaintext)} style={btn}>Copy</button>
          </div>
        </div>
      ) : status?.present ? (
        <div style={{
          padding: '10px 12px', borderRadius: theme.radius.md,
          background: theme.bg, border: `1px solid ${theme.border}`,
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
          flexWrap: 'wrap',
        }}>
          <span style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
            fontSize: 12, color: theme.textPrimary, flex: 1, minWidth: 180,
          }}>{status.masked}</span>
          {status.created_at && (
            <span style={{ fontSize: 11, color: theme.textTertiary }}>
              Created {new Date(status.created_at).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </span>
          )}
        </div>
      ) : (
        <div style={{
          fontSize: theme.font.bodySmall, color: theme.textTertiary,
          marginBottom: 10,
        }}>
          No API key yet. Generate one to get started.
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={generate} disabled={working} style={btn}>
          {working ? 'Working…' : (status?.present ? (confirmRegen ? 'Confirm regenerate' : 'Regenerate') : 'Generate key')}
        </button>
        {confirmRegen && (
          <button onClick={() => setConfirmRegen(false)} disabled={working} style={btnMuted}>
            Cancel
          </button>
        )}
        {status?.present && (
          <button onClick={revoke} disabled={working} style={btnDanger}>
            {confirmRevoke ? 'Confirm revoke' : 'Revoke'}
          </button>
        )}
        {confirmRevoke && (
          <button onClick={() => setConfirmRevoke(false)} disabled={working} style={btnMuted}>
            Cancel
          </button>
        )}
      </div>

      {status?.present && confirmRegen && (
        <p style={{
          marginTop: 10, fontSize: 11, color: theme.textTertiary, lineHeight: 1.5,
        }}>
          Regenerating immediately invalidates the existing key. Any external tool
          still using the old key will stop working until you paste the new one.
        </p>
      )}
    </div>
  );
}
