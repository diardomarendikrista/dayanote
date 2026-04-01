import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { cn } from "../utils/cn";
import { Lock, ShieldCheck, AlertCircle } from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, token, needsReset, updateUser, setUser } = useAppStore();

  useEffect(() => {
    // If user is logged in but doesn't need reset, redirect to dashboard
    if (user && !needsReset) {
      navigate("/dashboard");
    }
    // If not logged in at all, redirect to login
    if (!user) {
      navigate("/login");
    }
  }, [user, needsReset, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:4015"}/api/users/profile`,
        { password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Successfully updated password
      updateUser(res.data.user);
      
      // Clear needsReset flag
      localStorage.removeItem('needsReset');
      // We can't easily update the store state directly if it's not a setter,
      // but setUser re-runs the logic. Or we can just logout and login.
      // Easiest is to just manually update the store if possible.
      // For now, let's just refresh the user state.
      setUser(res.data.user, token, false);
      
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to set password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden font-['Inter']",
    )}>
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/10 rounded-full blur-[150px]"></div>
      
      <div className={cn(
        "w-full max-w-md p-10 glass rounded-[2.5rem] shadow-2xl relative z-10 border border-border/50",
      )}>
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary border border-brand-primary/20">
              <Lock size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-black mb-2 tracking-tighter text-foreground font-['Outfit'] uppercase">
            Initialize Access
          </h1>
          <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase mb-8">
            Set your secure credentials
          </p>

          <div className="p-4 bg-brand-primary/5 border border-brand-primary/10 rounded-2xl text-left mb-8">
            <div className="flex gap-3">
              <ShieldCheck className="text-brand-primary shrink-0" size={18} />
              <div>
                <p className="text-[11px] font-black uppercase tracking-tight text-foreground">Security Protocol</p>
                <p className="text-[10px] font-medium text-muted-foreground leading-relaxed mt-1">
                  Your access has been initialized by an administrator. Please set a strong, 8+ character password to activate your workspace.
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 font-['Outfit']">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 font-['Outfit']">
              New Secure Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={cn(
                "w-full p-4 rounded-2xl border border-border bg-input text-foreground",
                "placeholder:text-muted-foreground focus:ring-1 focus:ring-brand-primary",
                "outline-none transition-all text-sm font-medium shadow-inner",
              )}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 font-['Outfit']">
              Confirm Credentials
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={cn(
                "w-full p-4 rounded-2xl border border-border bg-input text-foreground font-medium",
                "focus:ring-1 focus:ring-brand-primary",
                "outline-none transition-all text-sm shadow-inner",
              )}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full py-4 bg-brand-primary hover:bg-brand-hover text-white rounded-2xl font-black",
              "text-xs uppercase tracking-[0.3em] shadow-2xl shadow-brand-primary/40",
              "active:scale-[0.98] transition-all mt-4 disabled:opacity-50 cursor-pointer",
            )}
          >
            {loading ? "Processing..." : "Secure My Account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
