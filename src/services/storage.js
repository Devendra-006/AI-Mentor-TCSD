const STORAGE_KEY = 'career_mentor_user';
const API_KEY_STORAGE = 'career_mentor_api_key';

export const storage = {
  getUser: () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  },
  
  setUser: (user) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  },
  
  updateUser: (updates) => {
    const current = storage.getUser();
    const updated = { ...current, ...updates };
    storage.setUser(updated);
    return updated;
  },
  
  clearUser: () => {
    localStorage.removeItem(STORAGE_KEY);
  },
  
  isAuthenticated: () => {
    return storage.getUser() !== null;
  }
};

export const apiKeyStorage = {
  get: () => {
    return localStorage.getItem(API_KEY_STORAGE) || null;
  },
  set: (key) => localStorage.setItem(API_KEY_STORAGE, key),
  clear: () => localStorage.removeItem(API_KEY_STORAGE),
  has: () => !!localStorage.getItem(API_KEY_STORAGE)
};

export const STORAGE_KEYS = {
  PROGRESS: 'career_mentor_progress',
  RESUME: 'career_mentor_resume',
  INTERVIEWS: 'career_mentor_interviews'
};

export const saveProgress = (domain, progress) => {
  const allProgress = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESS) || '{}');
  allProgress[domain] = progress;
  localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(allProgress));
};

export const getProgress = (domain) => {
  const allProgress = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESS) || '{}');
  return allProgress[domain] || [];
};

export const saveResume = (resumeData) => {
  localStorage.setItem(STORAGE_KEYS.RESUME, JSON.stringify(resumeData));
};

export const getResume = () => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.RESUME) || 'null');
};

export const saveInterviewSession = (session) => {
  const sessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.INTERVIEWS) || '[]');
  sessions.push(session);
  localStorage.setItem(STORAGE_KEYS.INTERVIEWS, JSON.stringify(sessions));
};

export const getInterviewSessions = () => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.INTERVIEWS) || '[]');
};
