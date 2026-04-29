import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { storage, getProgress, getInterviewSessions } from '../services/storage';
import { useToast } from '../context/ToastContext';
import './Profile.css';

const Profile = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { success } = useToast();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const userData = storage.getUser();
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(userData);
    setFormData(userData);
    document.title = 'Profile | CareerMentor';
  }, [navigate]);

  const handleSave = () => {
    const updatedUser = storage.updateUser(formData);
    const users = JSON.parse(localStorage.getItem('career_mentor_users') || '[]');
    const userIndex = users.findIndex(u => u.id === updatedUser.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem('career_mentor_users', JSON.stringify(users));
    }
    setUser(updatedUser);
    i18n.changeLanguage(formData.language);
    setIsEditing(false);
    success('Profile updated!');
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  if (!user) return null;

  const progress = user.domain ? getProgress(user.domain) : [];
  const completedSteps = progress.length;
  const interviews = getInterviewSessions();
  const resumeExists = localStorage.getItem('career_mentor_resume');

  const languageLabels = {
    en: 'English',
    hi: 'हिंदी',
    mr: 'मराठी'
  };

  return (
    <div className="profile-page">
      <div className="container">
        <header className="page-header">
          <h1>{t('profile.title')}</h1>
          <button className="btn btn-secondary" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? t('cancel') : t('profile.edit')}
          </button>
        </header>

        <div className="profile-layout">
          <div className="profile-main">
            <div className="profile-card card">
              <div className="avatar-large">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              
              {isEditing ? (
                <div className="edit-form">
                  <div className="input-group">
                    <label className="input-label">{t('name')}</label>
                    <input 
                      type="text" 
                      className="input" 
                      value={formData.name} 
                      onChange={(e) => handleChange('name', e.target.value)} 
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">{t('email')}</label>
                    <input type="email" className="input" value={formData.email} disabled />
                  </div>
                  <div className="input-group">
                    <label className="input-label">{t('college')}</label>
                    <input 
                      type="text" 
                      className="input" 
                      value={formData.college} 
                      onChange={(e) => handleChange('college', e.target.value)} 
                    />
                  </div>
                  <div className="input-row">
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
                    <div className="input-group">
                      <label className="input-label">{t('language')}</label>
                      <select 
                        className="input select" 
                        value={formData.language} 
                        onChange={(e) => handleChange('language', e.target.value)}
                      >
                        <option value="en">English</option>
                        <option value="hi">हिंदी</option>
                        <option value="mr">मराठी</option>
                      </select>
                    </div>
                  </div>
                  <button className="btn btn-primary btn-full" onClick={handleSave}>
                    {t('save')}
                  </button>
                </div>
              ) : (
                <div className="profile-info">
                  <h2>{user.name}</h2>
                  <p className="email">{user.email}</p>
                  
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">{t('college')}</span>
                      <span className="info-value">{user.college || 'Not set'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">{t('year')}</span>
                      <span className="info-value">Year {user.year}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">{t('profile.domain')}</span>
                      <span className="info-value domain">{user.domain || 'Not selected'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">{t('language')}</span>
                      <span className="info-value">{languageLabels[user.language] || 'English'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="profile-stats">
            <h3>Statistics</h3>
            <div className="stats-grid">
              <div className="stat-card card">
                <span className="stat-value">{completedSteps}</span>
                <span className="stat-label">Steps Completed</span>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/roadmap')}>
                  View →
                </button>
              </div>
              <div className="stat-card card">
                <span className="stat-value">{resumeExists ? 1 : 0}</span>
                <span className="stat-label">{t('profile.resumesCreated')}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/resume')}>
                  {resumeExists ? 'Edit' : 'Create'} →
                </button>
              </div>
              <div className="stat-card card">
                <span className="stat-value">{interviews.length}</span>
                <span className="stat-label">{t('profile.interviewsDone')}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/interview')}>
                  Practice →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
