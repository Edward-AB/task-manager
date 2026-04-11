import { useTheme } from '../../hooks/useTheme.js';

export default function WelcomeStep({ username, onNext }) {
  const { theme } = useTheme();

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '24px 16px',
    maxWidth: 420,
    margin: '0 auto',
  };

  const logoAreaStyle = {
    width: 80,
    height: 80,
    borderRadius: theme.radius.lg,
    background: theme.accentBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  };

  const logoSvg = (
    <svg width={40} height={40} viewBox="0 0 40 40" fill="none">
      <path d="M20 4L6 14v14l14 10 14-10V14L20 4z" fill={theme.accent} opacity={0.2} />
      <path d="M20 8l-10 7v10l10 7 10-7V15L20 8z" fill={theme.accent} opacity={0.5} />
      <path d="M20 12l-6 4.5v7L20 28l6-4.5v-7L20 12z" fill={theme.accent} />
    </svg>
  );

  const headingStyle = {
    fontSize: theme.font.heading,
    fontWeight: 700,
    color: theme.textPrimary,
    marginBottom: 12,
    lineHeight: 1.3,
  };

  const descStyle = {
    fontSize: theme.font.body,
    color: theme.textSecondary,
    lineHeight: 1.6,
    marginBottom: 8,
  };

  const featuresStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    margin: '20px 0 32px',
    width: '100%',
  };

  const featureItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    borderRadius: theme.radius.md,
    background: theme.bgSecondary,
    textAlign: 'left',
  };

  const featureIconStyle = {
    width: 32,
    height: 32,
    borderRadius: theme.radius.sm,
    background: theme.accentBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: 16,
  };

  const featureTextStyle = {
    fontSize: theme.font.bodySmall,
    color: theme.textSecondary,
    lineHeight: 1.4,
  };

  const btnStyle = {
    padding: '12px 32px',
    fontSize: theme.font.body,
    fontWeight: 600,
    color: theme.accentBtnText,
    background: theme.accentBtn,
    border: 'none',
    borderRadius: theme.radius.md,
    cursor: 'pointer',
    transition: theme.transition,
    width: '100%',
  };

  const features = [
    { icon: '\u2022', text: 'Plan your day with time-blocked scheduling' },
    { icon: '\u2022', text: 'Track deadlines and project progress' },
    { icon: '\u2022', text: 'See your productivity stats and streaks' },
  ];

  return (
    <div style={containerStyle}>
      <div style={logoAreaStyle}>{logoSvg}</div>

      <div style={headingStyle}>
        Welcome to PineTask{username ? `, @${username}` : ''}!
      </div>

      <div style={descStyle}>
        Your personal task manager for focused, productive days.
      </div>

      <div style={featuresStyle}>
        {features.map((f, i) => (
          <div key={i} style={featureItemStyle}>
            <div style={featureIconStyle}>{f.icon}</div>
            <div style={featureTextStyle}>{f.text}</div>
          </div>
        ))}
      </div>

      <button style={btnStyle} onClick={onNext}>
        Let's get started
      </button>
    </div>
  );
}
