import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme.js';
import { useNarrow } from '../../hooks/useNarrow.js';
import { DateProvider } from '../../contexts/DateContext.jsx';
import Header from './Header.jsx';
import Sidebar, { COLLAPSED_WIDTH, EXPANDED_WIDTH } from './Sidebar.jsx';

const SIDEBAR_KEY = 'pinetask_sidebar_collapsed';

export default function AppShell({ children }) {
  const { theme } = useTheme();
  const narrow = useNarrow();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem(SIDEBAR_KEY) !== '0'
  );

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_KEY, next ? '1' : '0');
      return next;
    });
  };

  const sidebarWidth = sidebarCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  const shellStyle = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    background: theme.bg,
  };

  const bodyStyle = {
    display: 'flex',
    flex: 1,
    paddingTop: 52, // header height
  };

  const mainStyle = {
    flex: 1,
    minWidth: 0,
    padding: narrow ? '12px' : '12px 16px',
    marginLeft: narrow ? 0 : sidebarWidth,
    transition: 'margin-left 200ms ease',
  };

  return (
    <DateProvider>
      <div style={shellStyle}>
        <Header />
        <div style={bodyStyle}>
          {!narrow && <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />}
          <main style={mainStyle}>{children || <Outlet />}</main>
        </div>
      </div>
    </DateProvider>
  );
}
