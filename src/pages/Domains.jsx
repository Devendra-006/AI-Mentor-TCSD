import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { storage } from '../services/storage';
import { aiService } from '../services/gemini';
import './Domains.css';

const domains = [
  { id: 'webDev', icon: '🌐', title: 'Web Development', desc: 'Build websites and web applications' },
  { id: 'dataScience', icon: '📊', title: 'Data Science & ML', desc: 'Analyze data and build ML models' },
  { id: 'uiux', icon: '🎨', title: 'UI/UX Design', desc: 'Design user-friendly interfaces' },
  { id: 'android', icon: '📱', title: 'Android Development', desc: 'Create mobile applications' },
  { id: 'cyber', icon: '🔒', title: 'Cybersecurity', desc: 'Protect systems from threats' },
  { id: 'cloud', icon: '☁', title: 'Cloud Computing', desc: 'Deploy and scale applications' }
];

const Domains = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);

  const quizQuestions = [
    { q: 'q1', options: 'q1a' },
    { q: 'q2', options: 'q2a' },
    { q: 'q3', options: 'q3a' },
    { q: 'q4', options: 'q4a' },
    { q: 'q5', options: 'q5a' }
  ];

  const user = storage.getUser();

  useEffect(() => {
    document.title = 'Choose Domain | CareerMentor';
  }, []);

  const selectDomain = (domainKey) => {
    const domain = domains.find(d => d.id === domainKey);
    if (!domain) return;
    
    const updatedUser = storage.updateUser({ domain: domain.title });
    const users = JSON.parse(localStorage.getItem('career_mentor_users') || '[]');
    const userIndex = users.findIndex(u => u.id === updatedUser.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem('career_mentor_users', JSON.stringify(users));
    }
    navigate('/dashboard');
  };

  const handleQuizAnswer = (answer) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (quizStep < quizQuestions.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      getAISuggestion(newAnswers);
    }
  };

  const getAISuggestion = async (finalAnswers) => {
    setLoading(true);
    try {
      const result = await aiService.generateDomainSuggestion(finalAnswers, user?.language || 'en');
      setSuggestion(result);
    } catch (error) {
      console.error('AI suggestion error:', error);
      setSuggestion({ domain: 'Web Development', reason: 'A great starting point for beginners!' });
    }
    setLoading(false);
  };

  const acceptSuggestion = () => {
    if (suggestion?.domain) {
      const domain = domains.find(d => d.title === suggestion.domain);
      if (domain) {
        selectDomain(domain.id);
      } else {
        selectDomain('webDev');
      }
    }
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setAnswers([]);
    setSuggestion(null);
    setShowQuiz(false);
  };

  return (
    <div className="domains-page">
      <div className="container">
        <header className="page-header">
          <h1>{t('domains.title')}</h1>
          <p>{t('domains.subtitle')}</p>
        </header>

        {!showQuiz && !suggestion && (
          <>
            <div className="domains-grid">
              {domains.map((domain) => (
                <button
                  key={domain.id}
                  className="domain-card card card-hover"
                  onClick={() => selectDomain(domain.id)}
                >
                  <span className="domain-icon">{domain.icon}</span>
                  <h3>{domain.title}</h3>
                  <p>{domain.desc}</p>
                </button>
              ))}
            </div>
            
            <div className="quiz-cta">
              <p>Not sure which domain to choose?</p>
              <button className="btn btn-secondary" onClick={() => setShowQuiz(true)}>
                {t('domains.helpMeChoose')}
              </button>
            </div>
          </>
        )}

        {showQuiz && !suggestion && (
          <div className="quiz-container card">
            <div className="quiz-progress">
              {quizQuestions.map((_, i) => (
                <div key={i} className={`quiz-dot ${i <= quizStep ? 'active' : ''} ${i < quizStep ? 'done' : ''}`} />
              ))}
            </div>
            
            <div className="quiz-question">
              <h3>{t(`quiz.${quizQuestions[quizStep].q}`)}</h3>
              <div className="quiz-options">
                {(t(`quiz.${quizQuestions[quizStep].options}`, { returnObjects: true }) || []).map((opt, i) => (
                  <button key={i} className="quiz-option" onClick={() => handleQuizAnswer(opt)}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            
            <button className="btn btn-ghost" onClick={resetQuiz}>{t('cancel')}</button>
          </div>
        )}

        {loading && (
          <div className="loading-state card">
            <div className="spinner" />
            <p>{t('loading')}</p>
          </div>
        )}

        {suggestion && (
          <div className="suggestion-container card">
            <div className="suggestion-icon">
              {domains.find(d => d.title === suggestion.domain)?.icon || '◈'}
            </div>
            <h2>{t('quiz.suggestion')}</h2>
            <h3 className="suggested-domain">{suggestion.domain}</h3>
            <p className="suggestion-reason">{suggestion.reason}</p>
            <div className="suggestion-actions">
              <button className="btn btn-primary" onClick={acceptSuggestion}>
                {t('quiz.accept')}
              </button>
              <button className="btn btn-secondary" onClick={resetQuiz}>
                {t('quiz.tryAgain')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Domains;
