import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import LoadingSkeleton from '../shared/LoadingSkeleton.jsx';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <LoadingSkeleton width="60%" height={24} />
        <LoadingSkeleton width="100%" height={16} />
        <LoadingSkeleton width="80%" height={16} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
