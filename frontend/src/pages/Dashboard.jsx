import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useAppStore } from "../store/useAppStore";
import CollaborativeEditor from "../components/CollaborativeEditor";
import NoteSettingsModal from "../components/NoteSettingsModal";
import { toast } from "../components/Toast";
import { io } from "socket.io-client";
import {
  LogOut,
  Plus,
  FileText,
  Share2,
  Trash2,
  Sun,
  Moon,
  Check,
} from "lucide-react";
import { cn } from "../utils/cn";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4015";

const Dashboard = () => {
  const { user, token, logout, theme, toggleTheme } = useAppStore();
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [saveStatus, setSaveStatus] = useState("idle");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const titleSaveTimer = useRef(null);
  const socketRef = useRef(null);

  // === Socket.io connection ===
  useEffect(() => {
    if (!token) return;
    const socket = io(API_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on("connect", () => {
      // toast.success("Realtime connection established.");
    });

    socket.on("document_saved", ({ noteId }) => {
      // toast.info(`Document synced to cloud.`);
    });

    socket.on("title_updated", ({ noteId, title }) => {
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, title } : n)),
      );
    });

    socket.on("access_revoked", ({ noteId }) => {
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      if (activeNoteId === noteId) {
        setActiveNoteId(null);
        toast.info("Access to this memorandum has been revoked.", {
          duration: 5000,
        });
      }
    });

    socket.on("note_deleted", ({ noteId }) => {
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      if (activeNoteId === noteId) {
        setActiveNoteId(null);
        toast.info("This memorandum has been discarded by the owner.");
      }
    });

    socket.on("access_changed", ({ noteId, role }) => {
      const exists = notes.some((n) => n.id === noteId);
      if (!exists) {
        fetchNotes(); // New note shared, refresh list
      } else {
        setNotes((prev) =>
          prev.map((n) => (n.id === noteId ? { ...n, role } : n)),
        );
      }

      if (activeNoteId === noteId) {
        toast.info(`Your access role has been updated to ${role}`);
      }
    });

    socket.on("note_updated", (updatedNote) => {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === updatedNote.id ? { ...n, ...updatedNote } : n,
        ),
      );
    });

    socket.on("check_access", async ({ noteId }) => {
      if (activeNoteId === noteId) {
        try {
          const res = await axios.get(`${API_URL}/api/notes/${noteId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setNotes((prev) =>
            prev.map((n) => (n.id === noteId ? { ...n, ...res.data } : n)),
          );
        } catch (err) {
          if (err.response?.status === 403) {
            setNotes((prev) => prev.filter((n) => n.id !== noteId));
            setActiveNoteId(null);
            toast.error("You no longer have access to this document.");
          }
        }
      }
    });

    return () => socket.disconnect();
  }, [token]);

  // Sync socket rooms with available notes to ensure real-time sidebar updates
  useEffect(() => {
    if (notes.length > 0 && socketRef.current) {
      const noteIds = notes.map((n) => n.id);
      socketRef.current.emit("join_note", noteIds);
    }
  }, [notes, token]); // Re-join if notes list changes

  // === Notes CRUD ===
  const fetchNotes = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(res.data);
    } catch (err) {
      toast.error("Failed to load notes.");
    }
  };

  useEffect(() => {
    if (token) fetchNotes();
  }, [token]);

  const createNote = async () => {
    try {
      const res = await axios.post(
        `${API_URL}/api/notes`,
        { title: "New Note" },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setNotes([res.data, ...notes]);
      setActiveNoteId(res.data.id);
      toast.success("New note created.");
    } catch (err) {
      toast.error("Failed to create note.");
    }
  };

  const deleteNote = async (id) => {
    if (!confirm("Delete this note permanently?")) return;
    try {
      await axios.delete(`${API_URL}/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(notes.filter((n) => n.id !== id));
      if (activeNoteId === id) setActiveNoteId(null);
      toast.success("Note deleted.");
    } catch (err) {
      toast.error("Failed to delete note.");
    }
  };

  // === Title auto-save with debounce ===
  const saveNoteFields = useCallback(
    (noteId, fields) => {
      if (titleSaveTimer.current) clearTimeout(titleSaveTimer.current);
      setSaveStatus("saving");
      titleSaveTimer.current = setTimeout(async () => {
        try {
          const res = await axios.put(
            `${API_URL}/api/notes/${noteId}`,
            fields,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          setNotes((prev) =>
            prev.map((n) => (n.id === noteId ? { ...n, ...res.data } : n)),
          );
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        } catch {
          toast.error("Failed to save changes.");
          setSaveStatus("idle");
        }
      }, 800);
    },
    [token],
  );

  const titleRef = useRef("");

  const handleTitleFocus = (e) => {
    titleRef.current = e.target.value;
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setNotes(
      notes.map((n) => (n.id === activeNoteId ? { ...n, title: newTitle } : n)),
    );

    // Broadcast in real-time via Socket.io
    if (socketRef.current) {
      socketRef.current.emit("update_title", {
        noteId: activeNoteId,
        title: newTitle,
      });
    }
  };

  const handleTitleBlur = (e) => {
    const newTitle = e.target.value;
    if (newTitle === titleRef.current) return; // No change, skip API
    saveNoteFields(activeNoteId, { title: newTitle });
  };

  const updateActiveNoteInList = (updatedNote) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === updatedNote.id ? updatedNote : n)),
    );
  };

  const filteredNotes = notes.filter((n) =>
    (n.title || "Untitled").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const activeNote = notes.find((n) => n.id === activeNoteId);
  const canEdit = activeNote?.role === "OWNER" || activeNote?.role === "EDITOR";

  return (
    <div className="flex h-screen bg-background overflow-hidden text-foreground font-['Inter']">
      {/* Sidebar */}
      <div className="w-80 bg-sidebar border-r border-border flex flex-col relative z-20">
        <div className="p-10 flex items-center justify-between">
          <h2
            className={cn(
              "text-2xl font-black tracking-tighter font-['Outfit'] text-foreground",
            )}
          >
            DAYA<span className="text-brand-primary">NOTE</span>
          </h2>
          <button
            onClick={toggleTheme}
            className={cn(
              "w-8 h-8 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center",
              "transition-colors shadow-lg border border-border cursor-pointer",
            )}
          >
            {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
          </button>
        </div>

        <div className="px-8 mb-8">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-3 bg-input border border-border rounded-xl",
              "text-sm font-semibold focus:ring-1 focus:ring-brand-primary outline-none transition-all",
              "placeholder:text-muted-foreground text-foreground shadow-inner tracking-tight font-['Outfit']",
            )}
          />
        </div>

        <div className="px-8 mb-6 text-xs font-black uppercase tracking-[0.2em] text-[#a81c1c] font-['Outfit']">
          My Notes
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2 custom-scrollbar">
          <button
            onClick={createNote}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3.5",
              "text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all group mb-4 cursor-pointer",
            )}
          >
            <div className="p-2 rounded-lg bg-muted group-hover:bg-brand-primary group-hover:text-white transition-all text-muted-foreground">
              <Plus size={16} />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em] font-['Outfit']">
              New Note
            </span>
          </button>

          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className={cn(
                "group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border",
                activeNoteId === note.id
                  ? "bg-brand-primary border-brand-primary text-white shadow-xl shadow-brand-primary/20"
                  : "bg-muted/30 border-border hover:border-brand-primary/30 text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setActiveNoteId(note.id)}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText
                  size={16}
                  className={cn(
                    "transition-colors",
                    activeNoteId === note.id
                      ? "text-white"
                      : "text-muted-foreground group-hover:text-brand-primary",
                  )}
                />
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-sm font-black uppercase tracking-tight font-['Outfit']">
                    {note.title || "Untitled Note"}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] uppercase tracking-wider font-bold",
                      activeNoteId === note.id
                        ? "text-red-100"
                        : "text-muted-foreground/60",
                    )}
                  >
                    {!note.isPublic &&
                    (note._count?.permissions > 0 ||
                      note.permissions?.length > 0 ||
                      note.ownerId !== user.id)
                      ? "🔒 Shared"
                      : note.isPublic
                        ? "🌐 Public"
                        : "🔒 Private"}{" "}
                    · ID: {note.id.substring(0, 8)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 border-t border-border bg-sidebar mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 overflow-hidden">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center",
                  "text-white font-black shrink-0 shadow-lg shadow-brand-primary/20",
                )}
              >
                {user?.name?.charAt(0)}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span
                  className={cn(
                    "text-xs font-black truncate text-foreground uppercase tracking-widest font-['Outfit']",
                  )}
                >
                  {user?.name}
                </span>
                <span className="text-[10px] text-muted-foreground truncate uppercase tracking-tight font-bold">
                  Authorized User
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
              title="Logout System"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col relative z-10 bg-background">
        {activeNoteId ? (
          <>
            <div className="h-24 border-b border-border flex items-center justify-between px-12 bg-background/50 backdrop-blur-md gap-6">
              {/* Title */}
              <div className="flex items-center gap-4 flex-1 overflow-hidden">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                <input
                  type="text"
                  value={activeNote?.title || ""}
                  onChange={handleTitleChange}
                  onFocus={handleTitleFocus}
                  onBlur={handleTitleBlur}
                  disabled={!canEdit}
                  className={cn(
                    "text-2xl font-black bg-transparent outline-none border-none focus:ring-0 w-full",
                    "placeholder:text-muted/50 uppercase tracking-tighter text-foreground min-w-0 disabled:opacity-50 font-['Outfit']",
                  )}
                  placeholder="Note Title"
                />
              </div>

              {/* Action bar */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Save status */}
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-stone-600 mr-2">
                  {saveStatus === "saving" && (
                    <>
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-600 animate-pulse" />
                      <span className="text-yellow-600">Saving...</span>
                    </>
                  )}
                  {saveStatus === "saved" && (
                    <>
                      <Check
                        size={12}
                        className="text-emerald-500"
                      />
                      <span className="text-emerald-500">Saved</span>
                    </>
                  )}
                </div>

                {/* Manage Access button */}
                {activeNote?.role === "OWNER" ? (
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className={cn(
                      "flex items-center gap-2 px-6 py-2.5 bg-brand-primary/10 border border-brand-primary/30 rounded-xl",
                      "text-[9px] font-black uppercase tracking-[0.2em] text-brand-primary hover:bg-brand-primary",
                      "hover:text-white transition-all shadow-lg font-['Outfit'] cursor-pointer",
                    )}
                  >
                    <Share2 size={13} /> Share Note
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/note/${activeNoteId}`,
                      );
                      toast.success("Link copied!");
                    }}
                    className={cn(
                      "flex items-center gap-2 px-6 py-2.5 bg-stone-900 border border-stone-800 rounded-xl",
                      "text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 hover:text-white",
                      "transition-all shadow-lg cursor-pointer",
                    )}
                  >
                    <Share2 size={13} /> Copy Link
                  </button>
                )}

                {/* Delete */}
                {activeNote?.role === "OWNER" && (
                  <button
                    onClick={() => deleteNote(activeNoteId)}
                    className={cn(
                      "p-2.5 rounded-xl bg-muted border border-border hover:bg-red-500/20 hover:text-red-500",
                      "transition-all text-muted-foreground ml-2 cursor-pointer",
                    )}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-16 custom-scrollbar">
              <div className="max-w-4xl mx-auto">
                <CollaborativeEditor
                  key={activeNoteId}
                  noteId={activeNoteId}
                  readOnly={!canEdit}
                />
              </div>
            </div>

            <NoteSettingsModal
              isOpen={isSettingsOpen}
              onClose={() => setIsSettingsOpen(false)}
              note={activeNote}
              onUpdate={updateActiveNoteInList}
              token={token}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center p-12 space-y-10">
            <div className="relative">
              <div
                className={cn(
                  "relative w-32 h-32 bg-card border border-border rounded-[2.5rem]",
                  "flex items-center justify-center text-brand-primary rotate-6 animate-float shadow-2xl",
                )}
              >
                <FileText size={48} />
              </div>
            </div>
            <div className="space-y-4 max-w-sm">
              <h3 className="text-3xl font-black text-foreground uppercase tracking-tighter font-['Outfit']">
                No Note Selected
              </h3>
              <p
                className={cn(
                  "text-stone-500 text-[10px] font-black leading-relaxed uppercase tracking-[0.2em] font-['Outfit']",
                )}
              >
                Select a note from the sidebar or create a new one to start
                writing.
              </p>
            </div>
            <button
              onClick={createNote}
              className={cn(
                "px-10 py-5 bg-brand-primary hover:bg-brand-hover text-white rounded-2xl",
                "font-black text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95",
                "shadow-2xl shadow-brand-primary/40 font-['Outfit'] cursor-pointer",
              )}
            >
              Create New Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
