/**
 * @fileoverview Note page component.
 * Displays a single note with the `CollaborativeEditor`.
 * Handles access control (public/private), real-time socket events for title updates and deletions,
 * and different view modes (Editor vs. Viewer).
 */

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../axios/axiosInstance";
import CollaborativeEditor from "../components/CollaborativeEditor";
import { useAppStore } from "../store/useAppStore";
import { FileText, LogIn, Eye, Edit3, Globe, Sun, Moon } from "lucide-react";
import { cn } from "../utils/cn";
import { io } from "socket.io-client";
import { useRef } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4015";

/**
 * NotePage component.
 * 
 * @component
 * @returns {React.ReactElement}
 */
const NotePage = () => {
  const { id } = useParams();
  const { token, theme, toggleTheme } = useAppStore();
  const [note, setNote] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  /**
   * Fetches the note data from the backend.
   * Handles various error states (403 Forbidden, 404 Not Found).
   * @async
   * @param {boolean} [isInitial=true] - Whether this is the initial page load.
   */
  const fetchNote = async (isInitial = true) => {
    if (isInitial) setLoading(true);
    try {
      const res = await axios.get(`/api/notes/${id}`);
      setNote(res.data);
      setError(null);
    } catch (err) {
      if (err.response?.status === 403) {
        setError("This note is private. Only authorized personnel can access.");
      } else if (err.response?.status === 404) {
        setError("Note not found in the directory.");
      } else {
        setError("Access restricted. Technical authorization required.");
      }
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  /**
   * Effect to trigger note fetching when the ID or token changes.
   */
  useEffect(() => {
    fetchNote();
  }, [id, token]);

  /**
   * Effect to handle real-time synchronization via WebSockets.
   * Listens for access checks, title updates, and deletion events.
   */
  useEffect(() => {
    const socket = io(API_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_note", id);
    });

    socket.on("check_access", ({ noteId }) => {
      if (noteId === id) {
        fetchNote(false);
      }
    });

    socket.on("note_deleted", ({ noteId }) => {
      if (noteId === id) {
        setNote(null);
        setError("This note has been decommissioned by the owner.");
      }
    });

    socket.on("title_updated", ({ noteId, title }) => {
      if (noteId === id) {
        setNote((prev) => (prev ? { ...prev, title } : null));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [id, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-[#a81c1c]/20 blur-xl rounded-full" />
            <div className="w-12 h-12 border-2 border-[#a81c1c] border-t-transparent rounded-full animate-spin relative z-10" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse font-['Outfit']">
            Retrieving Note...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-8 max-w-sm">
          <div className="relative group mx-auto w-fit">
            <div className="absolute inset-0 bg-[#a81c1c]/10 blur-2xl rounded-full transition-all group-hover:bg-[#a81c1c]/20" />
            <div className="relative w-24 h-24 bg-card border border-border rounded-[2.5rem] flex items-center justify-center text-[#a81c1c] shadow-2xl rotate-6 group-hover:rotate-0 transition-transform duration-500">
              <FileText size={40} />
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-foreground uppercase tracking-tighter font-['Outfit']">
              Restricted
            </h2>
            <p className="text-muted-foreground text-xs font-black uppercase tracking-[0.2em] leading-relaxed font-['Outfit']">
              {error}
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-[#a81c1c] hover:bg-[#991b1b] text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-[#a81c1c]/20 active:scale-95 font-['Outfit']"
            >
              <LogIn size={14} /> Request Authorization
            </Link>
            <Link
              to="/dashboard"
              className="px-8 py-4 bg-muted border border-border hover:border-brand-primary text-muted-foreground hover:text-foreground rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all font-['Outfit']"
            >
              Return to Base
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isReadOnly = note.role === "VIEWER";

  return (
    <div className="min-h-screen bg-background font-['Inter'] text-foreground">
      {/* Top Bar */}
      <div className="h-14 md:h-16 md:h-24 border-b border-border flex items-center justify-between px-6 md:px-12 bg-background/80 sticky top-0 z-50 backdrop-blur-xl">
        <div className="flex items-center gap-4 md:gap-8 min-w-0">
          <Link
            to="/dashboard"
            className="text-xl md:text-2xl font-black tracking-tighter text-foreground hover:opacity-80 transition-opacity shrink-0"
          >
            DAYA<span className="text-brand-primary">NOTE</span>
          </Link>
          <div className="w-px h-6 bg-border shrink-0 hidden md:block" />
          <div className="hidden md:flex items-center gap-4 overflow-hidden">
            <div
              className={cn(
                "p-2 rounded-lg bg-muted border flex items-center gap-2 shrink-0 transition-all",
                !isReadOnly
                  ? "text-emerald-500 border-emerald-500/20"
                  : "text-[#a81c1c] border-[#a81c1c]/20",
              )}
            >
              {isReadOnly ? <Eye size={16} /> : <Edit3 size={16} />}
              <span className="text-[10px] font-black uppercase tracking-[0.2em] font-['Outfit']">
                {isReadOnly ? "View Only" : "Editor Access"}
              </span>
            </div>
            <h1 className="text-lg font-black text-foreground uppercase tracking-tighter truncate min-w-0 font-['Outfit']">
              {note?.title || "Untitled Note"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="flex flex-col items-end mr-4 hidden sm:flex">
            <span className="text-[10px] font-black text-[#a81c1c] uppercase tracking-[0.2em] font-['Outfit']">
              Originator
            </span>
            <span className="text-xs font-black text-foreground uppercase tracking-widest font-['Outfit']">
              {note.owner?.name}
            </span>
          </div>
          {token ? (
            <Link
              to="/dashboard"
              className="px-6 py-3 bg-muted border border-border hover:border-[#a81c1c]/50 text-muted-foreground hover:text-foreground rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-black/40 font-['Outfit']"
            >
              Open Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-6 py-3 bg-[#a81c1c] hover:bg-[#991b1b] text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-[#a81c1c]/20 active:scale-95 font-['Outfit']"
            >
              <LogIn size={13} />{" "}
              <span className="hidden sm:block">Secure Login</span>
            </Link>
          )}

          <button
            onClick={toggleTheme}
            className="p-3 bg-muted border border-border hover:border-brand-primary/50 text-muted-foreground hover:text-brand-primary rounded-xl transition-all shadow-lg font-['Outfit']"
            title="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      {/* Hero Header Area */}
      <div className="bg-muted/30 border-b border-border pt-4 md:pt-16 pb-4 md:pb-8">
        <div className="max-w-5xl mx-auto px-4 md:px-12">
          <div className="md:space-y-6">
            <div className="flex items-center gap-3">
              <Globe
                size={14}
                className="text-emerald-500"
              />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-emerald-500/80 font-['Outfit']">
                Public Secure Link Active
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-foreground uppercase tracking-tighter leading-none font-['Outfit']">
              {note?.title || "Note"}
            </h2>
            <div className="flex items-center gap-8 pt-2">
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] font-['Outfit']">
                  Issue Date
                </p>
                <p className="text-xs font-bold text-muted-foreground font-['Outfit']">
                  {new Date(note?.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] font-['Outfit']">
                  Originator
                </p>
                <p className="text-xs font-bold text-muted-foreground font-['Outfit']">
                  {note.owner?.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="max-w-5xl mx-auto px-0 md:px-8 pb-32 pt-5 md:pt-12">
        <div className="bg-card border border-border rounded-[3rem] p-4 md:p-8 shadow-2xl relative">
          <div className="absolute top-8 right-12 z-10 pointer-events-none">
            <div className="text-[60px] font-black text-foreground/[0.02] uppercase tracking-tighter leading-none select-none">
              {isReadOnly ? "RESTRICTED" : "AUTHORIZED"}
            </div>
          </div>
          <CollaborativeEditor
            key={id}
            noteId={id}
            readOnly={isReadOnly}
          />
        </div>

        {/* Footer Meta */}
        <div className="mt-12 flex justify-between items-center text-muted-foreground px-4 md:px-0 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center font-black text-xs">
              DN
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest leading-none font-['Outfit']">
                Note Identifier
              </p>
              <p className="text-[11px] font-mono mt-1 text-muted-foreground">
                {note.id}
              </p>
            </div>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.3em]">
            Built for Daya Lima Infrastructure
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotePage;
