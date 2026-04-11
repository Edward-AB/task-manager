import { useTheme } from '../../hooks/useTheme.js';
import { useNarrow } from '../../hooks/useNarrow.js';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';

export default function AppShell({ children }) {
  const { theme } = useTheme();
  const narrow = useNarrow();

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
    padding: narrow ? '16px' : '24px 32px',
    marginLeft: narrow ? 0 : 220, // sidebar width
  };

  return (
    <div style={shellStyle}>
      <Header />
      <div style={bodyStyle}>
        {!narrow && <Sidebar />}
        <main style={mainStyle}>{children}</main>
      </div>
    </div>
  );
}
