import { useTheme } from '../../hooks/useTheme.js';

const ROLES = [
  {
    id: 'student',
    emoji: '\u25CB',
    name: 'Student',
    desc: 'Manage assignments, study sessions, and exam prep',
  },
  {
    id: 'professional',
    emoji: '\u25CB',
    name: 'Professional',
    desc: 'Organize work tasks, meetings, and project deadlines',
  },
  {
    id: 'team_lead',
    emoji: '\u25CB',
    name: 'Team lead',
    desc: 'Coordinate team tasks, track deliverables, and plan sprints',
  },
];

export default function RoleStep({ selected, onSelect, onNext, onBack }) {
  const { theme } = useTheme();

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '24px 16px',
    maxWidth: 420,
    margin: '0 auto',
  };

  const headingStyle = {
    fontSize: theme.font.heading,
    fontWeight: 700,
    color: theme.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  };

  const subStyle = {
    fontSize: theme.font.bodySmall,
    color: theme.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  };

  const cardsStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    width: '100%',
    marginBottom: 28,
  };

  const cardStyle = (isSelected) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '16px',
    borderRadius: theme.radius.md,
    background: isSelected ? theme.accentBg : theme.bgSecondary,
    border: isSelected
      ? `2px solid ${theme.accent}`
      : `2px solid ${theme.border}`,
    cursor: 'pointer',
    transition: theme.transition,
  });

  const emojiStyle = {
    fontSize: 28,
    flexShrink: 0,
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const cardTextStyle = {
    flex: 1,
    minWidth: 0,
  };

  const roleNameStyle = (isSelected) => ({
    fontSize: theme.font.body,
    fontWeight: 600,
    color: isSelected ? theme.accent : theme.textPrimary,
    marginBottom: 2,
  });

  const roleDescStyle = {
    fontSize: theme.font.label,
    color: theme.textTertiary,
    lineHeight: 1.4,
  };

  const btnRowStyle = {
    display: 'flex',
    gap: 10,
    width: '100%',
  };

  const backBtnStyle = {
    flex: 1,
    padding: '10px 16px',
    fontSize: theme.font.body,
    fontWeight: 500,
    color: theme.textSecondary,
    background: 'transparent',
    border: `1px solid ${theme.border}`,
    borderRadius: theme.radius.md,
    cursor: 'pointer',
  };

  const nextBtnStyle = {
    flex: 2,
    padding: '10px 16px',
    fontSize: theme.font.body,
    fontWeight: 600,
    color: theme.accentBtnText,
    background: theme.accentBtn,
    border: 'none',
    borderRadius: theme.radius.md,
    cursor: selected ? 'pointer' : 'default',
    opacity: selected ? 1 : 0.5,
    transition: theme.transition,
  };

  return (
    <div style={containerStyle}>
      <div style={headingStyle}>What's your role?</div>
      <div style={subStyle}>
        We'll tailor your experience based on how you work
      </div>

      <div style={cardsStyle}>
        {ROLES.map(role => {
          const isSelected = selected === role.id;
          return (
            <div
              key={role.id}
              style={cardStyle(isSelected)}
              onClick={() => onSelect(role.id)}
            >
              <div style={emojiStyle}>{role.emoji}</div>
              <div style={cardTextStyle}>
                <div style={roleNameStyle(isSelected)}>{role.name}</div>
                <div style={roleDescStyle}>{role.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={btnRowStyle}>
        <button style={backBtnStyle} onClick={onBack}>
          Back
        </button>
        <button style={nextBtnStyle} onClick={onNext} disabled={!selected}>
          Continue
        </button>
      </div>
    </div>
  );
}
