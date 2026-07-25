const STORAGE_KEY = 'interview_sim_data_v1';

const getInitialData = () => ({
  user: {
    name: 'Candidate',
    resumeText: '',
    jdText: '',
    resumeAnalysis: null,
    jdAnalysis: null,
  },
  sessions: [],
});

export const storage = {
  getData: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return getInitialData();
      return JSON.parse(raw);
    } catch (err) {
      console.error('LocalStorage read error:', err);
      return getInitialData();
    }
  },

  saveData: (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('LocalStorage write error:', err);
    }
  },

  setUser: (userData) => {
    const current = storage.getData();
    const updated = {
      ...current,
      user: { ...current.user, ...userData }
    };
    storage.saveData(updated);
    return updated.user;
  },

  addSession: (sessionPayload) => {
    const current = storage.getData();
    const newSession = {
      id: `session_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...sessionPayload,
    };
    const updated = {
      ...current,
      sessions: [newSession, ...current.sessions],
    };
    storage.saveData(updated);
    return newSession;
  },

  getSessionById: (sessionId) => {
    const data = storage.getData();
    return data.sessions.find((s) => s.id === sessionId) || null;
  },

  clearHistory: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};
