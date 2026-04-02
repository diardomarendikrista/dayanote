import { FileText, Clock, ChevronRight } from "lucide-react";
import { cn } from "../../utils/cn";

const EmptyState = ({ notes = [], onSelectNote, onCreateNote }) => {
  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 3);

  return (
    <div className="flex-1 flex flex-col justify-center items-center text-center p-6 lg:p-12 space-y-8 lg:space-y-10 overflow-y-auto custom-scrollbar">
      {/* Icon & Title */}
      <div className="flex flex-col items-center space-y-6 lg:space-y-10">
        <div className="relative">
          <div
            className={cn(
              "relative w-24 h-24 lg:w-32 lg:h-32 bg-card border border-border rounded-[2rem] lg:rounded-[2.5rem]",
              "flex items-center justify-center text-brand-primary rotate-6 animate-float shadow-2xl",
            )}
          >
            <FileText size={40} className="lg:hidden" />
            <FileText size={48} className="hidden lg:block" />
          </div>
        </div>
        <div className="space-y-3 lg:space-y-4 max-w-sm">
          <h3 className="text-2xl lg:text-3xl font-black text-foreground uppercase tracking-tighter font-['Outfit']">
            No Note Selected
          </h3>
          <p
            className={cn(
              "text-stone-500 text-[9px] lg:text-[10px] font-black leading-relaxed uppercase tracking-[0.2em] font-['Outfit'] px-4",
            )}
          >
            Select a note from the sidebar or create a new one to start writing.
          </p>
        </div>
      </div>

      {/* Mobile Recent Notes Section */}
      {recentNotes.length > 0 && (
        <div className="w-full max-w-xs space-y-4 lg:hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 px-1">
            <Clock size={12} className="text-brand-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 font-['Outfit']">
              Recent Activity
            </span>
          </div>
          <div className="space-y-2">
            {recentNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className="w-full flex items-center justify-between p-4 bg-muted/30 border border-border/50 rounded-2xl hover:bg-muted/50 transition-all group active:scale-[0.98] cursor-pointer"
              >
                <div className="flex items-center gap-3 overflow-hidden text-left">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                  <span className="text-[11px] font-black uppercase tracking-tight text-foreground truncate font-['Outfit']">
                    {note.title || "Untitled Note"}
                  </span>
                </div>
                <ChevronRight size={14} className="text-stone-700 group-hover:text-brand-primary transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Action */}
      <button
        onClick={onCreateNote}
        className={cn(
          "px-8 lg:px-10 py-4 lg:py-5 bg-brand-primary hover:bg-brand-hover text-white rounded-xl lg:rounded-2xl",
          "font-black text-[9px] lg:text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95",
          "shadow-2xl shadow-brand-primary/40 font-['Outfit'] cursor-pointer",
        )}
      >
        Create New Note
      </button>

      {/* Desktop Helper Text */}
      <p className="hidden lg:block text-[9px] font-black text-stone-700 uppercase tracking-[0.3em] pt-4">
        Daya Note Intelligence System &copy; 2026
      </p>
    </div>
  );
};

export default EmptyState;
