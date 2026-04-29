import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { storage, saveInterviewSession, getInterviewSessions } from '../services/storage';
import { aiService } from '../services/gemini';
import { useToast } from '../context/ToastContext';
import './Interview.css';

const Interview = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { success } = useToast();
  const [user, setUser] = useState(null);
  const [interviewType, setInterviewType] = useState('technical');
  const [inSession, setInSession] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [qaHistory, setQaHistory] = useState([]);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [history, setHistory] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const userData = storage.getUser();
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(userData);
    setHistory(getInterviewSessions());
    document.title = 'Mock Interview | CareerMentor';
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [navigate, qaHistory.length]);

  const startInterview = async () => {
    setInSession(true);
    setSessionComplete(false);
    setQaHistory([]);
    setQuestionNumber(0);
    setFeedback(null);
    setUserAnswer('');
    await askQuestion();
  };

  const askQuestion = async () => {
    setLoading(true);
    try {
      const result = await aiService.conductInterview(
        user.domain,
        questionNumber + 1,
        qaHistory,
        null,
        user.language
      );
      
      if (result.question) {
        setCurrentQuestion(result.question);
        setQuestionNumber(questionNumber + 1);
      }
    } catch (error) {
      console.error('Error asking question:', error);
    }
    setLoading(false);
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) return;
    
    setLoading(true);
    const newQa = [...qaHistory, { question: currentQuestion, answer: userAnswer }];
    setQaHistory(newQa);
    
    try {
      const result = await aiService.conductInterview(
        user.domain,
        questionNumber,
        qaHistory,
        userAnswer,
        user.language
      );
      
      setFeedback(result.feedback);
      
      if (result.question && questionNumber < 5) {
        setCurrentQuestion(result.question);
        setQuestionNumber(questionNumber + 1);
        setUserAnswer('');
        setFeedback(null);
      } else {
        finishInterview();
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
    setLoading(false);
  };

  const finishInterview = () => {
    setSessionComplete(true);
    setInSession(false);
    
    const session = {
      date: new Date().toISOString(),
      domain: user.domain,
      type: interviewType,
      questionsAnswered: qaHistory.length + 1
    };
    
    saveInterviewSession(session);
    setHistory([...history, session]);
    success('Interview session completed!');
  };

  const endSession = () => {
    setInSession(false);
    setCurrentQuestion(null);
    setUserAnswer('');
    setFeedback(null);
    setQaHistory([]);
    setQuestionNumber(0);
    setSessionComplete(false);
  };

  if (!user) return null;

  const getScore = () => {
    const answered = qaHistory.length;
    return Math.min(100, Math.round((answered / 5) * 100));
  };

  return (
    <div className="interview-page">
      <div className="container">
        <header className="page-header">
          <h1>{t('interview.title')}</h1>
          <p>{t('interview.subtitle')}</p>
        </header>

        {!inSession && !sessionComplete && (
          <>
            <div className="type-selector card">
              <h3>{t('interview.selectType')}</h3>
              <div className="type-options">
                {['technical', 'hr', 'mixed'].map(type => (
                  <button
                    key={type}
                    className={`type-option ${interviewType === type ? 'active' : ''}`}
                    onClick={() => setInterviewType(type)}
                  >
                    {type === 'technical' && '◈'}
                    {type === 'hr' && '◎'}
                    {type === 'mixed' && '◻'}
                    <span>{t(`interview.${type}`)}</span>
                  </button>
                ))}
              </div>
              <div className="domain-info">
                Domain: <strong>{user.domain || 'Not selected'}</strong>
              </div>
              <button 
                className="btn btn-primary btn-full btn-lg" 
                onClick={startInterview}
                disabled={!user.domain}
              >
                {t('interview.start')}
              </button>
              {!user.domain && (
                <p className="warning-text">Select a career domain first</p>
              )}
            </div>

            {history.length > 0 && (
              <section className="section">
                <h2>{t('interview.history')}</h2>
                <div className="history-list">
                  {history.map((session, i) => (
                    <div key={i} className="history-item card">
                      <span className="history-date">{new Date(session.date).toLocaleDateString()}</span>
                      <span className="badge">{session.domain}</span>
                      <span className="history-qa">{session.questionsAnswered} Q&A</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {inSession && (
          <div className="interview-session">
            <div className="session-header card">
              <div className="session-progress">
                <span>Question {Math.min(questionNumber, 5)} of 5</span>
                <div className="progress-bar">
                  <div className="progress-fill progress-fill-primary" style={{ width: `${(Math.min(questionNumber, 5) / 5) * 100}%` }} />
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={endSession}>End Session</button>
            </div>

            <div className="chat-window">
              {qaHistory.map((qa, i) => (
                <div key={i} className="chat-message">
                  <div className="message-ai">
                    <span className="message-icon">◈</span>
                    <div className="message-bubble ai">
                      <p>{qa.question}</p>
                    </div>
                  </div>
                  <div className="message-user">
                    <div className="message-bubble user">
                      <p>{qa.answer}</p>
                    </div>
                  </div>
                </div>
              ))}

              {currentQuestion && (
                <div className="chat-message">
                  <div className="message-ai">
                    <span className="message-icon">◈</span>
                    <div className="message-bubble ai">
                      <p>{currentQuestion}</p>
                    </div>
                  </div>
                </div>
              )}

              {loading && (
                <div className="chat-message">
                  <div className="message-ai">
                    <span className="message-icon">◈</span>
                    <div className="message-bubble loading">
                      <span className="spinner" />
                    </div>
                  </div>
                </div>
              )}

              {feedback && (
                <div className="feedback-card card">
                  <h4>{t('interview.feedback')}</h4>
                  <div className="feedback-content">
                    {feedback.split('\n').map((line, i) => line.trim() && <p key={i}>{line}</p>)}
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => setFeedback(null)}>
                    Continue
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input card">
              <textarea
                className="input"
                placeholder={t('interview.yourAnswer')}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                rows={3}
                disabled={loading}
              />
              <div className="input-footer">
                <span className="char-count">{userAnswer.length} / 500</span>
                <button 
                  className="btn btn-primary" 
                  onClick={submitAnswer}
                  disabled={loading || !userAnswer.trim()}
                >
                  {t('interview.submitAnswer')}
                </button>
              </div>
            </div>
          </div>
        )}

        {sessionComplete && (
          <div className="session-complete card">
            <h2>{t('interview.summary')}</h2>
            <div className="summary-score">
              <div className="score-ring">
                <svg viewBox="0 0 36 36">
                  <path className="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="ring-fill" strokeDasharray={`${getScore()}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <span className="ring-text">{getScore()}%</span>
              </div>
            </div>
            <p className="score-message">
              {getScore() >= 80 ? t('interview.great') : getScore() >= 50 ? t('interview.good') : t('interview.needsWork')}
            </p>
            <p className="questions-summary">{qaHistory.length} questions answered</p>
            <div className="summary-actions">
              <button className="btn btn-secondary" onClick={() => { setSessionComplete(false); setQaHistory([]); }}>
                Try Again
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Interview;
