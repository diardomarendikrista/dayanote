import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import CollaborativeEditor from "../../components/CollaborativeEditor";
import NoteSettingsModal from "../../components/NoteSettingsModal";
import SettingsModal from "../../components/SettingsModal";
import CreateNoteModal from "../../components/CreateNoteModal";
import ConfirmModal from "../../components/ConfirmModal";
import { toast } from "../../components/Toast";
import { io } from "socket.io-client";
import { cn } from "../../utils/cn";

// Components
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileHeader from "./MobileHeader";
import EmptyState from "./EmptyState";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4015";

const Dashboard = () => {
  const { user, token, logout, theme, toggleTheme } = useAppStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeNoteId = searchParams.get("note");
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [saveStatus, setSaveStatus] = useState("idle");

  // Modal States
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);

  // Loading States
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [isDeletingNote, setIsDeletingNote] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
      setNotes((prev) => {
        const updated = prev.map((n) => (n.id === noteId ? { ...n, title, updatedAt: new Date().toISOString() } : n));
        return [...updated].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
    });

    socket.on("access_revoked", ({ noteId }) => {
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      if (activeNoteId === noteId) {
        setSearchParams({});
        toast.info("Access to this note has been revoked.", {
          duration: 5000,
        });
      }
    });

    socket.on("note_deleted", ({ noteId }) => {
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      if (activeNoteId === noteId) {
        setSearchParams({});
        toast.info("This note has been discarded by the owner.");
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
      setNotes((prev) => {
        const updated = prev.map((n) =>
          n.id === updatedNote.id ? { ...n, ...updatedNote } : n,
        );
        return [...updated].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
    });

    socket.on("check_access", async ({ noteId }) => {
      if (activeNoteId === noteId) {
        try {
          const res = await axios.get(`${API_URL}/api/notes/${noteId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setNotes((prev) => {
            const updated = prev.map((n) => (n.id === noteId ? { ...n, ...res.data } : n));
            return [...updated].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          });
        } catch (err) {
          if (err.response?.status === 403) {
            setNotes((prev) => prev.filter((n) => n.id !== noteId));
            setSearchParams({});
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

  const handleCreateNote = async (title) => {
    setIsCreatingNote(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/notes`,
        { title },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setNotes([res.data, ...notes]);
      setSearchParams({ note: res.data.id });
      setIsCreateModalOpen(false);
      toast.success("New note created successfully.");
    } catch (err) {
      toast.error("Failed to create note.");
    } finally {
      setIsCreatingNote(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!noteToDelete) return;
    setIsDeletingNote(true);
    try {
      await axios.delete(`${API_URL}/api/notes/${noteToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(notes.filter((n) => n.id !== noteToDelete));
      if (activeNoteId === noteToDelete) setSearchParams({});
      setIsDeleteModalOpen(false);
      setNoteToDelete(null);
      toast.success("Note has been permanently deleted.");
    } catch (err) {
      toast.error("Failed to delete note.");
    } finally {
      setIsDeletingNote(false);
    }
  };

  const handleConfirmLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
    toast.success("Logged out successfully.");
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
          setNotes((prev) => {
            const updated = prev.map((n) => (n.id === noteId ? { ...n, ...res.data } : n));
            return [...updated].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          });
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
    setNotes((prev) => {
      const updated = prev.map((n) =>
        n.id === activeNoteId
          ? { ...n, title: newTitle, updatedAt: new Date().toISOString() }
          : n,
      );
      return [...updated].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    });

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

  const handleLogoClick = () => {
    setSearchParams({});
    setIsSidebarOpen(false);
  };

  const updateActiveNoteInList = (updatedNote) => {
    setNotes((prev) => {
      const updated = prev.map((n) => (n.id === updatedNote.id ? updatedNote : n));
      return [...updated].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    });
  };

  const filteredNotes = notes.filter((n) =>
    (n.title || "Untitled").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const activeNote = notes.find((n) => n.id === activeNoteId);
  const canEdit = activeNote?.role === "OWNER" || activeNote?.role === "EDITOR";

  const handleBodyChange = useCallback(() => {
    setNotes((prev) => {
      const updated = prev.map((n) =>
        n.id === activeNoteId
          ? { ...n, updatedAt: new Date().toISOString() }
          : n,
      );
      // Only sort if the order actually changed significantly (optimistic)
      return [...updated].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    });
  }, [activeNoteId]);

  return (
    <div className="flex h-screen bg-background overflow-hidden text-foreground font-['Inter'] relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filteredNotes={filteredNotes}
        activeNoteId={activeNoteId}
        onSelectNote={(id) => {
          const isReturningFromHome = !activeNoteId;
          setSearchParams({ note: id }, { replace: !isReturningFromHome });
          setIsSidebarOpen(false);
        }}
        onCreateNote={() => setIsCreateModalOpen(true)}
        onLogoClick={handleLogoClick}
        user={user}
        onLogout={() => setIsLogoutModalOpen(true)}
        onOpenSettings={() => setIsUserModalOpen(true)}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col relative z-10 bg-background min-w-0">
        <MobileHeader
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onLogoClick={handleLogoClick}
          activeNoteId={activeNoteId}
          onCreateNote={() => setIsCreateModalOpen(true)}
        />

        {activeNoteId ? (
          <>
            <Header
              activeNote={activeNote}
              onLogoClick={handleLogoClick}
              onTitleChange={handleTitleChange}
              onTitleFocus={handleTitleFocus}
              onTitleBlur={handleTitleBlur}
              canEdit={canEdit}
              saveStatus={saveStatus}
              onOpenShareModal={() => setIsNoteModalOpen(true)}
              onDeleteNote={(id) => {
                setNoteToDelete(id);
                setIsDeleteModalOpen(true);
              }}
            />

            <div className="flex-1 overflow-y-auto p-4 lg:p-16 custom-scrollbar">
              <div className="max-w-4xl mx-auto">
                <CollaborativeEditor
                  key={activeNoteId}
                  noteId={activeNoteId}
                  onUpdate={handleBodyChange}
                  readOnly={!canEdit}
                />
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            user={user}
            notes={filteredNotes}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onSelectNote={(id) => {
              const isReturningFromHome = !activeNoteId;
              setSearchParams({ note: id }, { replace: !isReturningFromHome });
            }}
            onCreateNote={() => setIsCreateModalOpen(true)}
          />
        )}
      </div>

      <NoteSettingsModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        note={activeNote}
        onUpdate={updateActiveNoteInList}
        token={token}
      />

      <SettingsModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
      />

      {/* New Modals */}
      <CreateNoteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateNote}
        loading={isCreatingNote}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setNoteToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Note"
        message="Are you sure you want to permanently delete this note? This action cannot be undone."
        confirmText="Delete Note"
        variant="danger"
        icon="trash"
        loading={isDeletingNote}
      />

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Terminate Session"
        message="Are you sure you want to log out of your secure workspace?"
        confirmText="Logout Now"
        icon="logout"
      />
    </div>
  );
};

export default Dashboard;
