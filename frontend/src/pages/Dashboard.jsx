import { useEffect, useState } from "react";
import axios from "axios";
import { useAppStore } from "../store/useAppStore";
import CollaborativeEditor from "../components/CollaborativeEditor";
import {
  LogOut,
  Plus,
  FileText,
  Share2,
  Trash2,
  Sun,
  Moon,
} from "lucide-react";

const Dashboard = () => {
  const { user, token, logout, theme, toggleTheme } = useAppStore();
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);

  const fetchNotes = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:4015"}/api/notes`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setNotes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchNotes();
  }, [token]);

  const createNote = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:4015"}/api/notes`,
        { title: "Catatan Baru" },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setNotes([res.data, ...notes]);
      setActiveNoteId(res.data.id);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNote = async (id) => {
    if (!confirm("Hapus catatan ini?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL || "http://localhost:4015"}/api/notes/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setNotes(notes.filter((n) => n.id !== id));
      if (activeNoteId === id) setActiveNoteId(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden text-zinc-900 dark:text-zinc-100">
      {/* Sidebar */}
      <div className="w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
        <div className="p-6 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-blue-600">DayaNote</h2>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
        <div className="p-4 flex-1 overflow-y-auto space-y-2">
          <button
            onClick={createNote}
            className="w-full flex items-center gap-2 p-3 bg-blue-600/10 text-blue-600 rounded-xl font-medium hover:bg-blue-600/20 transition-all mb-4"
          >
            <Plus size={20} /> Catatan Baru
          </button>
          {notes.map((note) => (
            <div
              key={note.id}
              className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${activeNoteId === note.id ? "bg-blue-600 text-white" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
              onClick={() => setActiveNoteId(note.id)}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText
                  size={18}
                  className="shrink-0"
                />
                <span className="truncate text-sm font-medium">
                  {note.title || "Untitled"}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNote(note.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/10 rounded-md"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium truncate max-w-[150px]">
              {user?.name}
            </div>
            <button
              onClick={logout}
              className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeNoteId ? (
          <>
            <div className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-8 bg-white dark:bg-zinc-900">
              <input
                type="text"
                value={notes.find((n) => n.id === activeNoteId)?.title || ""}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setNotes(
                    notes.map((n) =>
                      n.id === activeNoteId ? { ...n, title: newTitle } : n,
                    ),
                  );
                }}
                className="text-xl font-bold bg-transparent outline-none border-none focus:ring-0 w-full max-w-xl"
                placeholder="Judul Catatan"
              />
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-sm font-medium">
                  <Share2 size={18} /> Bagikan
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-4xl mx-auto">
                <CollaborativeEditor noteId={activeNoteId} />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-zinc-400 gap-4">
            <div className="p-8 bg-zinc-100 dark:bg-zinc-900 rounded-full">
              <FileText size={48} />
            </div>
            <p className="text-lg">
              Pilih catatan untuk mulai menulis atau kolaborasi
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
