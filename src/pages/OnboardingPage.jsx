import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme.js';
import { useAuth } from '../hooks/useAuth.js';
import { apiPut, apiPost } from '../api/client.js';

const ROLES = [
  { key: 'student', emoji: '\u25CB', label: 'Student', desc: 'School, homework, study sessions', startHour: 9, endHour: 21 },
  { key: 'professional', emoji: '\u25CB', label: 'Professional', desc: 'Work, meetings, projects', startHour: 8, endHour: 17 },
  { key: 'team_lead', emoji: '\u25CB', label: 'Team Lead', desc: 'Manage people and deliverables', startHour: 8, endHour: 18 },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function OnboardingPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [workStart, setWorkStart] = useState(8);
  const [workEnd, setWorkEnd] = useState(17);
  const [projectName, setProjectName] = useState('');
  const [projectColor, setProjectColor] = useState(0);
  const [saving, setSaving] = useState(false);

  const handleRoleSelect = (r) => {
    setRole(r.key);
    setWorkStart(r.startHour);
    setWorkEnd(r.endHour);
    setStep(3);
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      await apiPut('/api/account/settings', {
        work_hours_start: workStart * 4,
        work_hours_end: workEnd * 4,
      });
      if (projectName.trim()) {
        await apiPost('/api/projects', {
          name: projectName.trim(),
          color_idx: projectColor,
        });
      }
      navigate('/dashboard');
    } catch {
      navigate('/dashboard');
    }
    setSaving(false);
  };

  const progressPct = ((step - 1) / 3) * 100;

  const containerStyle = {
    minHeight: '100vh',
    background: theme.bg,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  };

  const cardStyle = {
    width: '100%',
    maxWidth: 520,
    background: theme.surface,
    borderRadius: theme.radius.xl,
    border: `1px solid ${theme.border}`,
    boxShadow: theme.shadow.lg,
    padding: '40px 32px',
    position: 'relative',
    overflow: 'hidden',
  };

  const progressTrackStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: theme.bgTertiary,
  };

  const progressFillStyle = {
    height: '100%',
    width: `${progressPct}%`,
    background: theme.accent,
    borderRadius: '0 2px 2px 0',
    transition: 'width 0.4s ease',
  };

  const stepLabelStyle = {
    fontSize: theme.font.bodySmall,
    color: theme.textTertiary,
    textAlign: 'center',
    marginBottom: 16,
  };

  const headingStyle = {
    fontSize: theme.font.headingXl,
    fontWeight: 700,
    color: theme.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  };

  const subStyle = {
    fontSize: theme.font.body,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 1.5,
  };

  const btnStyle = {
    width: '100%',
    padding: '14px',
    borderRadius: theme.radius.md,
    background: theme.accentBtn,
    color: theme.accentBtnText,
    fontWeight: 600,
    fontSize: theme.font.body,
    border: 'none',
    cursor: saving ? 'wait' : 'pointer',
    opacity: saving ? 0.7 : 1,
    fontFamily: 'inherit',
    transition: `opacity ${theme.transition}`,
  };

  const renderStep1 = () => (
    <>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <span style={{ fontSize: '48px', display: 'inline-block', animation: 'onboard-bounce 1s ease infinite' }}>
          {'\uD83C\uDF32'}
        </span>
        <style>{`@keyframes onboard-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }`}</style>
      </div>
      <div style={headingStyle}>
        Welcome to PineTask, @{user?.username || 'friend'}!
      </div>
      <div style={subStyle}>
        Let's get your workspace set up in just a few steps.
      </div>
      <button style={btnStyle} onClick={() => setStep(2)}>
        Let's set things up
      </button>
    </>
  );

  const renderStep2 = () => (
    <>
      <div style={headingStyle}>How will you use PineTask?</div>
      <div style={subStyle}>Pick the option that best describes you.</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ROLES.map((r) => {
          const selected = role === r.key;
          return (
            <button
              key={r.key}
              onClick={() => handleRoleSelect(r)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '16px 20px',
                borderRadius: theme.radius.lg,
                border: `1.5px solid ${selected ? theme.accentBorder : theme.border}`,
                background: selected ? theme.accentBg : theme.surface,
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
                transition: `all ${theme.transition}`,
              }}
            >
              <span style={{ fontSize: '28px', flexShrink: 0 }}>{r.emoji}</span>
              <div>
                <div style={{ fontSize: theme.font.heading, fontWeight: 600, color: theme.textPrimary }}>
                  {r.label}
                </div>
                <div style={{ fontSize: theme.font.bodySmall, color: theme.textSecondary, marginTop: 2 }}>
                  {r.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );

  const renderStep3 = () => {
    const barLeft = (workStart / 24) * 100;
    const barWidth = ((workEnd - workStart) / 24) * 100;

    return (
      <>
        <div style={headingStyle}>When do you usually work?</div>
        <div style={subStyle}>We'll highlight these hours on your calendar.</div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: theme.font.bodySmall, color: theme.textSecondary, display: 'block', marginBottom: 6, fontWeight: 500 }}>
              Start hour
            </label>
            <select
              value={workStart}
              onChange={(e) => setWorkStart(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: theme.radius.md,
                border: `1px solid ${theme.border}`,
                background: theme.surface,
                color: theme.textPrimary,
                fontSize: theme.font.body,
                fontFamily: 'inherit',
                outline: 'none',
              }}
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: theme.font.bodySmall, color: theme.textSecondary, display: 'block', marginBottom: 6, fontWeight: 500 }}>
              End hour
            </label>
            <select
              value={workEnd}
              onChange={(e) => setWorkEnd(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: theme.radius.md,
                border: `1px solid ${theme.border}`,
                background: theme.surface,
                color: theme.textPrimary,
                fontSize: theme.font.body,
                fontFamily: 'inherit',
                outline: 'none',
              }}
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
              ))}
            </select>
          </div>
        </div>
        {/* Visual bar preview */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: theme.font.bodySmall, color: theme.textTertiary, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span>00:00</span>
            <span>12:00</span>
            <span>24:00</span>
          </div>
          <div style={{
            width: '100%',
            height: 28,
            borderRadius: theme.radius.md,
            background: theme.bgTertiary,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              left: `${barLeft}%`,
              width: `${barWidth}%`,
              height: '100%',
              background: theme.accentBg,
              border: `1.5px solid ${theme.accentBorder}`,
              borderRadius: theme.radius.sm,
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: `all ${theme.transition}`,
            }}>
              <span style={{ fontSize: theme.font.label, fontWeight: 600, color: theme.accentText }}>
                {String(workStart).padStart(2, '0')}:00 - {String(workEnd).padStart(2, '0')}:00
              </span>
            </div>
          </div>
        </div>
        <button style={btnStyle} onClick={() => setStep(4)}>
          Continue
        </button>
      </>
    );
  };

  const renderStep4 = () => (
    <>
      <div style={headingStyle}>Create your first project</div>
      <div style={subStyle}>Projects help you group related tasks together.</div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: theme.font.bodySmall, color: theme.textSecondary, display: 'block', marginBottom: 6, fontWeight: 500 }}>
          Project name
        </label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="e.g. Work, School, Side Project"
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: theme.radius.md,
            border: `1px solid ${theme.border}`,
            background: theme.surface,
            color: theme.textPrimary,
            fontSize: theme.font.body,
            outline: 'none',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
          }}
        />
      </div>
      <div style={{ marginBottom: 28 }}>
        <label style={{ fontSize: theme.font.bodySmall, color: theme.textSecondary, display: 'block', marginBottom: 10, fontWeight: 500 }}>
          Color
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          {theme.deadline.map((c, i) => (
            <button
              key={i}
              onClick={() => setProjectColor(i)}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: c.bg,
                border: `2.5px solid ${projectColor === i ? c.dot : c.border}`,
                cursor: 'pointer',
                boxShadow: projectColor === i ? `0 0 0 3px ${c.dot}40` : 'none',
                transition: `all ${theme.transition}`,
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
      <button style={btnStyle} onClick={handleFinish} disabled={saving}>
        {saving ? 'Setting up...' : 'Get started'}
      </button>
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <button
          onClick={handleFinish}
          style={{
            background: 'none',
            border: 'none',
            color: theme.textTertiary,
            fontSize: theme.font.bodySmall,
            cursor: 'pointer',
            textDecoration: 'underline',
            fontFamily: 'inherit',
          }}
        >
          Skip for now
        </button>
      </div>
    </>
  );

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={progressTrackStyle}>
          <div style={progressFillStyle} />
        </div>
        <div style={{ paddingTop: 12 }}>
          <div style={stepLabelStyle}>Step {step} of 4</div>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>
      </div>
    </div>
  );
}
