/**
 * @fileoverview Authentication slice for the global store.
 * Handles user profile, JWT tokens, and login/logout logic.
 */

export const createAuthSlice = (set) => ({
  /** @type {Object|null} */
  user: JSON.parse(localStorage.getItem('dayanote_user')) || null,
  
  /** @type {string|null} */
  token: localStorage.getItem('dayanote_token') || null,
  
  /** @type {boolean} */
  needsReset: localStorage.getItem('dayanote_needsReset') === 'true',

  /**
   * Updates multiple authentication-related fields at once.
   * @param {Object} user - User profile data.
   * @param {string} token - JWT token.
   * @param {boolean} [needsReset=false] - Password reset requirement flag.
   */
  setUser: (user, token, needsReset = false) => {
    localStorage.setItem('dayanote_user', JSON.stringify(user));
    localStorage.setItem('dayanote_token', token);
    localStorage.setItem('dayanote_needsReset', needsReset);
    set({ user, token, needsReset });
  },

  /**
   * Updates only the user profile information.
   * @param {Object} user - Partial or full user profile data.
   */
  updateUser: (user) => {
    localStorage.setItem('dayanote_user', JSON.stringify(user));
    set((state) => ({ user: { ...state.user, ...user } }));
  },

  /**
   * Clears all session data from the store and localStorage.
   */
  logout: () => {
    localStorage.removeItem('dayanote_user');
    localStorage.removeItem('dayanote_token');
    localStorage.removeItem('dayanote_needsReset');
    set({ user: null, token: null, needsReset: false });
  },
});
