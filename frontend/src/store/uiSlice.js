/**
 * @fileoverview UI state slice for the global store.
 * Handles themes and other interface-related settings.
 */

export const createUiSlice = (set) => ({
  /** @type {string} */
  theme: localStorage.getItem('dayanote_theme') || 'dark',

  /**
   * Toggles the application theme and updates the DOM class accordingly.
   */
  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('dayanote_theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      return { theme: newTheme };
    });
  },
});
