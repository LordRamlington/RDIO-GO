/**
 * Recent Searches Manager
 * Persists the user's last 5 search queries in localStorage.
 */

export const RECENT_SEARCHES_KEY = 'rdiogo_recent_searches';
export const MAX_RECENT_SEARCHES = 5;

const STORAGE_EVENT = 'rdiogo_recent_searches_updated';

export function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      .slice(0, MAX_RECENT_SEARCHES);
  } catch (err) {
    console.warn('Failed reading recent searches from localStorage:', err);
    return [];
  }
}

export function saveRecentSearch(rawTerm: string): string[] {
  if (typeof window === 'undefined') return [];
  const term = rawTerm.trim();
  if (!term) return getRecentSearches();

  try {
    const current = getRecentSearches();
    // Remove duplicate (case-insensitive)
    const filtered = current.filter((item) => item.toLowerCase() !== term.toLowerCase());
    // Prepend latest query and cap to max 5
    const updated = [term, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(STORAGE_EVENT));
    return updated;
  } catch (err) {
    console.warn('Failed saving recent search to localStorage:', err);
    return getRecentSearches();
  }
}

export function removeRecentSearch(termToRemove: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getRecentSearches();
    const updated = current.filter((item) => item.toLowerCase() !== termToRemove.toLowerCase());
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(STORAGE_EVENT));
    return updated;
  } catch (err) {
    console.warn('Failed removing recent search from localStorage:', err);
    return getRecentSearches();
  }
}

export function clearRecentSearches(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    window.dispatchEvent(new Event(STORAGE_EVENT));
  } catch (err) {
    console.warn('Failed clearing recent searches from localStorage:', err);
  }
}

/**
 * React hook helper to subscribe to recent search updates across components
 */
import { useState, useEffect } from 'react';

export function useRecentSearches(): {
  recentSearches: string[];
  addSearch: (query: string) => void;
  removeSearch: (query: string) => void;
  clearSearches: () => void;
} {
  const [recentSearches, setRecentSearches] = useState<string[]>(() => getRecentSearches());

  useEffect(() => {
    const handleUpdate = () => {
      setRecentSearches(getRecentSearches());
    };

    window.addEventListener(STORAGE_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(STORAGE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return {
    recentSearches,
    addSearch: (query: string) => {
      const updated = saveRecentSearch(query);
      setRecentSearches(updated);
    },
    removeSearch: (query: string) => {
      const updated = removeRecentSearch(query);
      setRecentSearches(updated);
    },
    clearSearches: () => {
      clearRecentSearches();
      setRecentSearches([]);
    },
  };
}
