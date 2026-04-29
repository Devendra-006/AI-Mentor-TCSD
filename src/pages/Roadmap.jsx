import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { storage, saveProgress, getProgress } from '../services/storage';
import './Roadmap.css';

const Roadmap = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);

  useEffect(() => {
    const userData = storage.getUser();
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(userData);
    document.title = 'Roadmap | CareerMentor';
    const domainKey = {
      'Web Development': 'webDev',
      'Data Science & ML': 'dataScience',
      'UI/UX Design': 'uiux',
      'Android Development': 'android',
      'Cybersecurity': 'cyber'
    }[userData.domain];

    const roadmaps = {
      webDev: [
        { id: 1, title: 'HTML Basics', desc: 'Tags, forms, semantic HTML', time: '3 days', resources: [{ label: 'MDN', url: '#' }, { label: 'FreeCodeCamp', url: '#' }] },
        { id: 2, title: 'CSS Fundamentals', desc: 'Flexbox, Grid, Responsive design', time: '4 days', resources: [{ label: 'CSS Tricks', url: '#' }] },
        { id: 3, title: 'JavaScript', desc: 'DOM manipulation, Functions, Async', time: '1 week', resources: [{ label: 'JavaScript.info', url: '#' }] },
        { id: 4, title: 'React.js', desc: 'Components, Hooks, State', time: '1 week', resources: [{ label: 'React Docs', url: '#' }] },
        { id: 5, title: 'Node.js', desc: 'Express, REST APIs', time: '1 week', resources: [] },
        { id: 6, title: 'Database', desc: 'SQL basics, MongoDB', time: '4 days', resources: [] },
        { id: 7, title: 'Git', desc: 'Version control, GitHub workflows', time: '2 days', resources: [] },
        { id: 8, title: 'Build Portfolio', desc: 'Create 3-5 showcase projects', time: '2 weeks', resources: [] }
      ],
      dataScience: [
        { id: 1, title: 'Python', desc: 'Basics, data structures, functions', time: '1 week', resources: [] },
        { id: 2, title: 'Mathematics', desc: 'Linear algebra, statistics', time: '1 week', resources: [] },
        { id: 3, title: 'Pandas', desc: 'DataFrames, data cleaning', time: '4 days', resources: [] },
        { id: 4, title: 'Visualization', desc: 'Matplotlib, Seaborn', time: '3 days', resources: [] },
        { id: 5, title: 'Machine Learning', desc: 'Supervised learning, regression', time: '2 weeks', resources: [] },
        { id: 6, title: 'Deep Learning', desc: 'Neural networks basics', time: '2 weeks', resources: [] },
        { id: 7, title: 'SQL', desc: 'Advanced queries', time: '3 days', resources: [] },
        { id: 8, title: 'ML Projects', desc: 'Complete 3-5 end-to-end projects', time: '2 weeks', resources: [] }
      ],
      uiux: [
        { id: 1, title: 'Design Basics', desc: 'Color theory, typography, layout', time: '3 days', resources: [] },
        { id: 2, title: 'Figma', desc: 'UI tool mastery', time: '1 week', resources: [] },
        { id: 3, title: 'User Research', desc: 'Interviews, personas, journeys', time: '4 days', resources: [] },
        { id: 4, title: 'Wireframing', desc: 'Low-fi designs, prototypes', time: '3 days', resources: [] },
        { id: 5, title: 'Design Systems', desc: 'Components, design tokens', time: '4 days', resources: [] },
        { id: 6, title: 'Accessibility', desc: 'WCAG guidelines', time: '2 days', resources: [] },
        { id: 7, title: 'Motion', desc: 'Animations, micro-interactions', time: '3 days', resources: [] },
        { id: 8, title: 'Portfolio', desc: 'Create case studies', time: '1 week', resources: [] }
      ],
      android: [
        { id: 1, title: 'Kotlin', desc: 'Programming basics', time: '1 week', resources: [] },
        { id: 2, title: 'Android Studio', desc: 'Setup & emulator', time: '2 days', resources: [] },
        { id: 3, title: 'Jetpack Compose', desc: 'Modern declarative UI', time: '1 week', resources: [] },
        { id: 4, title: 'Lifecycle', desc: 'Activities, fragments', time: '3 days', resources: [] },
        { id: 5, title: 'Data Storage', desc: 'Room, DataStore', time: '4 days', resources: [] },
        { id: 6, title: 'Networking', desc: 'Retrofit, APIs', time: '4 days', resources: [] },
        { id: 7, title: 'DI', desc: 'Hilt basics', time: '2 days', resources: [] },
        { id: 8, title: 'Publish', desc: 'Build & publish to Play Store', time: '3 days', resources: [] }
      ],
      cyber: [
        { id: 1, title: 'Networking', desc: 'TCP/IP, protocols', time: '1 week', resources: [] },
        { id: 2, title: 'Linux', desc: 'Commands, scripting', time: '1 week', resources: [] },
        { id: 3, title: 'Python', desc: 'Security scripting', time: '1 week', resources: [] },
        { id: 4, title: 'Security Basics', desc: 'CIA triad, threats', time: '3 days', resources: [] },
        { id: 5, title: 'Web Security', desc: 'OWASP Top 10', time: '1 week', resources: [] },
        { id: 6, title: 'CTF Practice', desc: 'TryHackMe, HackTheBox', time: '2 weeks', resources: [] },
        { id: 7, title: 'Cryptography', desc: 'Encryption, hashing', time: '3 days', resources: [] },
        { id: 8, title: 'Pen Testing', desc: 'Methodology, tools', time: '1 week', resources: [] }
      ]
    };

    if (domainKey && roadmaps[domainKey]) {
      setRoadmap(roadmaps[domainKey]);
      const progress = getProgress(userData.domain);
      setCompletedSteps(progress);
    }
  }, [navigate]);

  const toggleStep = (stepId) => {
    if (!user || !roadmap) return;
    
    let newCompleted;
    if (completedSteps.includes(stepId)) {
      newCompleted = completedSteps.filter(id => id !== stepId);
    } else {
      newCompleted = [...completedSteps, stepId];
    }
    
    setCompletedSteps(newCompleted);
    saveProgress(user.domain, newCompleted);
  };

  const progress = roadmap ? Math.round((completedSteps.length / roadmap.length) * 100) : 0;

  if (!user) return null;

  if (!user.domain) {
    return (
      <div className="roadmap-page">
        <div className="container">
          <div className="empty-state card">
            <div className="empty-state-icon">◎</div>
            <h3>{t('dashboard.noDomain')}</h3>
            <p>Select a career domain to see your learning path</p>
            <button className="btn btn-primary" onClick={() => navigate('/domains')}>
              Choose Domain
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="roadmap-page">
      <div className="container">
        <header className="page-header">
          <div>
            <h1>{t('roadmap.title')}</h1>
            <p className="domain-badge">{user.domain}</p>
          </div>
        </header>

        <div className="progress-section card">
          <div className="progress-header">
            <span>{t('roadmap.progress')}</span>
            <span className="progress-percent">{progress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-meta">
            <span>{completedSteps.length} of {roadmap?.length} completed</span>
          </div>
        </div>

        {progress === 100 && (
          <div className="completion-banner card">
            <span>🎉</span>
            <p>{t('roadmap.allComplete')}</p>
          </div>
        )}

        <div className="roadmap-list">
          {roadmap?.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isLocked = index > 0 && !completedSteps.includes(roadmap[index - 1].id) && !isCompleted;
            
            return (
              <div 
                key={step.id} 
                className={`roadmap-step card ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
              >
                <div className="step-timeline">
                  <div className={`step-circle ${isCompleted ? 'done' : ''}`}>
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  {index < roadmap.length - 1 && (
                    <div className={`step-line ${isCompleted ? 'done' : ''}`} />
                  )}
                </div>
                
                <div className="step-content">
                  <div className="step-header">
                    <h3>{step.title}</h3>
                    <span className="time-badge">{step.time}</span>
                  </div>
                  <p>{step.desc}</p>
                  
                  {step.resources?.length > 0 && (
                    <div className="step-resources">
                      {step.resources.map((res, i) => (
                        <a key={i} href={res.url} target="_blank" rel="noopener noreferrer" className="resource-link">
                          {res.label} ↗
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                
                <button 
                  className={`btn ${isCompleted ? 'btn-success' : 'btn-secondary'} btn-sm`}
                  onClick={() => toggleStep(step.id)}
                  disabled={isLocked}
                >
                  {isCompleted ? '✓ Done' : 'Mark done'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
