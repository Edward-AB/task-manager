import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';

// Layout
import AppShell from './components/layout/AppShell.jsx';
import PublicLayout from './components/layout/PublicLayout.jsx';
import PageTransition from './components/layout/PageTransition.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import AdminRoute from './components/auth/AdminRoute.jsx';

// Pages
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import ResetConfirmPage from './pages/ResetConfirmPage.jsx';
import VerifyEmailPage from './pages/VerifyEmailPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import ProjectDetailPage from './pages/ProjectDetailPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import AccountPage from './pages/AccountPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import HelpPage from './pages/HelpPage.jsx';
import ChangelogPage from './pages/ChangelogPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><SignupPage /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPasswordPage /></PageTransition>} />
        <Route path="/reset-password/:token" element={<PageTransition><ResetConfirmPage /></PageTransition>} />
        <Route path="/verify-email/:token" element={<PageTransition><VerifyEmailPage /></PageTransition>} />
      </Route>

      {/* Onboarding (auth required, minimal layout) */}
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <PageTransition><OnboardingPage /></PageTransition>
        </ProtectedRoute>
      } />

      {/* Authenticated routes */}
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route path="/dashboard" element={<PageTransition><DashboardPage /></PageTransition>} />
        <Route path="/projects" element={<PageTransition><ProjectsPage /></PageTransition>} />
        <Route path="/projects/:id" element={<PageTransition><ProjectDetailPage /></PageTransition>} />
        <Route path="/analytics" element={<PageTransition><AnalyticsPage /></PageTransition>} />
        <Route path="/account" element={<PageTransition><AccountPage /></PageTransition>} />
        <Route path="/settings" element={<PageTransition><SettingsPage /></PageTransition>} />
        <Route path="/help" element={<PageTransition><HelpPage /></PageTransition>} />
        <Route path="/changelog" element={<PageTransition><ChangelogPage /></PageTransition>} />
        <Route path="/admin" element={<AdminRoute><PageTransition><AdminPage /></PageTransition></AdminRoute>} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<PublicLayout />}>
        <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
      </Route>
    </Routes>
  );
}
