/**
 * @fileoverview Login page component.
 * Handles user authentication, token storage, and redirection to the dashboard.
 * Includes support for mandatory password reset after administrative resets.
 */

import { useState, useEffect } from "react";
import axios from "../axios/axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { cn } from "../utils/cn";

/**
 * Login component.
 *
 * @component
 * @returns {React.ReactElement}
 */
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser, token } = useAppStore();

  /**
   * Redirect to dashboard if user is already authenticated.
   */
  useEffect(() => {
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [token, navigate]);

  /**
   * Handles the login form submission.
   * Authenticates the user and navigates either to the dashboard or to the password reset page.
   * @async
   * @param {React.FormEvent} e - Form event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      const { user, token, needsReset } = res.data;
      setUser(user, token, needsReset);

      if (needsReset) {
        navigate("/reset-password");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden font-['Inter']",
      )}
    >
      <div>
        {/* Background Orbs with Brand Colors */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/10 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-primary/5 rounded-full blur-[150px] animate-pulse delay-1000"></div>

        <div
          className={cn(
            "w-full max-w-md p-12 glass rounded-[2.5rem] shadow-2xl relative z-10 border border-border/50",
          )}
        >
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div
                className={cn(
                  "w-16 h-16 bg-brand-primary rounded-2xl rotate-45 flex items-center justify-center shadow-2xl shadow-brand-primary/20",
                )}
              >
                <span className="text-white text-3xl font-black -rotate-45">
                  D
                </span>
              </div>
            </div>
            <h1 className="text-4xl font-black mb-2 tracking-tighter text-foreground">
              DAYA<span className="text-brand-primary">NOTE</span>
            </h1>
            <p className="text-stone-500 font-medium text-sm tracking-widest uppercase">
              Collaborative Intelligence
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-[11px] font-bold uppercase tracking-wider flex items-center gap-3 font-['Outfit']">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-stone-400 ml-1 font-['Outfit']">
                Email Identification
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="user@dayalima.com"
                className={cn(
                  "w-full p-4 rounded-2xl border border-border bg-input text-foreground",
                  "placeholder:text-muted-foreground focus:ring-1 focus:ring-brand-primary focus:border-brand-primary",
                  "outline-none transition-all text-sm font-medium shadow-inner",
                )}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-stone-400 ml-1 font-['Outfit']">
                Secure Access
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full p-4 rounded-2xl border border-stone-700 bg-stone-900 text-white placeholder:text-stone-500 focus:ring-1 focus:ring-[#a81c1c] focus:border-[#a81c1c] outline-none transition-all text-sm font-medium shadow-inner"
              />
            </div>
            <button
              type="submit"
              className={cn(
                "w-full py-4 bg-brand-primary hover:bg-brand-hover text-white rounded-2xl font-black",
                "text-xs uppercase tracking-[0.2em] shadow-2xl shadow-brand-primary/30",
                "active:scale-[0.98] transition-all mt-4 cursor-pointer",
              )}
            >
              Authenticate
            </button>
          </form>

          <p className="mt-10 text-center text-[11px] font-black uppercase tracking-[0.2em] text-stone-600 font-['Outfit']">
            New to the system?{" "}
            <Link
              to="/register"
              className="text-brand-primary hover:text-foreground transition-colors ml-1"
            >
              Create Account
            </Link>
          </p>
        </div>

        <div className="text-center w-full px-4 mt-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-600 font-['Outfit']">
            &copy;2026 DayaTechnology
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
