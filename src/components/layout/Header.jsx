import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useDate } from '../../contexts/DateContext.jsx';
import useTimer from '../../hooks/useTimer.js';
import { formatDate, addDays } from '../../utils/dates.js';
import logoLight from '../../assets/logo-light.png';
import logoDark from '../../assets/logo-dark.png';
import ProfileDropdown from './ProfileDropdown.jsx';
import TimerPopup from '../timer/TimerPopup.jsx';
import TimerAlarmModal from '../timer/TimerAlarmModal.jsx';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: (
    <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  )},
  { to: '/projects', label: 'Projects', icon: (
    <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <rect x="1" y="2" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M1 5h12" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  )},
  { to: '/analytics', label: 'Analytics', icon: (
    <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <path d="M2 12V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5.5 12V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9 12V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12.5 12V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )},
];

export default function Header({ onToggleSidebar, sidebarCollapsed }) {
  const { theme, themeMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { date, setDate } = useDate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [timerPopupOpen, setTimerPopupOpen] = useState(false);
  const [now, setNow] = useState(new Date());
  const timerSlotRef = useRef(null);
  const { timerState, startTimer, pauseTimer, resumeTimer, cancelTimer, addTime } = useTimer();

  const lastTotalRef = useRef(null);
  if (timerState && timerState.total) lastTotalRef.current = timerState.total;

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const handleTimerClick = () => {
    if (timerState?.state === 'done') return;
    setTimerPopupOpen((o) => !o);
  };

  const handleTimerStart = (minutes) => { startTimer(minutes); setTimerPopupOpen(false); };
  const handleTimerCancel = () => { cancelTimer(); setTimerPopupOpen(false); };
  const handleAlarmRepeat = () => { if (lastTotalRef.current) startTimer(lastTotalRef.current / 60); };
  const handleAlarmDismiss = () => { cancelTimer(); };
  const handleSignOut = () => { logout(); navigate('/login'); };

  const logo = themeMode === 'dark' ? logoDark : logoLight;

  // --- Styles ---
  const headerStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, height: 48,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 16px', background: theme.headerBg,
    borderBottom: `0.5px solid ${theme.headerBorder}`, zIndex: 900,
  };

  const pillBtn = (active) => ({
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '5px 10px', fontSize: '11px', fontWeight: 500,
    color: active ? theme.accentText : theme.headerText,
    background: active ? theme.accentBg : 'transparent',
    border: `1px solid ${active ? theme.accentBorder : theme.headerBorder}`,
    borderRadius: theme.radius.xl, cursor: 'pointer',
    textDecoration: 'none', fontFamily: 'inherit',
    transition: `all ${theme.transition}`,
  });

  const navArrow = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 26, height: 26, border: `1px solid ${theme.headerBorder}`,
    borderRadius: theme.radius.sm, background: 'transparent',
    color: theme.headerText, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit',
  };

  const todayBtn = {
    padding: '3px 10px', fontSize: '11px', fontWeight: 500,
    border: `1px solid ${theme.headerBorder}`, borderRadius: theme.radius.sm,
    background: 'transparent', color: theme.headerText,
    cursor: 'pointer', fontFamily: 'inherit',
  };

  const iconBtn = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 32, height: 32, border: 'none', background: 'transparent',
    borderRadius: theme.radius.full, cursor: 'pointer',
    color: theme.headerText, transition: `background ${theme.transition}`,
  };

  const profileBtn = {
    ...iconBtn, width: 28, height: 28,
    background: theme.accent, color: theme.accentBtnText,
    fontSize: '11px', fontWeight: 700, position: 'relative',
  };

  const timerBtnStyle = {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '5px 10px', fontSize: '11px', fontWeight: 500,
    color: theme.headerText, background: 'transparent',
    border: `1px solid ${theme.headerBorder}`,
    borderRadius: theme.radius.xl, cursor: 'pointer', fontFamily: 'inherit',
  };

  const signOutBtn = {
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '5px 10px', fontSize: '11px', fontWeight: 500,
    color: theme.headerText, background: 'transparent',
    border: `1px solid ${theme.headerBorder}`,
    borderRadius: theme.radius.xl, cursor: 'pointer', fontFamily: 'inherit',
  };

  // Timer display when running/paused
  const timerActive = timerState?.state === 'running' || timerState?.state === 'paused';
  const timerDone = timerState?.state === 'done';
  const formatTimerTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const ThemeIcon = () =>
    themeMode === 'dark' ? (
      <svg width={14} height={14} viewBox="0 0 16 16" fill="none">
        <circle cx={8} cy={8} r={4} stroke="currentColor" strokeWidth={1.5} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
          const r = (a * Math.PI) / 180;
          return <line key={a} x1={8 + Math.cos(r) * 5.5} y1={8 + Math.sin(r) * 5.5} x2={8 + Math.cos(r) * 7} y2={8 + Math.sin(r) * 7} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />;
        })}
      </svg>
    ) : (
      <svg width={14} height={14} viewBox="0 0 16 16" fill="none">
        <path d="M13.5 9.5A5.5 5.5 0 016.5 2.5 5.5 5.5 0 1013.5 9.5z" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" />
      </svg>
    );

  return (
    <header style={headerStyle}>
      {/* Left: sidebar toggle + logo + nav pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {onToggleSidebar && (
          <button style={iconBtn} onClick={onToggleSidebar} aria-label={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}>
            <svg width={14} height={14} viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"/>
            </svg>
          </button>
        )}
        <Link to="/dashboard">
          <img src={logo} alt="PineTask" style={{ height: 24, display: 'block' }} />
        </Link>
        <div style={{ display: 'flex', gap: 4 }}>
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <Link key={to} to={to} style={pillBtn(location.pathname.startsWith(to))}>
              {icon}{label}
            </Link>
          ))}
        </div>
      </div>

      {/* Center: date nav */}
      {isDashboard && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button style={navArrow} onClick={() => setDate(addDays(date, -1))} aria-label="Previous day">{'\u2039'}</button>
          <span style={{ fontSize: '13px', fontWeight: 600, color: theme.headerText, whiteSpace: 'nowrap' }}>
            {formatDate(date)}
          </span>
          <button style={navArrow} onClick={() => setDate(addDays(date, 1))} aria-label="Next day">{'\u203A'}</button>
          <button style={todayBtn} onClick={() => setDate(new Date())}>Today</button>
        </div>
      )}

      {/* Right: time + timer + theme + profile + sign out */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: theme.headerText, minWidth: 40, textAlign: 'right' }}>{timeStr}</span>

        {/* Timer */}
        <div ref={timerSlotRef} style={{ position: 'relative' }}>
          {timerDone ? (
            <button style={{ ...timerBtnStyle, background: theme.danger, color: '#fff', borderColor: theme.danger, animation: 'timerPulse 1s ease-in-out infinite' }} onClick={handleTimerClick}>
              Timer Done!
            </button>
          ) : timerActive ? (
            <button style={{ ...timerBtnStyle, color: timerState.state === 'running' ? theme.success : theme.warning }} onClick={handleTimerClick}>
              <svg width={12} height={12} viewBox="0 0 16 16" fill="none"><circle cx={8} cy={8} r={6.5} stroke="currentColor" strokeWidth={1.5}/><line x1={8} y1={4} x2={8} y2={8} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"/><line x1={8} y1={8} x2={11} y2={8} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"/></svg>
              {formatTimerTime(timerState.remaining)}
            </button>
          ) : (
            <button style={timerBtnStyle} onClick={handleTimerClick}>
              <svg width={12} height={12} viewBox="0 0 16 16" fill="none"><circle cx={8} cy={8} r={6.5} stroke="currentColor" strokeWidth={1.5}/><line x1={8} y1={4} x2={8} y2={8} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"/><line x1={8} y1={8} x2={11} y2={8} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"/></svg>
              Timer
            </button>
          )}
          {timerPopupOpen && (
            <TimerPopup timerState={timerState} onStart={handleTimerStart} onPause={pauseTimer} onResume={resumeTimer} onCancel={handleTimerCancel} onAddTime={addTime} onClose={() => setTimerPopupOpen(false)} />
          )}
          {timerDone && <TimerAlarmModal onRepeat={handleAlarmRepeat} onDismiss={handleAlarmDismiss} />}
        </div>

        <button style={iconBtn} onClick={toggleTheme} aria-label="Toggle theme"><ThemeIcon /></button>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: theme.headerBorder }} />

        {/* Profile */}
        <div style={{ position: 'relative' }}>
          <button style={profileBtn} onClick={() => setProfileOpen((o) => !o)} aria-label="Profile menu">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              (user?.username || user?.email || 'U')[0].toUpperCase()
            )}
          </button>
          {profileOpen && <ProfileDropdown onClose={() => setProfileOpen(false)} />}
        </div>

        {/* Sign out */}
        <button style={signOutBtn} onClick={handleSignOut}>
          <svg width={12} height={12} viewBox="0 0 16 16" fill="none">
            <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round"/>
            <path d="M11 11l3-3-3-3" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 8H6" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round"/>
          </svg>
          Sign out
        </button>
      </div>
    </header>
  );
}
