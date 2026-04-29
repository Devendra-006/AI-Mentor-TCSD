import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Domains from './pages/Domains';
import Roadmap from './pages/Roadmap';
import ResumeBuilder from './pages/ResumeBuilder';
import Interview from './pages/Interview';
import Internship from './pages/Internship';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import { storage } from './services/storage';
import { ToastProvider } from './context/ToastContext';
import './services/i18n';
import './styles/global.css';
import './App.css';

function App() {
  const [user, setUser] = useState(() => storage.getUser());

  const refreshAuth = useCallback(() => {
    setUser(storage.getUser());
  }, []);

  useEffect(() => {
    // Listen for auth changes (login/logout) from any component
    window.addEventListener('auth-change', refreshAuth);
    return () => window.removeEventListener('auth-change', refreshAuth);
  }, [refreshAuth]);

  return (
    <ToastProvider>
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <main className={`main-content ${user ? 'has-sidebar' : ''}`}>
            <Routes>
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/domains" element={user ? <Domains /> : <Navigate to="/login" />} />
              <Route path="/roadmap" element={user ? <Roadmap /> : <Navigate to="/login" />} />
              <Route path="/resume" element={user ? <ResumeBuilder /> : <Navigate to="/login" />} />
              <Route path="/interview" element={user ? <Interview /> : <Navigate to="/login" />} />
              <Route path="/internship" element={user ? <Internship /> : <Navigate to="/login" />} />
              <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
              <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
              <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
