/**
 * @fileoverview Global application state store using Zustand.
 * Combines multiple logic slices (Auth, UI, App) into a single unified store.
 * Maintains a flat structure for backward compatibility with existing components.
 */

import { create } from 'zustand';
import { createAuthSlice } from './authSlice';
import { createUiSlice } from './uiSlice';
import { createAppSlice } from './appSlice';

/**
 * @typedef {import('./authSlice').AuthState & import('./uiSlice').UiState & import('./appSlice').AppState} FullAppState
 */

/**
 * useAppStore hook.
 * A centralized store combining Auth, UI, and App configurations.
 * 
 * @type {import('zustand').UseBoundStore<import('zustand').StoreApi<FullAppState>>}
 */
export const useAppStore = create((set, get, api) => ({
  ...createAuthSlice(set, get, api),
  ...createUiSlice(set, get, api),
  ...createAppSlice(set, get, api),
}));
