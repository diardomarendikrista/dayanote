/**
 * @fileoverview Main Application component.
 * Sets up routing, protected routes, theme management, and global toast notifications.
 */

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAppStore } from "./store/useAppStore";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NotePage from "./pages/NotePage";
import ResetPassword from "./pages/ResetPassword";
import ToastContainer from "./components/Toast";
import { useEffect } from "react";

/**
 * A wrapper component for routes that require authentication.
 * Redirects to the login page if no token is found.
 * Redirects to the password reset page if a password reset is required.
 * 
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - The component to render if authenticated.
 * @returns {React.ReactElement}
 */
const ProtectedRoute = ({ children }) => {
  const { token, needsReset } = useAppStore();
  
  if (!token)
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  
  if (needsReset) {
    return (
      <Navigate
        to="/reset-password"
        replace
      />
    );
  }
  
  return children;
};

/**
 * Root App component.
 * Manages the global dark/light theme and defines the routing table.
 */
function App() {
  const { theme } = useAppStore();

  /**
   * Synchronize the document's dark mode class with the store's theme state.
   */
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />
        <Route
          path="/register"
          element={<Register />}
        />
        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/note/:id"
          element={<NotePage />}
        />
        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
