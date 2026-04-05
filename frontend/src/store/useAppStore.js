/**
 * @fileoverview Global application state store using Zustand.
 * Manages user authentication, theme selection, reset flags, and online status.
 * Persists state to localStorage for session continuity.
 */

import { create } from 'zustand';

/**
 * @typedef {Object} AppState
 * @property {Object|null} user - The currently authenticated user object.
 * @property {string|null} token - JWT authentication token.
 * @property {string} theme - Current theme ('light' or 'dark').
 * @property {boolean} needsReset - Whether the user is forced to reset their password.
 * @property {boolean} isOnline - Current browser online status.
 * @property {Function} setUser - Sets user, token, and reset flag in state and localStorage.
 * @property {Function} updateUser - Updates the user object in state and localStorage.
 * @property {Function} logout - Clears user data and tokens from state and localStorage.
 * @property {Function} toggleTheme - Toggles between light and dark themes.
 * @property {Function} setOnlineStatus - Updates the online status in the store.
 */

/**
 * useAppStore hook.
 * 
 * @type {import('zustand').UseBoundStore<import('zustand').StoreApi<AppState>>}
 */
export const useAppStore = create((set) => ({
  /** @type {Object|null} */
  user: JSON.parse(localStorage.getItem('user')) || null,
  /** @type {string|null} */
  token: localStorage.getItem('token') || null,
  /** @type {string} */
  theme: localStorage.getItem('theme') || 'light',
  /** @type {boolean} */
  needsReset: localStorage.getItem('needsReset') === 'true',
  /** @type {boolean} */
  isOnline: navigator.onLine,

  /**
   * Updates multiple authentication-related fields at once.
   * @param {Object} user - User profile data.
   * @param {string} token - JWT token.
   * @param {boolean} [needsReset=false] - Password reset requirement flag.
   */
  setUser: (user, token, needsReset = false) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    localStorage.setItem('needsReset', needsReset);
    set({ user, token, needsReset });
  },

  /**
   * Updates only the user profile information.
   * @param {Object} user - Partial or full user profile data.
   */
  updateUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set((state) => ({ user: { ...state.user, ...user } }));
  },

  /**
   * Clears all session data from the store and localStorage.
   */
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('needsReset');
    set({ user: null, token: null, needsReset: false });
  },

  /**
   * Toggles the application theme and updates the DOM class accordingly.
   */
  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      return { theme: newTheme };
    });
  },

  /**
   * Updates the global online status indicator.
   * @param {boolean} status - True if online, false otherwise.
   */
  setOnlineStatus: (status) => set({ isOnline: status }),
}));
