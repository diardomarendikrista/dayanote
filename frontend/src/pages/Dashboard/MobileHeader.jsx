/**
 * @fileoverview Mobile-specific header component for the Dashboard.
 * Provides access to the sidebar menu, home navigation, and quick note creation on smaller screens.
 */

import { Menu, Plus } from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * MobileHeader component.
 * 
 * @component
 * @param {Object} props - Component props.
 * @param {Function} props.onOpenSidebar - Callback to open the navigation sidebar.
 * @param {string} [props.activeNoteId] - ID of the currently active note, if any.
 * @param {Function} props.onLogoClick - Callback for clicking the logo/home link.
 * @param {Function} props.onCreateNote - Callback to initiate new note creation.
 * @returns {React.ReactElement}
 */
const MobileHeader = ({
  onOpenSidebar,
  activeNoteId,
  onLogoClick,
  onCreateNote,
}) => {
  return (
    <div className="lg:hidden h-14 border-b border-border bg-background flex items-center justify-between px-6 shrink-0 relative z-50">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-2 text-muted-foreground hover:text-brand-primary transition-colors cursor-pointer"
        >
          <Menu size={20} />
        </button>
        <button
          onClick={onLogoClick}
          className="hover:opacity-80 transition-opacity cursor-pointer text-left"
        >
          <h2 className="text-lg font-black tracking-tighter font-['Outfit'] text-foreground">
            DAYA<span className="text-brand-primary">NOTE</span>
          </h2>
        </button>
      </div>
      <div className="flex items-center gap-4">
        {activeNoteId && (
          <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
        )}
        <button
          onClick={onCreateNote}
          className={cn(
            "px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white rounded-xl active:scale-90 transition-all cursor-pointer shrink-0",
            "text-[9px] font-black uppercase tracking-[0.2em] font-['Outfit'] shadow-lg shadow-brand-primary/30",
          )}
        >
          + New Note
        </button>
      </div>
    </div>
  );
};

export default MobileHeader;
