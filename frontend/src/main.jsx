/**
 * @fileoverview Frontend entry point.
 * Renders the React application and registers the service worker for PWA support.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

/**
 * Register Service Worker for PWA auto-updates.
 * The `immediate` flag ensures the SW is registered as soon as possible.
 */
registerSW({ immediate: true });

/**
 * Initialize the React application by mounting the App component to the root element.
 * Wrapping in StrictMode for additional development-time checks.
 */
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
