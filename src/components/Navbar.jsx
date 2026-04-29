import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { storage } from '../services/storage';
import './Navbar.css';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    const userData = storage.getUser();
    setUser(userData);
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    setShowMobileMenu(false);
  }, [location]);

  const handleLogout = () => {
    storage.clearUser();
    navigate('/login');
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    if (user) {
      storage.updateUser({ language: lang });
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      localStorage.setItem('darkMode', !prev);
      return !prev;
    });
  };

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'hi', label: 'हिं' },
    { code: 'mr', label: 'मर' }
  ];

  const navLinks = user ? [
    { path: '/dashboard', label: t('nav.dashboard'), icon: '⌂' },
    { path: '/roadmap', label: t('nav.roadmap'), icon: '◎' },
    { path: '/resume', label: t('nav.resume'), icon: '☰' },
    { path: '/interview', label: t('nav.interview'), icon: '◈' },
    { path: '/internship', label: t('nav.internship'), icon: '◻' },
    { path: '/settings', label: 'Settings', icon: '⚙' },
  ] : [];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/" className="navbar-brand">
            <span className="brand-icon">◈</span>
            <span className="brand-text">{t('appName')}</span>
          </Link>
        </div>

        {user && (
          <div className={`navbar-center ${showMobileMenu ? 'mobile-open' : ''}`}>
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
              >
                <span className="nav-icon">{link.icon}</span>
                <span className="nav-label">{link.label}</span>
              </Link>
            ))}
          </div>
        )}

        <div className="navbar-right">
          {user && (
            <>
              <div className="lang-switcher">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    className={`lang-btn ${i18n.language === lang.code ? 'active' : ''}`}
                    onClick={() => changeLanguage(lang.code)}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              <button className="theme-toggle" onClick={toggleDarkMode} title="Toggle theme">
                {darkMode ? '☀' : '☾'}
              </button>

              <div className="user-menu-container">
                <button 
                  className="user-avatar"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </button>
                
                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="user-info">
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </div>
                    <div className="dropdown-divider" />
                    <Link to="/profile" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                      ⚙ {t('nav.profile')}
                    </Link>
                    <button className="dropdown-item danger" onClick={handleLogout}>
                      ↩ {t('logout')}
                    </button>
                  </div>
                )}
              </div>

              <button 
                className="mobile-menu-btn"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? '✕' : '☰'}
              </button>
            </>
          )}
        </div>
      </nav>

      {user && (
        <nav className="bottom-nav">
          {navLinks.slice(0, 5).map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`bottom-nav-item ${isActive(link.path) ? 'active' : ''}`}
            >
              <span className="bottom-nav-icon">{link.icon}</span>
              <span className="bottom-nav-label">{link.label}</span>
            </Link>
          ))}
        </nav>
      )}
    </>
  );
};

export default Navbar;
