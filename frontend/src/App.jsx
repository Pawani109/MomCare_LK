/* eslint-disable react/prop-types */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Header from "./components/Header";
import Home from "./components/Home";
import Health from "./components/Health";
import Emergency from "./components/Emergency";
import Shopping from "./components/Shopping";
import Wellbeing from "./components/Wellbeing";
import Login from "./components/Login";
import Register from "./components/Register";
import PregnancyTracker from "./components/PregnancyTracker";
import Appointments from "./components/Appointments";
import CareTeam from "./components/CareTeam";

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="pt-32 text-center text-gray-400">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      {user && <Header />}

      <div className={user ? "pt-24" : ""}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
          <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/pregnancy" element={<RequireAuth><PregnancyTracker /></RequireAuth>} />
          <Route path="/appointments" element={<RequireAuth><Appointments /></RequireAuth>} />
          <Route path="/care-team" element={<RequireAuth><CareTeam /></RequireAuth>} />
          <Route path="/health" element={<RequireAuth><Health /></RequireAuth>} />
          <Route path="/emergency" element={<RequireAuth><Emergency /></RequireAuth>} />
          <Route path="/shopping" element={<RequireAuth><Shopping /></RequireAuth>} />
          <Route path="/wellbeing" element={<RequireAuth><Wellbeing /></RequireAuth>} />
        </Routes>

        <footer className="text-center text-xs text-gray-400 py-6">
          MomCare LK — CCS2313 Mini Project Demo · Group 05
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
