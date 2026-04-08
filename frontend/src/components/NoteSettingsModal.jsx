/**
 * @fileoverview Modal component for managing note settings and access control.
 * Handles public sharing, role management, and collaborator invitations.
 */

import { useState, useEffect } from "react";
import axios from "../axios/axiosInstance";
import {
  Globe,
  Lock,
  UserPlus,
  Trash2,
  ShieldCheck,
  Mail,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "./Toast";
import { cn } from "../utils/cn";
import Modal from "./Modal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4015";

/**
 * NoteSettingsModal component.
 * 
 * @component
 * @param {Object} props - Component props.
 * @param {boolean} props.isOpen - Whether the modal is visible.
 * @param {Function} props.onClose - Callback to close the modal.
 * @param {Object} props.note - The note object being configured.
 * @param {Function} props.onUpdate - Callback to update the local note state.
 * @param {string} props.token - Authentication token.
 */
const NoteSettingsModal = ({ isOpen, onClose, note, onUpdate }) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  /**
   * Effect to refresh full note details (including collaborators) when the modal opens.
   */
  useEffect(() => {
    if (isOpen && note?.id) {
      const fetchFullNote = async () => {
        try {
          const res = await axios.get(`/api/notes/${note.id}`);
          onUpdate(res.data);
        } catch (err) {
          console.error("Failed to refresh note details", err);
        }
      };
      fetchFullNote();
    }
  }, [isOpen, note?.id]);

  if (!note) return null;

  /**
   * Toggles the note's public visibility.
   * @async
   */
  const handleTogglePublic = async () => {
    try {
      const res = await axios.put(`/api/notes/${note.id}`, {
        isPublic: !note.isPublic,
        publicRole: note.publicRole || "VIEWER",
      });
      onUpdate(res.data);
      toast.info(`Note is now ${!note.isPublic ? "Public" : "Private"}`);
    } catch (err) {
      toast.error("Failed to update privacy");
    }
  };

  /**
   * Updates the default role for public access.
   * @async
   * @param {string} newRole - The new role ('VIEWER' or 'EDITOR').
   */
  const handleUpdatePublicRole = async (newRole) => {
    try {
      const res = await axios.put(`/api/notes/${note.id}`, {
        publicRole: newRole,
      });
      onUpdate(res.data);
      toast.info(`Public access changed to ${newRole}`);
    } catch (err) {
      toast.error("Failed to update public role");
    }
  };

  /**
   * Sends an invitation to a user by email to collaborate on the note.
   * @async
   * @param {React.FormEvent} e - Form event.
   */
  const handleAddPermission = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await axios.post(`/api/notes/${note.id}/permissions`, { email, role });
      toast.success(`Shared with ${email}`);
      setEmail("");
      // Refresh note data
      const res = await axios.get(`/api/notes/${note.id}`);
      onUpdate(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to share");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Updates the permission role of an existing collaborator.
   * @async
   * @param {string} targetEmail - The email of the collaborator.
   * @param {string} newRole - The new role assigned.
   */
  const handleUpdatePermission = async (targetEmail, newRole) => {
    try {
      await axios.post(`/api/notes/${note.id}/permissions`, {
        email: targetEmail,
        role: newRole,
      });
      toast.success(`Role updated for ${targetEmail}`);
      // Refresh note data
      const res = await axios.get(`/api/notes/${note.id}`);
      onUpdate(res.data);
    } catch (err) {
      toast.error("Failed to update role");
    }
  };

  /**
   * Removes a collaborator from the note.
   * @async
   * @param {string} userId - The user ID of the collaborator to remove.
   */
  const handleRemovePermission = async (userId) => {
    try {
      await axios.delete(
        `/api/notes/${note.id}/permissions/${userId}`
      );
      toast.success("Collaborator removed");
      const res = await axios.get(`/api/notes/${note.id}`);
      onUpdate(res.data);
    } catch (err) {
      toast.error("Failed to remove collaborator");
    }
  };

  /**
   * Copies the note's shareable link to the clipboard.
   */
  const copyLink = () => {
    const shareUrl = `${window.location.origin}/note/${note.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copied!");
  };

  /**
   * Footer content containing the Close button.
   */
  const footer = (
    <button
      onClick={onClose}
      className={cn(
        "px-8 py-3 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground",
        "rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-border cursor-pointer",
      )}
    >
      Close
    </button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Access Control"
      subtitle="Configure Note Permissions"
      footer={footer}
    >
      <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar -mr-4">
        {/* Public Link Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2.5 rounded-xl transition-all",
                  note.isPublic
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {note.isPublic ? <Globe size={18} /> : <Lock size={18} />}
              </div>
              <div>
                <h4 className="text-sm font-black text-foreground uppercase tracking-tight">
                  Public Access
                </h4>
                <p
                  className={cn(
                    "text-[10px] text-muted-foreground font-bold uppercase tracking-widest",
                  )}
                >
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
                "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all font-['Outfit'] cursor-pointer",
                note.isPublic
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
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
                    className={cn(
                      "bg-input border border-border rounded-lg px-2 py-1 text-[9px]",
                      "font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-emerald-500 text-foreground cursor-pointer",
                    )}
                  >
                    <option value="VIEWER">Read Only</option>
                    <option value="EDITOR">Edit Access</option>
                  </select>
                </div>
              )}

              <div className="flex gap-2 p-2 bg-input border border-border rounded-xl items-center">
                <div className="flex-1 truncate pl-2 text-[10px] font-mono text-muted-foreground uppercase tracking-tighter">
                  {window.location.origin}/note/{note.id}
                </div>
                <button
                  onClick={copyLink}
                  className="p-2 bg-muted hover:bg-brand-primary text-muted-foreground hover:text-white rounded-lg transition-all cursor-pointer"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-px bg-border/50" />

        {/* Add Collaborator Section */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">
            Add Authorized User
          </h4>
          <form
            onSubmit={handleAddPermission}
            className="flex flex-col sm:flex-row gap-2"
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
                className={cn(
                  "w-full pl-10 pr-4 py-3 bg-input border border-border rounded-xl text-xs font-bold",
                  "focus:ring-1 focus:ring-brand-primary outline-none transition-all",
                  "placeholder:text-muted-foreground/50 uppercase tracking-widest text-foreground",
                )}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={cn(
                  "flex-1 sm:flex-none bg-input border border-border rounded-xl px-3 text-[10px]",
                  "font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-brand-primary text-foreground cursor-pointer",
                )}
              >
                <option value="VIEWER">Viewer</option>
                <option value="EDITOR">Editor</option>
              </select>
              <button
                type="submit"
                disabled={loading || !email}
                className="p-3 bg-muted hover:bg-brand-primary text-muted-foreground hover:text-white rounded-xl transition-all disabled:opacity-30 cursor-pointer"
              >
                <UserPlus size={18} />
              </button>
            </div>
          </form>
        </div>

        {/* Collaborator List */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">
            Authorized Personnel
          </h4>
          <div className="space-y-2">
            {/* Owner */}
            <div
              className={cn(
                "flex items-center justify-between p-4 bg-muted/20 border border-border/50 rounded-2xl",
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white text-[10px] font-black uppercase tracking-tighter shadow-lg shadow-brand-primary/20">
                  {note.owner?.name?.charAt(0)}
                </div>
                <div>
                  <h5
                    className={cn(
                      "text-[10px] font-black text-foreground uppercase tracking-widest",
                    )}
                  >
                    {note.owner?.name} (You)
                  </h5>
                  <p
                    className={cn(
                      "text-[8px] text-muted-foreground font-bold uppercase tracking-widest",
                    )}
                  >
                    {note.owner?.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-lg border border-border text-[8px] font-black text-foreground uppercase tracking-[0.2em]">
                <ShieldCheck
                  size={10}
                  className="text-brand-primary"
                />{" "}
                Owner
              </div>
            </div>

            {/* Others */}
            {note.permissions?.map((perm) => (
              <div
                key={perm.id}
                className={cn(
                  "flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-input/50 border border-border/50",
                  "rounded-2xl group hover:border-brand-primary/30 transition-all gap-4",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg bg-muted flex items-center justify-center",
                      "text-muted-foreground text-[10px] font-black uppercase tracking-tighter",
                    )}
                  >
                    {perm.user?.name?.charAt(0)}
                  </div>
                  <div>
                    <h5
                      className={cn(
                        "text-[10px] font-black text-foreground uppercase tracking-widest",
                      )}
                    >
                      {perm.user?.name}
                    </h5>
                    <p
                      className={cn(
                        "text-[8px] text-muted-foreground font-bold uppercase tracking-widest",
                      )}
                    >
                      {perm.user?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={perm.role}
                    onChange={(e) =>
                      handleUpdatePermission(perm.user?.email, e.target.value)
                    }
                    className={cn(
                      "flex items-center gap-2 px-3 py-1 rounded-lg border text-[8px] font-black uppercase tracking-[0.2em] outline-none transition-all cursor-pointer font-['Outfit']",
                      perm.role === "EDITOR"
                        ? "bg-brand-primary/10 border-brand-primary/20 text-brand-primary focus:ring-1 focus:ring-brand-primary"
                        : "bg-muted border-border text-muted-foreground focus:ring-1 focus:ring-border",
                    )}
                  >
                    <option value="VIEWER">Viewer</option>
                    <option value="EDITOR">Editor</option>
                  </select>
                  <button
                    onClick={() => handleRemovePermission(perm.userId)}
                    className="p-2 text-stone-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default NoteSettingsModal;
