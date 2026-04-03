import { FileText, Plus, Search, X } from "lucide-react";
import { cn } from "../../utils/cn";
import NoteItem from "./NoteItem";

const EmptyState = ({
  user,
  notes = [],
  searchTerm = "",
  onSearchChange,
  onSelectNote,
  onCreateNote,
}) => {
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
  );

  const isSearching = searchTerm.length > 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* 1. Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center">
        <div className="w-full max-w-4xl flex flex-col items-center px-4 pt-4 lg:py-24 lg:space-y-12 text-center">
          {/* Header Dashboard (Hidden on Mobile if notes exist) */}
          <div
            className={cn(
              "flex flex-col items-center space-y-6 lg:space-y-10 transition-all duration-300",
              notes.length > 0 || isSearching ? "hidden lg:flex" : "flex",
            )}
          >
            <div className="relative">
              <div
                className={cn(
                  "relative w-24 h-24 lg:w-32 lg:h-32 bg-card border border-border rounded-[2.5rem]",
                  "flex items-center justify-center text-brand-primary rotate-6 animate-float shadow-2xl",
                )}
              >
                <FileText
                  size={48}
                  className="hidden lg:block"
                />
                <FileText
                  size={40}
                  className="lg:hidden"
                />
              </div>
            </div>
            <div className="space-y-3 lg:space-y-4">
              <h3 className="text-2xl lg:text-3xl font-black text-foreground uppercase tracking-tighter font-['Outfit']">
                No Note Selected
              </h3>
              <p className="max-w-xs text-stone-500 text-[10px] font-black leading-relaxed uppercase tracking-[0.2em] font-['Outfit'] mx-auto">
                Select a note from the directory or create a new instance to
                begin.
              </p>

              {/* Desktop-only Action Button (In-flow) */}
              <button
                onClick={onCreateNote}
                className={cn(
                  "hidden lg:flex mx-auto mt-8 px-10 py-5 bg-brand-primary hover:bg-brand-hover text-white rounded-2xl",
                  "font-black text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95",
                  "shadow-2xl shadow-brand-primary/40 font-['Outfit'] cursor-pointer items-center justify-center gap-2",
                )}
              >
                Create New Note
              </button>
            </div>
          </div>

          {/* Search Bar - Mobile Only */}
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
                  {notes.length})
                </span>
              </div>
            </div>

            {/* List Results */}
            <div className="space-y-3 pb-2 w-full">
              {notes.length > 0 ? (
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
              ) : null}
            </div>
          </div>

          {/* Label Credit (Desktop Only) */}
          <p className="hidden lg:block text-[9px] font-black text-stone-700 uppercase tracking-[0.3em] pt-4">
            Daya Note &copy; 2026
          </p>
        </div>
      </div>

      {/* 2. Bottom Action Bar - ONLY show on desktop if needed, or hide if we want central button only */}
      {/* Since we have the central button for desktop and navbar button for mobile, we can hide this bar entirely */}
      <div className="hidden w-full bg-background/80 backdrop-blur-xl border-t border-border p-5 lg:p-8 flex justify-center shrink-0 z-50">
        <button
          onClick={onCreateNote}
          className={cn(
            "w-full max-w-xs px-8 py-4 lg:py-5 bg-brand-primary hover:bg-brand-hover text-white rounded-xl lg:rounded-2xl",
            "font-black text-[9px] lg:text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95",
            "shadow-2xl shadow-brand-primary/40 font-['Outfit'] cursor-pointer flex items-center justify-center gap-2",
          )}
        >
          <Plus size={14} />
          <span>Create New Note</span>
        </button>
      </div>
    </div>
  );
};

export default EmptyState;
