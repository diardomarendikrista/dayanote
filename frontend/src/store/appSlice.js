/**
 * @fileoverview Application-wide configuration and status slice for the global store.
 * Handles online status, versioning, and other global metadata.
 */

export const createAppSlice = (set) => ({
  /** @type {boolean} */
  isOnline: navigator.onLine,

  /** @type {string} Source of Truth for the application version */
  version: "0.3.2",

  /**
   * Updates the global online status indicator.
   * @param {boolean} status - True if online, false otherwise.
   */
  setOnlineStatus: (status) => set({ isOnline: status }),
});
