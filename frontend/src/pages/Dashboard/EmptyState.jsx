import { FileText } from "lucide-react";
import { cn } from "../../utils/cn";

const EmptyState = ({ onCreateNote }) => {
  return (
    <div className="flex-1 flex flex-col justify-center items-center text-center p-12 space-y-10">
      <div className="relative">
        <div
          className={cn(
            "relative w-32 h-32 bg-card border border-border rounded-[2.5rem]",
            "flex items-center justify-center text-brand-primary rotate-6 animate-float shadow-2xl",
          )}
        >
          <FileText size={48} />
        </div>
      </div>
      <div className="space-y-4 max-w-sm">
        <h3 className="text-3xl font-black text-foreground uppercase tracking-tighter font-['Outfit']">
          No Note Selected
        </h3>
        <p
          className={cn(
            "text-stone-500 text-[10px] font-black leading-relaxed uppercase tracking-[0.2em] font-['Outfit']",
          )}
        >
          Select a note from the sidebar or create a new one to start
          writing.
        </p>
      </div>
      <button
        onClick={onCreateNote}
        className={cn(
          "px-10 py-5 bg-brand-primary hover:bg-brand-hover text-white rounded-2xl",
          "font-black text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95",
          "shadow-2xl shadow-brand-primary/40 font-['Outfit'] cursor-pointer",
        )}
      >
        Create New Note
      </button>
    </div>
  );
};

export default EmptyState;
