import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { storage, apiKeyStorage } from '../services/storage';
import { aiService } from '../services/gemini';
import { useToast } from '../context/ToastContext';
import './Settings.css';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [user, setUser] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const userData = storage.getUser();
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(userData);
    setApiKey(apiKeyStorage.get() || '');
    document.title = 'Settings | CareerMentor';
  }, [navigate]);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      apiKeyStorage.set(apiKey.trim());
      success('API key saved!');
    } else {
      apiKeyStorage.clear();
      success('API key cleared');
    }
  };

  const testApiKey = async () => {
    if (!apiKey.trim()) {
      error('Please enter an API key first');
      return;
    }
    
    setTesting(true);
    apiKeyStorage.set(apiKey.trim());
    
    try {
      await aiService.generateDomainSuggestion(['building things', 'logic'], 'en');
      success('API key is working!');
    } catch (err) {
      error('Invalid API key or connection error');
      apiKeyStorage.clear();
    }
    
    setTesting(false);
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    if (user) {
      storage.updateUser({ language: lang });
      setUser({ ...user, language: lang });
    }
  };

  if (!user) return null;

  return (
    <div className="settings-page">
      <div className="container">
        <header className="page-header">
          <h1>Settings</h1>
        </header>

        <div className="settings-section card">
          <h3>AI Configuration (Gemini API)</h3>
          <p className="section-desc">
            Enter your Google Gemini API key to enable AI features. Get a free key from{' '}
            <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer">
              Google AI Studio
            </a>
          </p>
          
          <div className="api-key-input">
            <input
              type={showKey ? 'text' : 'password'}
              className="input"
              placeholder="Enter your Gemini API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <button 
              className="btn btn-ghost"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
          
          <div className="api-actions">
            <button 
              className="btn btn-secondary"
              onClick={testApiKey}
              disabled={testing || !apiKey.trim()}
            >
              {testing ? 'Testing...' : 'Test Key'}
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleSaveApiKey}
            >
              Save
            </button>
          </div>
          
          <div className="ai-status">
            <span className={`status-dot ${aiService.hasValidKey() ? 'active' : ''}`}></span>
            <span>AI Features: {aiService.hasValidKey() ? 'Enabled' : 'Demo Mode'}</span>
          </div>
        </div>

        <div className="settings-section card">
          <h3>Language Preference</h3>
          <p className="section-desc">Choose your preferred language for the interface</p>
          
          <div className="language-options">
            {[
              { code: 'en', label: 'English' },
              { code: 'hi', label: 'हिंदी (Hindi)' },
              { code: 'mr', label: 'मराठी (Marathi)' }
            ].map(lang => (
              <button
                key={lang.code}
                className={`lang-option ${user.language === lang.code ? 'active' : ''}`}
                onClick={() => changeLanguage(lang.code)}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-section card">
          <h3>Account</h3>
          <div className="account-info">
            <div className="info-row">
              <span>Name</span>
              <span>{user.name}</span>
            </div>
            <div className="info-row">
              <span>Email</span>
              <span>{user.email}</span>
            </div>
            <div className="info-row">
              <span>College</span>
              <span>{user.college || 'Not set'}</span>
            </div>
            <div className="info-row">
              <span>Domain</span>
              <span>{user.domain || 'Not selected'}</span>
            </div>
          </div>
          
          <button 
            className="btn btn-danger"
            onClick={() => {
              storage.clearUser();
              window.dispatchEvent(new Event('auth-change'));
              navigate('/login');
            }}
          >
            Logout
          </button>
        </div>

        <div className="settings-section card">
          <h3>About</h3>
          <p className="section-desc">
            <strong>AI Career Mentor</strong> v1.0<br />
            An AI-powered career guidance platform for students in India.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
