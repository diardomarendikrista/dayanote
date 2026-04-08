import { FileText, Search, X } from "lucide-react";
import { cn } from "../../../utils/cn";
import NoteItem from "../NoteItem";

/**
 * MobileView sub-component.
 * Displays the search and note list interface for mobile users.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {Array} props.notes - Filtered list of notes.
 * @param {string} props.searchTerm - Current search string.
 * @param {Function} props.onSearchChange - Search change callback.
 * @param {Function} props.onSelectNote - Note selection callback.
 * @param {Object} props.user - Current user object.
 * @param {Array} props.sortedNotes - Notes sorted for display.
 * @param {boolean} props.isSearching - Search state.
 */
const MobileView = ({
  notes,
  searchTerm,
  onSearchChange,
  onSelectNote,
  user,
  sortedNotes,
  isSearching,
  isLoading,
}) => (
  <div className="w-full max-w-xs space-y-4 lg:hidden">
    <div className="relative group">
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 group-focus-within:text-brand-primary transition-colors"
        size={14}
      />
      <input
        type="text"
        placeholder="Search notes..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className={cn(
          "w-full bg-muted/40 border border-border/50 rounded-2xl py-4 pl-11 pr-11 text-[11px] font-medium outline-none",
          "focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/40 transition-all",
          "placeholder:text-stone-500 font-['Inter']",
        )}
      />
      {isSearching && (
        <button
          onClick={() => onSearchChange("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
        >
          <X
            size={14}
            className="text-stone-500"
          />
        </button>
      )}
    </div>

    {/* List Header */}
    <div className="flex items-center justify-between px-1">
      <div className="flex items-center gap-2">
        <FileText
          size={12}
          className="text-brand-primary"
        />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 font-['Outfit']">
          {isSearching ? "Search Results" : "Notes Directory"} (
          {isLoading ? "..." : notes.length})
        </span>
      </div>
    </div>

    {/* List Results / Skeleton / Empty State */}
    <div className="space-y-3 pb-2 w-full">
      {isLoading ? (
        [...Array(6)].map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className="h-[50.1px] w-full rounded-2xl bg-muted/20 animate-pulse border border-border/50"
          />
        ))
      ) : notes.length > 0 ? (
        sortedNotes.map((note) => (
          <NoteItem
            key={note.id}
            note={note}
            userId={user?.id}
            onClick={() => onSelectNote(note.id)}
            showChevron={true}
            compact={true}
          />
        ))
      ) : isSearching ? (
        <div className="py-12 flex flex-col items-center space-y-3 opacity-50">
          <Search
            size={24}
            className="text-stone-500"
          />
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-500">
            No results for "{searchTerm}"
          </p>
        </div>
      ) : (
        <div className="py-24 flex flex-col items-center justify-center space-y-2 opacity-50">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 font-['Outfit']">
            Your directory is empty
          </p>
        </div>
      )}
    </div>
  </div>
);

export default MobileView;
