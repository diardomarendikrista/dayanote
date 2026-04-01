import { useState, useEffect } from "react";
import axios from "axios";
import { useAppStore } from "../store/useAppStore";
import { cn } from "../utils/cn";
import { X, User, Lock, CheckCircle, AlertCircle, Save } from "lucide-react";
import { toast } from "./Toast";

const SettingsModal = ({ isOpen, onClose }) => {
  const { user, token, updateUser } = useAppStore();
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' or 'security'

  useEffect(() => {
    if (user) {
      setName(user.name || "");
    }
  }, [user, isOpen]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:4015"}/api/users/profile`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateUser(res.data.user);
      toast.success("Profile updated successfully");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:4015"}/api/users/profile`,
        { password: newPassword, currentPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-sm bg-black/60 font-['Inter'] animate-in fade-in duration-300">
      <div className={cn(
        "bg-card border border-border w-full max-w-lg rounded-[2.5rem] overflow-hidden",
        "shadow-2xl animate-in zoom-in duration-300",
      )}>
        {/* Header */}
        <div className="p-8 border-b border-border/50 flex items-center justify-between bg-muted/30">
          <div>
            <h3 className="text-xl font-black text-foreground uppercase tracking-tighter font-['Outfit']">
              Personal Workspace Settings
            </h3>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 font-['Outfit']">
              Manage Identity and Credentials
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("profile")}
            className={cn(
              "flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer",
              activeTab === "profile" 
                ? "text-brand-primary border-b-2 border-brand-primary bg-brand-primary/5" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            Profile Identity
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={cn(
              "flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer",
              activeTab === "security" 
                ? "text-brand-primary border-b-2 border-brand-primary bg-brand-primary/5" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            Security & Access
          </button>
        </div>

        <div className="p-8 space-y-8">
          {activeTab === "profile" ? (
            /* Profile Form */
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Display Name
                </label>
                <div className="relative group">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className={cn(
                      "w-full pl-12 pr-4 py-3.5 bg-input border border-border rounded-2xl text-sm font-bold",
                      "focus:ring-1 focus:ring-brand-primary outline-none transition-all",
                      "placeholder:text-muted-foreground text-foreground shadow-inner",
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Email Address (Immutable)
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full px-4 py-3.5 bg-muted border border-border rounded-2xl text-sm font-bold text-muted-foreground/50 opacity-50 shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full py-4 bg-brand-primary hover:bg-brand-hover text-white rounded-2xl font-black",
                  "text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-brand-primary/20",
                  "active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2",
                )}
              >
                <Save size={14} />
                {loading ? "Updating..." : "Synchronize Identity"}
              </button>
            </form>
          ) : (
            /* Security Form */
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Current Secure Password
                </label>
                <div className="relative group">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className={cn(
                      "w-full pl-12 pr-4 py-3.5 bg-input border border-border rounded-2xl text-sm font-bold",
                      "focus:ring-1 focus:ring-brand-primary outline-none transition-all text-foreground shadow-inner",
                    )}
                  />
                </div>
              </div>

              <div className="h-px bg-border/50" />

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  New Secure Password (8+ Characters)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className={cn(
                    "w-full px-4 py-3.5 bg-input border border-border rounded-2xl text-sm font-bold",
                    "focus:ring-1 focus:ring-brand-primary outline-none transition-all text-foreground shadow-inner",
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Verify Attributes
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={cn(
                    "w-full px-4 py-3.5 bg-input border border-border rounded-2xl text-sm font-bold",
                    "focus:ring-1 focus:ring-brand-primary outline-none transition-all text-foreground shadow-inner",
                  )}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full py-4 bg-brand-primary hover:bg-brand-hover text-white rounded-2xl font-black",
                  "text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-brand-primary/20",
                  "active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2",
                )}
              >
                <Lock size={14} />
                {loading ? "Re-authorizing..." : "Update Credentials"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
