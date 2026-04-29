import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { storage, getProgress } from '../services/storage';
import { aiService } from '../services/gemini';
import './Internship.css';

const Internship = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [readiness, setReadiness] = useState('notReady');
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const platforms = {
    general: [
      { name: 'Internshala', desc: 'Internships & trainships for students', url: 'https://internshala.com' },
      { name: 'LinkedIn', desc: 'Professional networking & jobs', url: 'https://linkedin.com/jobs' },
      { name: 'Unstop', desc: 'Competitions & internships', url: 'https://unstop.com' },
      { name: 'LetsIntern', desc: 'Free internships in India', url: 'https://www.letsintern.com' },
      { name: 'Wellfound', desc: 'Startup jobs & internships', url: 'https://wellfound.com' },
      { name: 'GitHub Education', desc: 'Free developer tools', url: 'https://education.github.com' }
    ],
    webDev: [
      { name: 'freeCodeCamp', desc: 'Learn & earn certifications', url: 'https://freecodecamp.org' },
      { name: 'MLH Fellowship', desc: 'Open source fellowship', url: 'https://fellowship.mlh.io' }
    ],
    dataScience: [
      { name: 'Kaggle', desc: 'ML competitions & datasets', url: 'https://kaggle.com' },
      { name: 'Analytics Vidhya', desc: 'Data science community', url: 'https://analyticsvidhya.com' }
    ]
  };

  const tips = [
    'Keep your LinkedIn profile updated with projects and skills',
    'Write a concise cover letter highlighting your passion',
    'Apply to at least 3-5 internships per week',
    'Prepare a portfolio of your best work samples',
    'Practice technical interviews on InterviewBit'
  ];

  useEffect(() => {
    const userData = storage.getUser();
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(userData);
    document.title = 'Internship Guide | CareerMentor';

    if (userData.domain) {
      const progress = getProgress(userData.domain);
      const completedRatio = progress.length / 8;
      
      if (completedRatio >= 0.6) setReadiness('ready');
      else if (completedRatio >= 0.3) setReadiness('almost');
      else setReadiness('notReady');
    }
  }, [navigate]);

  const askQuestion = async () => {
    if (!chatQuestion.trim()) return;
    
    setLoading(true);
    const newHistory = [...chatHistory, { q: chatQuestion, a: null }];
    setChatHistory(newHistory);
    const questionToAsk = chatQuestion;
    setChatQuestion('');
    
    try {
      const answer = await aiService.answerInternshipQuestion(questionToAsk, user?.language);
      setChatHistory([...newHistory, { q: questionToAsk, a: answer }]);
    } catch (error) {
      console.error('Error:', error);
      setChatHistory([...newHistory, { q: questionToAsk, a: 'Sorry, I could not process your question. Please try again.' }]);
    }
    
    setLoading(false);
  };

  if (!user) return null;

  const getDomainKey = () => {
    const map = {
      'Web Development': 'webDev',
      'Data Science & ML': 'dataScience',
      'UI/UX Design': 'webDev',
      'Android Development': 'webDev',
      'Cybersecurity': 'webDev'
    };
    return map[user.domain] || 'general';
  };

  const allPlatforms = [...platforms.general, ...(platforms[getDomainKey()] || [])];

  const suggestions = [
    'How do I write a cover letter?',
    'What skills do I need for an internship?',
    'How to prepare my GitHub portfolio?'
  ];

  return (
    <div className="internship-page">
      <div className="container">
        <header className="page-header">
          <h1>{t('internship.title')}</h1>
          <p>{t('internship.subtitle')}</p>
        </header>

        <div className="internship-grid">
          <div className={`readiness-card card ${readiness}`}>
            <h3>{t('internship.readiness')}</h3>
            <p className="readiness-desc">{t('internship.readinessDesc')}</p>
            <div className="readiness-status">
              <span className="status-icon">
                {readiness === 'ready' ? '✓' : readiness === 'almost' ? '◷' : '○'}
              </span>
              <span className="status-text">
                {readiness === 'ready' ? t('internship.ready') : 
                 readiness === 'almost' ? t('internship.almost') : 
                 t('internship.notReady')}
              </span>
            </div>
            {readiness !== 'ready' && (
              <button className="btn btn-secondary" onClick={() => navigate('/roadmap')}>
                View Roadmap
              </button>
            )}
          </div>

          <div className="checklist-card card">
            <h3>Readiness Checklist</h3>
            <ul className="checklist">
              {['Resume Created', 'LinkedIn Profile', 'GitHub Portfolio', 'Technical Skills', 'Soft Skills'].map((item, i) => (
                <li key={i} className={i < 2 ? 'done' : ''}>
                  <span className="check-icon">{i < 2 ? '✓' : '○'}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <section className="section">
          <h2>{t('internship.platforms')} {user.domain && `for ${user.domain}`}</h2>
          <div className="platforms-grid">
            {allPlatforms.map((platform, i) => (
              <a key={i} href={platform.url} target="_blank" rel="noopener noreferrer" className="platform-card card card-hover">
                <div className="platform-info">
                  <h4>{platform.name}</h4>
                  <p>{platform.desc}</p>
                </div>
                <span className="visit-btn">Visit ↗</span>
              </a>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>{t('internship.tips')}</h2>
          <div className="tips-list card">
            {tips.map((tip, i) => (
              <div key={i} className="tip-item">
                <span className="tip-num">{i + 1}</span>
                <p>{tip}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>{t('internship.chatbot')}</h2>
          <p className="section-desc">Ask anything about internship preparation</p>
          
          <div className="suggestion-chips">
            {suggestions.map((suggestion, i) => (
              <button 
                key={i} 
                className="chip"
                onClick={() => setChatQuestion(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div className="chat-section card">
            <div className="chat-history">
              {chatHistory.map((chat, i) => (
                <div key={i} className="chat-item">
                  <div className="chat-q">
                    <strong>You:</strong> {chat.q}
                  </div>
                  {chat.a && (
                    <div className="chat-a">
                      <strong>AI:</strong> {chat.a}
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="chat-loading">
                  <span className="spinner" /> Thinking...
                </div>
              )}
            </div>
            <div className="chat-input-row">
              <input
                type="text"
                className="input"
                placeholder={t('internship.chatPlaceholder')}
                value={chatQuestion}
                onChange={(e) => setChatQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
              />
              <button className="btn btn-primary" onClick={askQuestion} disabled={loading}>
                {t('internship.ask')}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Internship;
