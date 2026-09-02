/* eslint-disable react/prop-types */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Header from "./components/Header";
import Home from "./components/Home";
import Health from "./components/Health";
import Emergency from "./components/Emergency";
import Shopping from "./components/Shopping";
import Wellbeing from "./components/Wellbeing";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import PregnancyTracker from "./components/PregnancyTracker";
import Appointments from "./components/Appointments";
import CareTeam from "./components/CareTeam";
import FloatingAssistantBot from "./components/FloatingAssistantBot";
import SidePager from "./components/SidePager";
import SuperAdminDashboard from "./components/SuperAdminDashboard";

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="pt-32 text-center text-gray-400">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'super_admin') return <Navigate to="/admin" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "super_admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isAdmin = user?.role === 'super_admin';

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      {user && !isAdmin && <Header />}

      <div className={user ? "pt-24" : ""}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to={isAdmin ? '/admin' : '/'} replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to={isAdmin ? '/admin' : '/'} replace /> : <Register />} />
          <Route path="/forgot-password" element={user ? <Navigate to={isAdmin ? '/admin' : '/'} replace /> : <ForgotPassword />} />
          <Route path="/admin" element={<RequireAdmin><SuperAdminDashboard /></RequireAdmin>} />
          <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/pregnancy" element={<RequireAuth><PregnancyTracker /></RequireAuth>} />
          <Route path="/appointments" element={<RequireAuth><Appointments /></RequireAuth>} />
          <Route path="/care-team" element={<RequireAuth><CareTeam /></RequireAuth>} />
          <Route path="/health" element={<RequireAuth><Health /></RequireAuth>} />
          <Route path="/emergency" element={<RequireAuth><Emergency /></RequireAuth>} />
          <Route path="/shopping" element={<RequireAuth><Shopping /></RequireAuth>} />
          <Route path="/wellbeing" element={<RequireAuth><Wellbeing /></RequireAuth>} />
          <Route path="*" element={<Navigate to={isAdmin ? '/admin' : user ? '/' : '/login'} replace />} />
        </Routes>

        <FloatingAssistantBot />
        <SidePager />

        <footer className="text-center text-xs text-gray-400 py-6">
          {t.footer}
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
