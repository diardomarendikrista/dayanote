import { create } from 'zustand';

export const useAppStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  theme: localStorage.getItem('theme') || 'light',
  needsReset: localStorage.getItem('needsReset') === 'true',
  isOnline: navigator.onLine,

  setUser: (user, token, needsReset = false) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    localStorage.setItem('needsReset', needsReset);
    set({ user, token, needsReset });
  },

  updateUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set((state) => ({ user: { ...state.user, ...user } }));
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('needsReset');
    set({ user: null, token: null, needsReset: false });
  },

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      return { theme: newTheme };
    });
  },

  setOnlineStatus: (status) => set({ isOnline: status }),
}));
