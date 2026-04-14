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
import MessagingButton from '../messaging/MessagingButton.jsx';

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
  { to: '/teams', label: 'Teams', icon: (
    <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <circle cx="5" cy="5" r="2.2" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="10" cy="4.5" r="1.8" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M1.5 12c0-1.9 1.6-3.4 3.5-3.4s3.5 1.5 3.5 3.4M8.5 11.5c0-1.4 1.2-2.6 2.6-2.6s2.4 1.1 2.4 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
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
    position: 'fixed', top: 0, left: 0, right: 0, height: 52,
    display: 'grid', gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    padding: '0 24px', background: theme.headerBg,
    borderBottom: `0.5px solid ${theme.headerBorder}`, zIndex: 900,
  };

  const dividerStyle = {
    width: 0.5, height: 20, background: theme.headerBorder,
  };

  const navBtn = (active) => ({
    display: 'flex', alignItems: 'center', gap: 6,
    height: 30, padding: '0 14px', fontSize: 11, fontWeight: 500,
    color: active ? theme.accentText : theme.headerText,
    background: active ? theme.accentBg : 'rgba(0,0,0,0.06)',
    border: active ? `1px solid ${theme.accentBorder}` : `0.5px solid ${theme.headerBorder}`,
    borderRadius: 8, cursor: 'pointer',
    textDecoration: 'none', fontFamily: 'inherit',
    transition: `all ${theme.transition}`,
  });

  const navArrow = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'none', border: `0.5px solid ${theme.headerBorder}`,
    borderRadius: 7, padding: '4px 10px', fontSize: 14,
    color: theme.headerText, cursor: 'pointer', fontFamily: 'inherit',
  };

  const todayBtn = {
    border: `0.5px solid ${theme.headerBorder}`, borderRadius: 7,
    padding: '4px 9px', fontSize: 11, fontWeight: 500,
    background: 'none', color: theme.headerText,
    cursor: 'pointer', fontFamily: 'inherit',
  };

  const hamburgerBtn = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 32, height: 32, border: 'none', background: 'transparent',
    borderRadius: '50%', cursor: 'pointer',
    color: theme.headerText, transition: `background ${theme.transition}`,
  };

  const profileBtn = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 28, height: 28, border: 'none',
    background: theme.accent, color: theme.accentBtnText,
    fontSize: 11, fontWeight: 700, borderRadius: '50%',
    cursor: 'pointer', position: 'relative',
  };

  const timerBtnStyle = {
    display: 'flex', alignItems: 'center', gap: 5,
    height: 32, padding: '0 14px', fontSize: 11, fontWeight: 500,
    color: theme.headerText, background: 'rgba(0,0,0,0.06)',
    border: `0.5px solid ${theme.headerBorder}`,
    borderRadius: 16, cursor: 'pointer', fontFamily: 'inherit',
  };

  const themeToggleBtn = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 32, height: 32, border: `0.5px solid ${theme.headerBorder}`,
    background: 'rgba(0,0,0,0.06)', borderRadius: '50%',
    cursor: 'pointer', color: theme.headerText,
    transition: `background ${theme.transition}`,
  };

  const signOutBtn = {
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '5px 10px', fontSize: 11, fontWeight: 500,
    color: theme.headerText, background: 'transparent',
    border: `0.5px solid ${theme.headerBorder}`,
    borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
  };

  // Timer display when running/paused
  const timerActive = timerState?.state === 'running' || timerState?.state === 'paused';
  const timerDone = timerState?.state === 'done';
  const formatTimerTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const ThemeIcon = () =>
    themeMode === 'dark' ? (
      <svg width={14} height={14} viewBox="0 0 16 16" fill="none">
        <circle cx={8} cy={8} r={3.5} fill={theme.headerText}/>
        <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke={theme.headerText} strokeWidth={1.2} strokeLinecap="round"/>
      </svg>
    ) : (
      <svg width={14} height={14} viewBox="0 0 16 16" fill="none">
        <path d="M13.5 10.5A6 6 0 015.5 2.5a6 6 0 108 8z" fill={theme.headerText}/>
      </svg>
    );

  return (
    <header style={headerStyle}>
      {/* Left: sidebar toggle + logo + divider + nav buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {onToggleSidebar && (
          <button style={hamburgerBtn} onClick={onToggleSidebar} aria-label={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}>
            <svg width={14} height={14} viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"/>
            </svg>
          </button>
        )}
        <Link to="/dashboard">
          <img src={logo} alt="PineTask" style={{ height: 24, display: 'block' }} />
        </Link>
        <div style={dividerStyle} />
        <div style={{ display: 'flex', gap: 4 }}>
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <Link key={to} to={to} style={navBtn(location.pathname.startsWith(to))}>
              {icon}{label}
            </Link>
          ))}
        </div>
      </div>

      {/* Center: date nav (dashboard only) */}
      {isDashboard ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button style={navArrow} onClick={() => setDate(addDays(date, -1))} aria-label="Previous day">{'\u2039'}</button>
          <span style={{ fontSize: 12, fontWeight: 500, color: theme.headerText, minWidth: 200, textAlign: 'center', whiteSpace: 'nowrap' }}>
            {formatDate(date)}
          </span>
          <button style={navArrow} onClick={() => setDate(addDays(date, 1))} aria-label="Next day">{'\u203A'}</button>
          <button style={todayBtn} onClick={() => setDate(new Date())}>Today</button>
        </div>
      ) : (
        <div />
      )}

      {/* Right: time + divider + timer + theme toggle + divider + profile + sign out */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: theme.headerText, minWidth: 40, textAlign: 'right', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.01em' }}>{timeStr}</span>

        <div style={dividerStyle} />

        {/* Timer */}
        <div ref={timerSlotRef} style={{ position: 'relative' }}>
          {timerDone ? (
            <button style={{ ...timerBtnStyle, background: theme.danger, color: '#fff', borderColor: theme.danger, animation: 'timerPulse 1s ease-in-out infinite' }} onClick={handleTimerClick}>
              Timer Done!
            </button>
          ) : timerActive ? (
            <button style={{ ...timerBtnStyle, color: timerState.state === 'running' ? theme.success : theme.warning }} onClick={handleTimerClick}>
              <svg width={12} height={12} viewBox="0 0 16 16" fill="none"><circle cx={8} cy={8} r={6} stroke="currentColor" strokeWidth={1.3}/><path d="M8 5v3.5l2 1.5" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round"/></svg>
              {formatTimerTime(timerState.remaining)}
            </button>
          ) : (
            <button style={timerBtnStyle} onClick={handleTimerClick}>
              <svg width={12} height={12} viewBox="0 0 16 16" fill="none"><circle cx={8} cy={8} r={6} stroke="currentColor" strokeWidth={1.3}/><path d="M8 5v3.5l2 1.5" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round"/></svg>
              Timer
            </button>
          )}
          {timerPopupOpen && (
            <TimerPopup timerState={timerState} onStart={handleTimerStart} onPause={pauseTimer} onResume={resumeTimer} onCancel={handleTimerCancel} onAddTime={addTime} onClose={() => setTimerPopupOpen(false)} />
          )}
          {timerDone && <TimerAlarmModal onRepeat={handleAlarmRepeat} onDismiss={handleAlarmDismiss} />}
        </div>

        <MessagingButton />

        <button style={themeToggleBtn} onClick={toggleTheme} aria-label="Toggle theme"><ThemeIcon /></button>

        <div style={dividerStyle} />

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
          <svg width={12} height={12} viewBox="0 0 14 14" fill="none">
            <path d="M9 1h4v12H9M6 10l-4-3 4-3M2 7h8" stroke={theme.headerText} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Sign out
        </button>
      </div>
    </header>
  );
}
