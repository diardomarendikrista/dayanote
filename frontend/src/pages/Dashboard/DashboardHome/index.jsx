/**
 * @fileoverview DashboardHome central hub.
 * Coordinates between DesktopView and MobileView based on screen size and app state.
 */

import { Plus } from "lucide-react";
import { cn } from "../../../utils/cn";
import DesktopView from "./DesktopView";
import MobileView from "./MobileView";

/**
 * DashboardHome component.
 * 
 * @component
 * @param {Object} props - Component props.
 * @param {Object} props.user - Current user object.
 * @param {Array} [props.notes=[]] - List of filtered notes.
 * @param {string} [props.searchTerm=""] - Current search query.
 * @param {Function} props.onSearchChange - Callback for search input changes.
 * @param {Function} props.onSelectNote - Callback for selecting a note.
 * @param {Function} props.onCreateNote - Callback for creating a new note.
 * @returns {React.ReactElement}
 */
const DashboardHome = ({
  user,
  notes = [],
  searchTerm = "",
  isLoading = false,
  onSearchChange,
  onSelectNote,
  onCreateNote,
}) => {
  /**
   * Notes sorted by modification date for display in the mobile list.
   */
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
  );

  const isSearching = searchTerm.length > 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center">
        <div className="w-full max-w-4xl flex flex-col items-center px-4 pt-4 lg:py-24 lg:space-y-12 text-center">
          
          <DesktopView 
            notes={notes} 
            isSearching={isSearching} 
            isLoading={isLoading}
            onCreateNote={onCreateNote} 
          />

          <MobileView
            notes={notes}
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            onSelectNote={onSelectNote}
            user={user}
            sortedNotes={sortedNotes}
            isSearching={isSearching}
            isLoading={isLoading}
          />

          {/* Label Credit (Desktop Only) */}
          <p className="hidden lg:block text-[9px] font-black text-stone-700 uppercase tracking-[0.3em] pt-4">
            Daya Note &copy; 2026
          </p>
        </div>
      </div>

      {/* Bottom Action Bar - Hidden for logic consistency with original */}
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

export default DashboardHome;
