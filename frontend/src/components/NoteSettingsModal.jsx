import { useState, useEffect } from "react";
import axios from "axios";
import {
  X,
  Globe,
  Lock,
  UserPlus,
  Trash2,
  Shield,
  ShieldCheck,
  Mail,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "./Toast";
import { cn } from "../utils/cn";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4015";

const NoteSettingsModal = ({ isOpen, onClose, note, onUpdate, token }) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch full note data (with collaborator list) whenever modal opens
  useEffect(() => {
    if (isOpen && note?.id) {
      const fetchFullNote = async () => {
        try {
          const res = await axios.get(`${API_URL}/api/notes/${note.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          onUpdate(res.data);
        } catch (err) {
          console.error("Failed to refresh note details", err);
        }
      };
      fetchFullNote();
    }
  }, [isOpen, note?.id, token]);

  if (!isOpen || !note) return null;

  const handleTogglePublic = async () => {
    try {
      const res = await axios.put(
        `${API_URL}/api/notes/${note.id}`,
        { isPublic: !note.isPublic, publicRole: note.publicRole || "VIEWER" },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onUpdate(res.data);
      toast.info(`Note is now ${!note.isPublic ? "Public" : "Private"}`);
    } catch (err) {
      toast.error("Failed to update privacy");
    }
  };

  const handleUpdatePublicRole = async (newRole) => {
    try {
      const res = await axios.put(
        `${API_URL}/api/notes/${note.id}`,
        { publicRole: newRole },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onUpdate(res.data);
      toast.info(`Public access changed to ${newRole}`);
    } catch (err) {
      toast.error("Failed to update public role");
    }
  };

  const handleAddPermission = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/notes/${note.id}/permissions`,
        { email, role },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(`Shared with ${email}`);
      setEmail("");
      // Refresh note data
      const res = await axios.get(`${API_URL}/api/notes/${note.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onUpdate(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to share");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePermission = async (targetEmail, newRole) => {
    try {
      await axios.post(
        `${API_URL}/api/notes/${note.id}/permissions`,
        { email: targetEmail, role: newRole },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(`Role updated for ${targetEmail}`);
      // Refresh note data
      const res = await axios.get(`${API_URL}/api/notes/${note.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onUpdate(res.data);
    } catch (err) {
      toast.error("Failed to update role");
    }
  };

  const handleRemovePermission = async (userId) => {
    try {
      await axios.delete(
        `${API_URL}/api/notes/${note.id}/permissions/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Collaborator removed");
      const res = await axios.get(`${API_URL}/api/notes/${note.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onUpdate(res.data);
    } catch (err) {
      toast.error("Failed to remove collaborator");
    }
  };

  const copyLink = () => {
    const shareUrl = `${window.location.origin}/note/${note.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copied!");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-black/60 font-['Inter']">
      <div className="bg-[#12100f] border border-stone-800 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-8 border-b border-stone-800/50 flex items-center justify-between bg-[#161412]">
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">
              Access Control
            </h3>
            <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest mt-1 font-['Outfit']">
              Configure Note Permissions
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Public Link Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2.5 rounded-xl transition-all",
                    note.isPublic
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-stone-800 text-stone-500",
                  )}
                >
                  {note.isPublic ? <Globe size={18} /> : <Lock size={18} />}
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-tight">
                    Public Access
                  </h4>
                  <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">
                    {note.isPublic
                      ? "Anyone with the link can view"
                      : note.permissions?.length > 0
                        ? "Shared with authorized personnel"
                        : "Only restricted to authorized users"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleTogglePublic}
                className={cn(
                  "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all font-['Outfit']",
                  note.isPublic
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : "bg-stone-800 text-stone-400 hover:bg-stone-700",
                )}
              >
                {note.isPublic ? "Disable" : "Enable"}
              </button>
            </div>

            {(note.isPublic || note.permissions?.length > 0) && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                {note.isPublic && (
                  <div className="flex items-center justify-between p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                      Public Access Level
                    </span>
                    <select
                      value={note.publicRole}
                      onChange={(e) => handleUpdatePublicRole(e.target.value)}
                      className="bg-[#0c0a09] border border-stone-800 rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-emerald-500 text-white"
                    >
                      <option value="VIEWER">Read Only</option>
                      <option value="EDITOR">Edit Access</option>
                    </select>
                  </div>
                )}

                <div className="flex gap-2 p-2 bg-[#0c0a09] border border-stone-800 rounded-xl items-center">
                  <div className="flex-1 truncate pl-2 text-[10px] font-mono text-stone-500 uppercase tracking-tighter">
                    {window.location.origin}/note/{note.id}
                  </div>
                  <button
                    onClick={copyLink}
                    className="p-2 bg-stone-800 hover:bg-[#a81c1c] text-stone-400 hover:text-white rounded-lg transition-all"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-stone-800/50" />

          {/* Add Collaborator Section */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-[#a81c1c] uppercase tracking-[0.2em]">
              Add Authorized User
            </h4>
            <form
              onSubmit={handleAddPermission}
              className="flex gap-2"
            >
              <div className="relative flex-1 group">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-600 group-focus-within:text-[#a81c1c] transition-colors"
                  size={14}
                />
                <input
                  type="email"
                  placeholder="USER@DOMAIN.COM"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#0c0a09] border border-stone-800 rounded-xl text-xs font-bold focus:ring-1 focus:ring-[#a81c1c] outline-none transition-all placeholder:text-stone-700 uppercase tracking-widest"
                />
              </div>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-[#0c0a09] border border-stone-800 rounded-xl px-3 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-[#a81c1c]"
              >
                <option value="VIEWER">Viewer</option>
                <option value="EDITOR">Editor</option>
              </select>
              <button
                disabled={loading || !email}
                className="p-3 bg-stone-800 hover:bg-[#a81c1c] text-stone-400 hover:text-white rounded-xl transition-all disabled:opacity-30"
              >
                <UserPlus size={18} />
              </button>
            </form>
          </div>

          {/* Collaborator List */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-[#a81c1c] uppercase tracking-[0.2em]">
              Authorized Personnel
            </h4>
            <div className="space-y-2">
              {/* Owner */}
              <div className="flex items-center justify-between p-4 bg-[#161412] border border-stone-800/50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#a81c1c] flex items-center justify-center text-white text-[10px] font-black uppercase tracking-tighter shadow-lg shadow-[#a81c1c]/20">
                    {note.owner?.name?.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black text-white uppercase tracking-widest">
                      {note.owner?.name} (You)
                    </h5>
                    <p className="text-[8px] text-stone-600 font-bold uppercase tracking-widest">
                      {note.owner?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-[8px] font-black text-white uppercase tracking-[0.2em]">
                  <ShieldCheck
                    size={10}
                    className="text-[#a81c1c]"
                  />{" "}
                  Owner
                </div>
              </div>

              {/* Others */}
              {note.permissions?.map((perm) => (
                <div
                  key={perm.id}
                  className="flex items-center justify-between p-4 bg-[#0c0a09] border border-stone-800/50 rounded-2xl group hover:border-[#a81c1c]/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center text-stone-400 text-[10px] font-black uppercase tracking-tighter">
                      {perm.user.name?.charAt(0)}
                    </div>
                    <div>
                      <h5 className="text-[10px] font-black text-white uppercase tracking-widest">
                        {perm.user.name}
                      </h5>
                      <p className="text-[8px] text-stone-600 font-bold uppercase tracking-widest">
                        {perm.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={perm.role}
                      onChange={(e) =>
                        handleUpdatePermission(perm.user.email, e.target.value)
                      }
                      className={cn(
                        "flex items-center gap-2 px-3 py-1 rounded-lg border text-[8px] font-black uppercase tracking-[0.2em] outline-none transition-all cursor-pointer font-['Outfit']",
                        perm.role === "EDITOR"
                          ? "bg-[#a81c1c]/10 border-[#a81c1c]/20 text-[#a81c1c] focus:ring-1 focus:ring-[#a81c1c]"
                          : "bg-stone-900 border-stone-800 text-stone-500 focus:ring-1 focus:ring-stone-600",
                      )}
                    >
                      <option value="VIEWER">Viewer</option>
                      <option value="EDITOR">Editor</option>
                    </select>
                    <button
                      onClick={() => handleRemovePermission(perm.userId)}
                      className="p-2 text-stone-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-stone-800/50 bg-[#161412] flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
          >
            Closed
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteSettingsModal;
