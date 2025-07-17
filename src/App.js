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

// Helper function to determine the correct theme before the first render
const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('userTheme');
  if (savedTheme) {
    return savedTheme;
  }
  const currentHour = new Date().getHours();
  // Light theme between 6 AM (inclusive) and 6 PM (exclusive)
  return (currentHour >= 6 && currentHour < 18) ? 'light' : 'dark';
};

// This is the main layout for the authenticated part of the app
// It receives the theme toggle function as a prop now
function AppLayout({ toggleTheme, theme }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { startTour } = useTour();

  useEffect(() => {
    const tourTimeout = setTimeout(() => { startTour(); }, 500);
    return () => clearTimeout(tourTimeout);
  }, [startTour]);

  const handleLogout = () => {
    logout();
    // Clear the manual theme choice on logout so the next user gets the automatic theme
    localStorage.removeItem('userTheme');
    navigate('/login');
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="navbar-brand">
          <RiLeafFill className="brand-icon" />
          <h1>EduSense</h1>
        </div>
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

// This is the top-level component that manages the theme for the entire application
function App() {
  const [theme, setTheme] = React.useState(getInitialTheme);

  // This effect applies the theme class to the body tag
  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(theme);
  }, [theme]);

  // Function to toggle the theme and save the user's choice
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
            <Route 
              path="/*" 
              element={
                <ProtectedRoute>
                  {/* Pass the theme state and toggle function down to the layout */}
                  <AppLayout theme={theme} toggleTheme={toggleTheme} />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </AuthProvider>
    </TourProvider>
  );
}

export default App;