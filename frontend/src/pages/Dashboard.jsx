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
  Search,
  Check,
  Link,
  Settings,
} from "lucide-react";

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

    return () => socket.disconnect();
  }, [token]);

  // Join socket room whenever active note changes
  useEffect(() => {
    if (activeNoteId && socketRef.current) {
      socketRef.current.emit("join_note", activeNoteId);
    }
  }, [activeNoteId]);

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
        { title: "New Memorandum" },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setNotes([res.data, ...notes]);
      setActiveNoteId(res.data.id);
      toast.success("New memorandum created.");
    } catch (err) {
      toast.error("Failed to create note.");
    }
  };

  const deleteNote = async (id) => {
    if (!confirm("Discard this memorandum permanently?")) return;
    try {
      await axios.delete(`${API_URL}/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(notes.filter((n) => n.id !== id));
      if (activeNoteId === id) setActiveNoteId(null);
      toast.success("Memorandum discarded.");
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
    <div className="flex h-screen bg-[#0c0a09] overflow-hidden text-stone-200 font-['Inter']">
      {/* Sidebar */}
      <div className="w-80 bg-[#12100f] border-r border-stone-800/80 flex flex-col relative z-20">
        <div className="p-10 flex items-center justify-between">
          <h2 className="text-xl font-black tracking-tighter text-white">
            DAYA<span className="text-[#a81c1c]">NOTE</span>
          </h2>
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg bg-stone-800/50 hover:bg-stone-700 flex items-center justify-center transition-colors shadow-lg"
          >
            {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
          </button>
        </div>

        <div className="px-8 mb-8">
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 group-focus-within:text-[#a81c1c] transition-colors"
              size={14}
            />
            <input
              type="text"
              placeholder="Query documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#1c1917] border border-stone-800 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-[#a81c1c] outline-none transition-all placeholder:text-stone-700 text-stone-200 shadow-inner tracking-widest uppercase"
            />
          </div>
        </div>

        <div className="px-8 mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#a81c1c]">
          Main Directory
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2 custom-scrollbar">
          <button
            onClick={createNote}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-stone-300 hover:text-white hover:bg-stone-800/50 rounded-xl transition-all group mb-4"
          >
            <div className="p-2 rounded-lg bg-stone-800 group-hover:bg-[#a81c1c] transition-all">
              <Plus size={16} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              Initiate Entry
            </span>
          </button>

          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${
                activeNoteId === note.id
                  ? "bg-[#a81c1c] border-[#a81c1c] text-white shadow-xl shadow-[#a81c1c]/20"
                  : "bg-stone-900/40 border-stone-800 hover:border-stone-600 text-stone-400 hover:text-stone-100"
              }`}
              onClick={() => setActiveNoteId(note.id)}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText
                  size={16}
                  className={
                    activeNoteId === note.id
                      ? "text-white"
                      : "text-stone-500 group-hover:text-[#a81c1c]"
                  }
                />
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-[10px] font-black uppercase tracking-widest">
                    {note.title || "Untitled"}
                  </span>
                  <span
                    className={`text-[8px] uppercase tracking-tighter font-bold ${activeNoteId === note.id ? "text-red-200" : "text-stone-600"}`}
                  >
                    {note.isPublic ? "🌐 Public" : "🔒 Private"} · ID:{" "}
                    {note.id.substring(0, 8)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 border-t border-stone-800/80 bg-[#0c0a09]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-[#a81c1c] flex items-center justify-center text-white font-black shrink-0 shadow-lg shadow-[#a81c1c]/20">
                {user?.name?.charAt(0)}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-[10px] font-black truncate text-white uppercase tracking-widest">
                  {user?.name}
                </span>
                <span className="text-[8px] text-stone-500 truncate uppercase tracking-tighter font-bold">
                  Authorized User
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-stone-600 hover:text-red-500 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col relative z-10 bg-[#080706]">
        {activeNoteId ? (
          <>
            <div className="h-24 border-b border-stone-800/80 flex items-center justify-between px-12 bg-[#0c0a09]/50 backdrop-blur-md gap-6">
              {/* Title */}
              <div className="flex items-center gap-4 flex-1 overflow-hidden">
                <div className="w-1.5 h-1.5 rounded-full bg-[#a81c1c] shrink-0" />
                <input
                  type="text"
                  value={activeNote?.title || ""}
                  onChange={handleTitleChange}
                  onFocus={handleTitleFocus}
                  onBlur={handleTitleBlur}
                  disabled={!canEdit}
                  className="text-2xl font-black bg-transparent outline-none border-none focus:ring-0 w-full placeholder:text-stone-800 uppercase tracking-tighter text-white min-w-0 disabled:opacity-50"
                  placeholder="Document Identifier"
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
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#a81c1c]/10 border border-[#a81c1c]/30 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-[#a81c1c] hover:bg-[#a81c1c] hover:text-white transition-all shadow-lg"
                  >
                    <Share2 size={13} /> Manage Access
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/note/${activeNoteId}`,
                      );
                      toast.success("Link copied!");
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 hover:text-white transition-all shadow-lg"
                  >
                    <Share2 size={13} /> Copy Link
                  </button>
                )}

                {/* Delete */}
                {activeNote?.role === "OWNER" && (
                  <button
                    onClick={() => deleteNote(activeNoteId)}
                    className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 hover:bg-red-500/20 hover:text-red-500 transition-all text-stone-600 ml-2"
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
              <div className="absolute inset-0 bg-[#a81c1c]/10 blur-[80px] rounded-full animate-pulse" />
              <div className="relative w-32 h-32 bg-[#1c1917] border border-stone-800 rounded-[2.5rem] flex items-center justify-center text-[#a81c1c] rotate-6 animate-float shadow-2xl">
                <FileText size={48} />
              </div>
            </div>
            <div className="space-y-4 max-w-sm">
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
                System Idle
              </h3>
              <p className="text-stone-500 text-[10px] font-black leading-relaxed uppercase tracking-[0.2em]">
                Awaiting command. Select a memorandum or initiate a new entry.
              </p>
            </div>
            <button
              onClick={createNote}
              className="px-10 py-5 bg-[#a81c1c] hover:bg-[#991b1b] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95 shadow-2xl shadow-[#a81c1c]/40"
            >
              Initiate New Entry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
