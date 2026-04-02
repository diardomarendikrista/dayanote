import { Sun, Moon, X, Plus } from "lucide-react";
import { cn } from "../../utils/cn";
import NoteItem from "./NoteItem";
import UserProfile from "./UserProfile";

const Sidebar = ({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
  searchTerm,
  onSearchChange,
  filteredNotes,
  activeNoteId,
  onSelectNote,
  onCreateNote,
  user,
  onLogout,
  onOpenSettings,
}) => {
  return (
    <div
      className={cn(
        "bg-sidebar border-r border-border flex flex-col fixed inset-y-0 left-0 z-50 w-80 lg:relative lg:translate-x-0 transition-transform duration-350 ease-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="p-8 lg:p-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2
            className={cn(
              "text-2xl font-black tracking-tighter font-['Outfit'] text-foreground",
            )}
          >
            DAYA<span className="text-brand-primary">NOTE</span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            className={cn(
              "w-8 h-8 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center",
              "transition-colors shadow-lg border border-border cursor-pointer",
            )}
          >
            {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
          </button>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="px-8 mb-8">
        <input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
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
          onClick={onCreateNote}
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
          <NoteItem
            key={note.id}
            note={note}
            isActive={activeNoteId === note.id}
            userId={user?.id}
            onClick={() => onSelectNote(note.id)}
          />
        ))}
      </div>

      <UserProfile
        user={user}
        onLogout={onLogout}
        onOpenSettings={onOpenSettings}
      />
    </div>
  );
};

export default Sidebar;
