import { useState, useEffect, useCallback } from 'react';

export interface ProtectionLogEntry {
  id: string;
  timestamp: number;
  target: string;
  detectedCount: number;
  blockedCount: number;
  autoStopEnabled: boolean;
}

const STORAGE_KEY = 'privacy_protection_log';
const MAX_ENTRIES = 100;

function loadLogFromStorage(): ProtectionLogEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load protection log:', error);
  }
  return [];
}

function saveLogToStorage(entries: ProtectionLogEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn('Failed to save protection log:', error);
  }
}

export function useProtectionLog() {
  const [entries, setEntries] = useState<ProtectionLogEntry[]>(loadLogFromStorage);

  useEffect(() => {
    saveLogToStorage(entries);
  }, [entries]);

  const addEntry = useCallback((entry: Omit<ProtectionLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: ProtectionLogEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    setEntries(prev => {
      const updated = [newEntry, ...prev];
      return updated.slice(0, MAX_ENTRIES);
    });
  }, []);

  const clearLog = useCallback(() => {
    setEntries([]);
  }, []);

  return {
    entries,
    addEntry,
    clearLog,
  };
}
