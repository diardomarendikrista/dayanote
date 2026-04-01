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

function App() {
  const { theme } = useAppStore();

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
