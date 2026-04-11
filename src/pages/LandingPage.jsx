import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme.js';
import { useAuth } from '../hooks/useAuth.js';

const SvgIcon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const features = [
  { icon: <SvgIcon d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />, title: 'Smart Scheduling', desc: 'Drag tasks onto a 24-hour timeline. Resize, reorder, and plan your day visually.' },
  { icon: <SvgIcon d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-14v4l3 3" />, title: 'Deadlines & Projects', desc: 'Track deadlines with progress pies. Organise work into colour-coded projects.' },
  { icon: <SvgIcon d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />, title: 'Focus Timer', desc: 'Built-in countdown timer with alarm. Stay focused on what matters.' },
  { icon: <SvgIcon d="M3 3v18h18M7 17V13m4 4V9m4 8V5m4 12V7" />, title: 'Analytics & Streaks', desc: 'Track your productivity over time. Build streaks and see your progress.' },
  { icon: <SvgIcon d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />, title: 'Dark Mode', desc: 'Easy on the eyes. Switch between forest light and dark themes.' },
  { icon: <SvgIcon d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />, title: 'Celebrations', desc: 'Fireworks and sounds when you complete all tasks. Because you earned it.' },
];

const personas = [
  { icon: <SvgIcon d="M12 14l9-5-9-5-9 5 9 5zm0 0v7m-9-5l9 5 9-5" />, title: 'Student', desc: 'Track assignments, revision sessions, and deadlines across all your modules.' },
  { icon: <SvgIcon d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 3h-8v4h8V3z" />, title: 'Professional', desc: 'Own your workday. Schedule meetings, deep work, and personal tasks.' },
  { icon: <SvgIcon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m22 0v-2a3 3 0 00-2-2.83M13 7a4 4 0 11-8 0 4 4 0 018 0zm4 0a3 3 0 11-6 0" />, title: 'Team Lead', desc: 'Manage project timelines and keep every deliverable on track.' },
];

export default function LandingPage() {
  const { theme } = useTheme();
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '80px 0 60px' }}>
        <h1 style={{
          fontSize: theme.font.hero, fontWeight: 700, color: theme.textPrimary,
          lineHeight: 1.1, marginBottom: 20, letterSpacing: '-1px',
        }}>
          Plan your day.<br />
          <span style={{ color: theme.accent }}>Own your time.</span>
        </h1>
        <p style={{
          fontSize: '18px', color: theme.textSecondary, maxWidth: 520,
          margin: '0 auto 36px', lineHeight: 1.6,
        }}>
          A beautiful task manager with smart scheduling, visual timelines,
          and celebrations when you finish your day.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {user ? (
            <Link to="/dashboard" style={{
              padding: '14px 36px', borderRadius: theme.radius.lg, background: theme.accentBtn,
              color: theme.accentBtnText, fontWeight: 600, fontSize: '16px', textDecoration: 'none',
            }}>Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/signup" style={{
                padding: '14px 36px', borderRadius: theme.radius.lg, background: theme.accentBtn,
                color: theme.accentBtnText, fontWeight: 600, fontSize: '16px', textDecoration: 'none',
              }}>Get started free</Link>
              <Link to="/login" style={{
                padding: '14px 36px', borderRadius: theme.radius.lg, background: 'transparent',
                color: theme.textSecondary, fontWeight: 500, fontSize: '16px', textDecoration: 'none',
                border: `1px solid ${theme.border}`,
              }}>Sign in</Link>
            </>
          )}
        </div>
      </section>

      {/* Features grid */}
      <section style={{ padding: '60px 0' }}>
        <h2 style={{
          fontSize: theme.font.headingXl, fontWeight: 600, color: theme.textPrimary,
          textAlign: 'center', marginBottom: 48,
        }}>Everything you need to own your day</h2>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 20,
        }}>
          {features.map((f, i) => (
            <div key={i} style={{
              padding: 28, borderRadius: theme.radius.lg, border: `1px solid ${theme.border}`,
              background: theme.surface, transition: 'transform 200ms, box-shadow 200ms',
              cursor: 'default',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = theme.shadow.md; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ fontSize: '28px', marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontSize: theme.font.heading, fontWeight: 600, color: theme.textPrimary, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: theme.font.body, color: theme.textSecondary, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust section */}
      <section style={{ padding: '60px 0' }}>
        <h2 style={{
          fontSize: theme.font.headingXl, fontWeight: 600, color: theme.textPrimary,
          textAlign: 'center', marginBottom: 16,
        }}>Built for students, professionals, and teams</h2>
        <p style={{ textAlign: 'center', color: theme.textSecondary, marginBottom: 48, fontSize: '15px' }}>
          Whatever your workflow, PineTask adapts to you.
        </p>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {personas.map((p, i) => (
            <div key={i} style={{
              padding: 32, borderRadius: theme.radius.lg, background: theme.accentBg,
              border: `1px solid ${theme.accentBorder}`, textAlign: 'center',
            }}>
              <div style={{ fontSize: '36px', marginBottom: 12 }}>{p.icon}</div>
              <h3 style={{ fontSize: theme.font.heading, fontWeight: 600, color: theme.textPrimary, marginBottom: 8 }}>{p.title}</h3>
              <p style={{ fontSize: theme.font.body, color: theme.textSecondary, lineHeight: 1.5 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section style={{
          padding: '60px 0', textAlign: 'center', margin: '20px 0 60px',
          borderRadius: theme.radius.xl, background: theme.accentBg,
          border: `1px solid ${theme.accentBorder}`,
        }}>
          <h2 style={{ fontSize: theme.font.headingXl, fontWeight: 600, color: theme.textPrimary, marginBottom: 16 }}>
            Start planning smarter today
          </h2>
          <p style={{ color: theme.textSecondary, marginBottom: 28, fontSize: '15px' }}>
            Free forever. No credit card required.
          </p>
          <Link to="/signup" style={{
            padding: '14px 40px', borderRadius: theme.radius.lg, background: theme.accentBtn,
            color: theme.accentBtnText, fontWeight: 600, fontSize: '16px', textDecoration: 'none',
            display: 'inline-block',
          }}>Create your free account</Link>
        </section>
      )}

      {/* Footer */}
      <footer style={{
        padding: '32px 0', borderTop: `1px solid ${theme.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 16, marginBottom: 20,
      }}>
        <div style={{ fontSize: theme.font.bodySmall, color: theme.textTertiary }}>
          PineTask &copy; 2026. Made with 🌲 in London
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <Link to="/help" style={{ fontSize: theme.font.bodySmall, color: theme.textTertiary, textDecoration: 'none' }}>Help</Link>
          <Link to="/changelog" style={{ fontSize: theme.font.bodySmall, color: theme.textTertiary, textDecoration: 'none' }}>Changelog</Link>
        </div>
      </footer>
    </div>
  );
}
