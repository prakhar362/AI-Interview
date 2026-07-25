import { useState, useEffect } from 'react';
import { storage } from '../lib/storage';

export function useLocalStorage() {
  const [data, setData] = useState(() => storage.getData());

  useEffect(() => {
    const handleStorageChange = () => {
      setData(storage.getData());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const saveUserData = (user) => {
    const updatedUser = storage.setUser(user);
    setData(storage.getData());
    return updatedUser;
  };

  const addSession = (session) => {
    const newSession = storage.addSession(session);
    setData(storage.getData());
    return newSession;
  };

  return {
    userData: data.user,
    sessions: data.sessions,
    saveUserData,
    addSession,
    clearHistory: () => {
      storage.clearHistory();
      setData(storage.getData());
    }
  };
}
