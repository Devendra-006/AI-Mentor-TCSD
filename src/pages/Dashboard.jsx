import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { storage, getProgress, STORAGE_KEYS } from '../services/storage';
import './Dashboard.css';

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ resumes: 0, interviews: 0 });
  const [currentStep, setCurrentStep] = useState(null);

  useEffect(() => {
    const userData = storage.getUser();
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(userData);
    document.title = 'Dashboard | CareerMentor';
    if (userData.domain) {
      const domainProgress = getProgress(userData.domain);
      const roadmap = getRoadmapData(userData.domain);
      if (roadmap) {
        const percent = Math.round((domainProgress.length / roadmap.steps.length) * 100);
        setProgress(percent);
        
        const nextStep = roadmap.steps.find(s => !domainProgress.includes(s.id));
        setCurrentStep(nextStep || roadmap.steps[roadmap.steps.length - 1]);
      }
    }

    const resumes = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESUME) || 'null');
    const interviews = JSON.parse(localStorage.getItem(STORAGE_KEYS.INTERVIEWS) || '[]');
    setStats({
      resumes: resumes ? 1 : 0,
      interviews: interviews.length
    });
  }, [navigate]);

  const getRoadmapData = (domain) => {
    const roadmaps = {
      'Web Development': { title: 'Web Dev', steps: [
        { id: 1, title: 'HTML Basics', desc: 'Tags, forms, semantic HTML' },
        { id: 2, title: 'CSS Fundamentals', desc: 'Flexbox, Grid, Responsive' },
        { id: 3, title: 'JavaScript', desc: 'DOM, Functions, Async' },
        { id: 4, title: 'React.js', desc: 'Components, Hooks' },
        { id: 5, title: 'Node.js', desc: 'Express, APIs' },
        { id: 6, title: 'Database', desc: 'SQL, MongoDB' },
        { id: 7, title: 'Git', desc: 'Version Control' },
        { id: 8, title: 'Portfolio', desc: 'Build Projects' }
      ]},
      'Data Science & ML': { title: 'Data Science', steps: [
        { id: 1, title: 'Python', desc: 'Basics, Data Structures' },
        { id: 2, title: 'Mathematics', desc: 'Linear Algebra, Stats' },
        { id: 3, title: 'Pandas', desc: 'Data Analysis' },
        { id: 4, title: 'Visualization', desc: 'Matplotlib, Seaborn' },
        { id: 5, title: 'Machine Learning', desc: 'Supervised Learning' },
        { id: 6, title: 'Deep Learning', desc: 'Neural Networks' },
        { id: 7, title: 'SQL', desc: 'Database Queries' },
        { id: 8, title: 'Projects', desc: 'End-to-End ML' }
      ]},
      'UI/UX Design': { title: 'UI/UX', steps: [
        { id: 1, title: 'Design Basics', desc: 'Color, Typography' },
        { id: 2, title: 'Figma', desc: 'UI Tool Mastery' },
        { id: 3, title: 'User Research', desc: 'Interviews, Personas' },
        { id: 4, title: 'Wireframing', desc: 'Low-fi Designs' },
        { id: 5, title: 'Design Systems', desc: 'Components, Tokens' },
        { id: 6, title: 'Accessibility', desc: 'WCAG Guidelines' },
        { id: 7, title: 'Motion', desc: 'Animations' },
        { id: 8, title: 'Portfolio', desc: 'Case Studies' }
      ]},
      'Android Development': { title: 'Android', steps: [
        { id: 1, title: 'Kotlin', desc: 'Programming Basics' },
        { id: 2, title: 'Android Studio', desc: 'Setup & Emulator' },
        { id: 3, title: 'Jetpack Compose', desc: 'Modern UI' },
        { id: 4, title: 'Lifecycle', desc: 'Activities, Fragments' },
        { id: 5, title: 'Data Storage', desc: 'Room, DataStore' },
        { id: 6, title: 'Networking', desc: 'Retrofit, APIs' },
        { id: 7, title: 'DI', desc: 'Hilt' },
        { id: 8, title: 'Publish', desc: 'Play Store' }
      ]},
      'Cybersecurity': { title: 'Cyber', steps: [
        { id: 1, title: 'Networking', desc: 'TCP/IP, Protocols' },
        { id: 2, title: 'Linux', desc: 'Commands, Scripting' },
        { id: 3, title: 'Python', desc: 'Security Scripts' },
        { id: 4, title: 'Security Basics', desc: 'CIA Triad' },
        { id: 5, title: 'Web Security', desc: 'OWASP Top 10' },
        { id: 6, title: 'CTF', desc: 'Practice' },
        { id: 7, title: 'Crypto', desc: 'Encryption' },
        { id: 8, title: 'Pen Testing', desc: 'Methodology' }
      ]}
    };
    return roadmaps[domain];
  };

  if (!user) return null;

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="dashboard-page">
      <div className="container">
        <header className="dashboard-header">
          <div>
            <h1>{t('dashboard.welcomeBack')}, {user.name?.split(' ')[0]}</h1>
            <p className="date">{today}</p>
          </div>
          {user.domain && (
            <span className="badge">{user.domain}</span>
          )}
        </header>

        <div className="metrics-row">
          <div className="metric-card">
            <div className="metric-ring">
              <svg viewBox="0 0 36 36">
                <path
                  className="ring-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="ring-fill"
                  strokeDasharray={`${progress}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="ring-text">{progress}%</span>
            </div>
            <div className="metric-info">
              <span className="metric-label">{t('nav.roadmap')}</span>
              <span className="metric-sub">{progress === 100 ? 'Completed!' : 'In progress'}</span>
            </div>
          </div>

          <div className="metric-card">
            <div className={`metric-status ${stats.resumes ? 'done' : ''}`}>
              {stats.resumes ? '✓' : '○'}
            </div>
            <div className="metric-info">
              <span className="metric-label">Resume</span>
              <span className="metric-sub">{stats.resumes ? 'Created' : 'Not created'}</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-number">{stats.interviews}</div>
            <div className="metric-info">
              <span className="metric-label">{t('nav.interview')}</span>
              <span className="metric-sub">Sessions</span>
            </div>
          </div>
        </div>

        {user.domain && currentStep && (
          <section className="section">
            <h2>Continue where you left off</h2>
            <div className="continue-card card">
              <div className="continue-step">
                <span className="step-num">{currentStep.id}</span>
                <div className="step-details">
                  <h3>{currentStep.title}</h3>
                  <p>{currentStep.desc}</p>
                </div>
              </div>
              <div className="continue-actions">
                <button className="btn btn-secondary" onClick={() => navigate('/roadmap')}>
                  View Roadmap
                </button>
                <button className="btn btn-primary" onClick={() => navigate('/resume')}>
                  Build Resume
                </button>
              </div>
            </div>
          </section>
        )}

        {!user.domain && (
          <section className="section">
            <div className="empty-state">
              <div className="empty-state-icon">◈</div>
              <h3>{t('dashboard.noDomain')}</h3>
              <p>Select a career domain to get your personalized learning path</p>
              <button className="btn btn-primary" onClick={() => navigate('/domains')}>
                Choose Domain
              </button>
            </div>
          </section>
        )}

        {user.domain && (
          <section className="section">
            <div className="section-header">
              <h2>{t('nav.roadmap')}</h2>
              <button className="btn btn-ghost" onClick={() => navigate('/roadmap')}>
                View all →
              </button>
            </div>
            <div className="roadmap-preview">
              {getRoadmapData(user.domain)?.steps.slice(0, 4).map((step, i) => {
                const domainProgress = getProgress(user.domain);
                const completed = domainProgress.includes(step.id);
                return (
                  <div key={step.id} className={`preview-step ${completed ? 'done' : ''}`}>
                    <span className="preview-step-num">
                      {completed ? '✓' : i + 1}
                    </span>
                    <span className="preview-step-title">{step.title}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button className="quick-action" onClick={() => navigate('/resume')}>
              <span className="qa-icon">☰</span>
              <span className="qa-label">{t('nav.resume')}</span>
            </button>
            <button className="quick-action" onClick={() => navigate('/interview')}>
              <span className="qa-icon">◈</span>
              <span className="qa-label">{t('nav.interview')}</span>
            </button>
            <button className="quick-action" onClick={() => navigate('/internship')}>
              <span className="qa-icon">◻</span>
              <span className="qa-label">{t('nav.internship')}</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
