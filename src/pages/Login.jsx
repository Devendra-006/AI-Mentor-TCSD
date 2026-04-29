import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { storage, apiKeyStorage } from '../services/storage';
import { useToast } from '../context/ToastContext';
import './Auth.css';


const DEMO_USER = {
  email: 'demo@careermentor.com',
  password: 'demo123'
};

const Login = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    college: '',
    year: '2',
    language: 'en'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    document.title = mode === 'login' ? 'Login | CareerMentor' : 'Sign Up | CareerMentor';
  }, [mode]);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'mr', label: 'मराठी' }
  ];

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validate = () => {
    const newErrors = {};
    
    if (mode === 'register' && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (mode === 'register' && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    
    if (mode === 'login') {
      const users = JSON.parse(localStorage.getItem('career_mentor_users') || '[]');
      const user = users.find(u => u.email === formData.email && u.password === formData.password);
      
      if (user) {
        storage.setUser(user);
        i18n.changeLanguage(user.language || 'en');
        success('Welcome back!');
        window.dispatchEvent(new Event('auth-change'));
        navigate('/dashboard');
      } else {
        error('Invalid email or password');
      }
    } else {
      const users = JSON.parse(localStorage.getItem('career_mentor_users') || '[]');
      
      if (users.find(u => u.email === formData.email)) {
        error('Email already registered');
        setLoading(false);
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        password: formData.password,
        college: formData.college,
        year: formData.year,
        language: formData.language,
        domain: null,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem('career_mentor_users', JSON.stringify(users));
      storage.setUser(newUser);
      i18n.changeLanguage(newUser.language);
      success('Account created successfully!');
      window.dispatchEvent(new Event('auth-change'));
      navigate('/domains');
    }
    
    setLoading(false);
  };

  const handleDemoLogin = () => {
    const users = JSON.parse(localStorage.getItem('career_mentor_users') || '[]');
    let demoUser = users.find(u => u.email === DEMO_USER.email);
    
    if (!demoUser) {
      demoUser = {
        id: 'demo-account',
        name: 'Demo User',
        email: DEMO_USER.email,
        password: DEMO_USER.password,
        college: 'Savitribai Phule Pune University',
        year: '2',
        language: 'en',
        domain: 'Web Development',
        isDemo: true
      };
      users.push(demoUser);
      localStorage.setItem('career_mentor_users', JSON.stringify(users));
    }
    
    storage.setUser(demoUser);
    i18n.changeLanguage(demoUser.language);
    success('Welcome to Demo Account!');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/dashboard');
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-lang-select">
          <select 
            value={i18n.language} 
            onChange={(e) => changeLanguage(e.target.value)}
            className="input select"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>
        </div>

        <div className="auth-header">
          <div className="auth-logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">CareerMentor</span>
          </div>
          
          <div className="auth-tabs">
            <button 
              className={`tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => setMode('login')}
            >
              {t('login')}
            </button>
            <button 
              className={`tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => setMode('register')}
            >
              {t('register')}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="input-group">
              <label className="input-label">{t('name')}</label>
              <input
                type="text"
                className={`input ${errors.name ? 'input-error' : ''}`}
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Rahul Patil"
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
          )}

          <div className="input-group">
            <label className="input-label">{t('email')}</label>
            <input
              type="email"
              className={`input ${errors.email ? 'input-error' : ''}`}
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="rahul@example.com"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">{t('password')}</label>
            <input
              type="password"
              className={`input ${errors.password ? 'input-error' : ''}`}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="••••••••"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {mode === 'register' && (
            <>
              <div className="input-group">
                <label className="input-label">Confirm Password</label>
                <input
                  type="password"
                  className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label className="input-label">{t('college')}</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.college}
                    onChange={(e) => handleChange('college', e.target.value)}
                    placeholder="SPPU"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">{t('year')}</label>
                  <select 
                    className="input select"
                    value={formData.year}
                    onChange={(e) => handleChange('year', e.target.value)}
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">{t('language')}</label>
                <div className="language-options">
                  {languages.map(lang => (
                    <label key={lang.code} className="radio-label">
                      <input
                        type="radio"
                        name="language"
                        value={lang.code}
                        checked={formData.language === lang.code}
                        onChange={(e) => handleChange('language', e.target.value)}
                      />
                      <span>{lang.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <span className="spinner" /> : null}
            {mode === 'login' ? t('login') : t('register')}
          </button>
        </form>

        <div className="auth-footer">
          {mode === 'login' ? (
            <>
              <p>
                Don't have an account?{' '}
                <button className="link-btn" onClick={() => setMode('register')}>
                  Sign up
                </button>
              </p>
              <div className="demo-divider">
                <span>or</span>
              </div>
              <button className="btn btn-secondary btn-full" onClick={handleDemoLogin}>
                Try Demo Account
              </button>
            </>
          ) : (
            <p>
              Already have an account?{' '}
              <button className="link-btn" onClick={() => setMode('login')}>
                Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
