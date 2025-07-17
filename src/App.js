import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { TourProvider, useTour } from './TourContext';
import Tour from './Tour';
import { AuthProvider, useAuth } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import Login from './Login';
import Dashboard from './Dashboard';
import Analytics from './Analytics';
import Admin from './Admin';
import './App.css'; 
import { RiLayoutGridFill, RiBarChart2Fill, RiLeafFill, RiSunFill, RiMoonFill, RiLogoutBoxRLine, RiShieldUserFill } from 'react-icons/ri';

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('userTheme');
  if (savedTheme) return savedTheme;
  const currentHour = new Date().getHours();
  return (currentHour >= 6 && currentHour < 18) ? 'light' : 'dark';
};

function AppLayout({ theme, toggleTheme }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { startTour } = useTour();

  useEffect(() => {
    const tourTimeout = setTimeout(() => { startTour(); }, 500);
    return () => clearTimeout(tourTimeout);
  }, [startTour]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('userTheme');
    navigate('/login');
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="navbar-brand"><RiLeafFill className="brand-icon" /><h1>EduSense</h1></div>
        <div className="nav-links">
          <NavLink to="/" end><RiLayoutGridFill /><span>Dashboard</span></NavLink>
          <NavLink to="/analytics"><RiBarChart2Fill /><span>Analytics</span></NavLink>
          {user && user.role === 'admin' && (
            <NavLink to="/admin"><RiShieldUserFill /><span>Admin</span></NavLink>
          )}
        </div>
        <div className="navbar-actions">
          <button onClick={toggleTheme} className="theme-toggle">{theme === 'dark' ? <RiSunFill /> : <RiMoonFill />}</button>
          <button onClick={handleLogout} className="logout-button"><RiLogoutBoxRLine/><span>Logout</span></button>
        </div>
      </nav>
      <main className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const [theme, setTheme] = React.useState(getInitialTheme);

  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('userTheme', newTheme);
  };

  return (
    <TourProvider>
      <AuthProvider>
        <Router>
          <Tour /> 
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<ProtectedRoute><AppLayout theme={theme} toggleTheme={toggleTheme} /></ProtectedRoute>} />
          </Routes>
        </Router>
      </AuthProvider>
    </TourProvider>
  );
}

export default App;