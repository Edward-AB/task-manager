import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme.js';
import { useDate } from '../../contexts/DateContext.jsx';
import useTimer from '../../hooks/useTimer.js';
import { formatDate, addDays, dateKey } from '../../utils/dates.js';
import logoLight from '../../assets/logo-light.png';
import logoDark from '../../assets/logo-dark.png';
import ProfileDropdown from './ProfileDropdown.jsx';
import Tooltip from '../shared/Tooltip.jsx';
import TimerButton from '../timer/TimerButton.jsx';
import TimerPopup from '../timer/TimerPopup.jsx';
import TimerAlarmModal from '../timer/TimerAlarmModal.jsx';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/projects', label: 'Projects' },
  { to: '/analytics', label: 'Analytics' },
];

export default function Header() {
  const { theme, themeMode, toggleTheme } = useTheme();
  const location = useLocation();
  const { date, setDate } = useDate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [timerPopupOpen, setTimerPopupOpen] = useState(false);
  const [now, setNow] = useState(new Date());
  const timerSlotRef = useRef(null);
  const { timerState, startTimer, pauseTimer, resumeTimer, cancelTimer, addTime } = useTimer();

  const lastTotalRef = useRef(null);
  if (timerState && timerState.total) lastTotalRef.current = timerState.total;

  // Update clock every 30 seconds
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const handleTimerButtonClick = () => {
    if (timerState?.state === 'done') {
      // alarm modal handles this -- no popup toggle
      return;
    }
    setTimerPopupOpen((o) => !o);
  };

  const handleTimerStart = (minutes) => {
    startTimer(minutes);
    setTimerPopupOpen(false);
  };

  const handleTimerCancel = () => {
    cancelTimer();
    setTimerPopupOpen(false);
  };

  const handleAlarmRepeat = () => {
    const totalSeconds = lastTotalRef.current;
    if (totalSeconds) {
      startTimer(totalSeconds / 60);
    }
  };

  const handleAlarmDismiss = () => {
    cancelTimer();
  };

  const logo = themeMode === 'dark' ? logoDark : logoLight;

  const headerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: 52,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    background: theme.headerBg,
    borderBottom: `1px solid ${theme.headerBorder}`,
    zIndex: 900,
  };

  const leftStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  };

  const logoStyle = {
    height: 26,
    display: 'block',
  };

  const navStyle = {
    display: 'flex',
    gap: '4px',
  };

  const linkStyle = (active) => ({
    padding: '6px 12px',
    fontSize: theme.font.body,
    fontWeight: active ? 600 : 500,
    color: active ? theme.accent : theme.headerText,
    textDecoration: 'none',
    borderRadius: theme.radius.sm,
    background: active ? `${theme.accent}15` : 'transparent',
    transition: `all ${theme.transition}`,
  });

  const rightStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const iconBtnStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
    border: 'none',
    background: 'transparent',
    borderRadius: theme.radius.sm,
    cursor: 'pointer',
    color: theme.headerText,
    fontSize: '16px',
    transition: `background ${theme.transition}`,
  };

  const profileBtnStyle = {
    ...iconBtnStyle,
    width: 30,
    height: 30,
    borderRadius: theme.radius.full,
    background: theme.accent,
    color: theme.accentBtnText,
    fontSize: '12px',
    fontWeight: 700,
    position: 'relative',
  };

  // Sun / moon icon via SVG for crisp rendering
  const ThemeIcon = () =>
    themeMode === 'dark' ? (
      <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
        <circle cx={8} cy={8} r={4} stroke="currentColor" strokeWidth={1.5} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
          const rad = (a * Math.PI) / 180;
          return (
            <line
              key={a}
              x1={8 + Math.cos(rad) * 5.5}
              y1={8 + Math.sin(rad) * 5.5}
              x2={8 + Math.cos(rad) * 7}
              y2={8 + Math.sin(rad) * 7}
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    ) : (
      <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
        <path
          d="M13.5 9.5A5.5 5.5 0 016.5 2.5 5.5 5.5 0 1013.5 9.5z"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      </svg>
    );

  const dateNavStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const navArrowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    border: `1px solid ${theme.border}`,
    borderRadius: theme.radius.sm,
    background: 'transparent',
    color: theme.headerText,
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: 'inherit',
  };

  const todayBtnStyle = {
    padding: '4px 12px',
    fontSize: theme.font.bodySmall,
    fontWeight: 500,
    border: `1px solid ${theme.border}`,
    borderRadius: theme.radius.sm,
    background: 'transparent',
    color: theme.headerText,
    cursor: 'pointer',
    fontFamily: 'inherit',
  };

  const clockStyle = {
    fontSize: theme.font.body,
    fontWeight: 600,
    color: theme.headerText,
    minWidth: 44,
    textAlign: 'right',
  };

  return (
    <header style={headerStyle}>
      <div style={leftStyle}>
        <Link to="/dashboard">
          <img src={logo} alt="PineTask" style={logoStyle} />
        </Link>
        <nav style={navStyle}>
          {NAV_LINKS.map(({ to, label }) => (
            <Link key={to} to={to} style={linkStyle(location.pathname.startsWith(to))}>
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Center: Date navigation */}
      {isDashboard && (
        <div style={dateNavStyle}>
          <button style={navArrowStyle} onClick={() => setDate(addDays(date, -1))} aria-label="Previous day">
            {'\u2039'}
          </button>
          <span style={{ fontSize: theme.font.body, fontWeight: 600, color: theme.headerText, whiteSpace: 'nowrap' }}>
            {formatDate(date)}
          </span>
          <button style={navArrowStyle} onClick={() => setDate(addDays(date, 1))} aria-label="Next day">
            {'\u203A'}
          </button>
          <button
            style={todayBtnStyle}
            onClick={() => setDate(new Date())}
          >
            Today
          </button>
        </div>
      )}

      <div style={rightStyle}>
        {/* Clock */}
        <span style={clockStyle}>{timeStr}</span>

        {/* Timer */}
        <div ref={timerSlotRef} style={{ position: 'relative' }}>
          <TimerButton timerState={timerState} onClick={handleTimerButtonClick} />
          {timerPopupOpen && (
            <TimerPopup
              timerState={timerState}
              onStart={handleTimerStart}
              onPause={pauseTimer}
              onResume={resumeTimer}
              onCancel={handleTimerCancel}
              onAddTime={addTime}
              onClose={() => setTimerPopupOpen(false)}
            />
          )}
          {timerState?.state === 'done' && (
            <TimerAlarmModal onRepeat={handleAlarmRepeat} onDismiss={handleAlarmDismiss} />
          )}
        </div>

        <Tooltip text={themeMode === 'dark' ? 'Light mode' : 'Dark mode'}>
          <button style={iconBtnStyle} onClick={toggleTheme} aria-label="Toggle theme">
            <ThemeIcon />
          </button>
        </Tooltip>

        <div style={{ position: 'relative' }}>
          <button
            style={profileBtnStyle}
            onClick={() => setProfileOpen((o) => !o)}
            aria-label="Profile menu"
          >
            P
          </button>
          {profileOpen && <ProfileDropdown onClose={() => setProfileOpen(false)} />}
        </div>
      </div>
    </header>
  );
}
