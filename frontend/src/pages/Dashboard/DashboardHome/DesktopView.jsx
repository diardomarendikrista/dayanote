import { FileText } from "lucide-react";
import { cn } from "../../../utils/cn";

/**
 * DesktopView sub-component.
 * Displays the welcome splash screen for desktop users.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {Array} props.notes - List of notes.
 * @param {boolean} props.isSearching - Search state.
 * @param {Function} props.onCreateNote - Create note callback.
 */
const DesktopView = ({ notes, isSearching, onCreateNote }) => (
  <div
    className={cn(
      "hidden lg:flex flex-col items-center space-y-6 lg:space-y-10 transition-all duration-300",
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
        Select a note from the directory or create a new instance to begin.
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
);

export default DesktopView;
