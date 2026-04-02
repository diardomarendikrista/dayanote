import { Check, Share2, Trash2 } from "lucide-react";
import { cn } from "../../utils/cn";
import { toast } from "../../components/Toast";

const Header = ({
  activeNote,
  onTitleChange,
  onTitleFocus,
  onTitleBlur,
  canEdit,
  saveStatus,
  onOpenShareModal,
  onDeleteNote,
}) => {
  return (
    <div className="h-18 lg:h-24 border-b border-border flex items-center justify-between px-6 lg:px-12 bg-background/50 backdrop-blur-md gap-4 lg:gap-6 shrink-0">
      {/* Title */}
      <div className="flex items-center gap-3 lg:gap-4 flex-1 overflow-hidden">
        <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
        <input
          type="text"
          value={activeNote?.title || ""}
          onChange={onTitleChange}
          onFocus={onTitleFocus}
          onBlur={onTitleBlur}
          disabled={!canEdit}
          className={cn(
            "text-lg lg:text-2xl font-black bg-transparent outline-none border-none focus:ring-0 w-full",
            "placeholder:text-muted/50 uppercase tracking-tighter text-foreground min-w-0 disabled:opacity-50 font-['Outfit']",
          )}
          placeholder="Note Title"
        />
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Save status */}
        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-stone-600 mr-2">
          {saveStatus === "saving" && (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-600 animate-pulse" />
              <span className="text-yellow-600">Saving...</span>
            </>
          )}
          {saveStatus === "saved" && (
            <>
              <Check
                size={12}
                className="text-emerald-500"
              />
              <span className="text-emerald-500">Saved</span>
            </>
          )}
        </div>

        {/* Manage Access button */}
        {activeNote?.role === "OWNER" ? (
          <button
            onClick={onOpenShareModal}
            className={cn(
              "flex items-center gap-2 px-3 lg:px-6 py-2 lg:py-2.5 bg-brand-primary/10 border border-brand-primary/30 rounded-xl",
              "text-[9px] font-black uppercase tracking-[0.2em] text-brand-primary hover:bg-brand-primary",
              "hover:text-white transition-all shadow-lg font-['Outfit'] cursor-pointer",
            )}
          >
            <Share2 size={13} />{" "}
            <span className="hidden sm:inline">Share Note</span>
          </button>
        ) : (
          <button
            onClick={() => {
              navigator.clipboard.writeText(
                `${window.location.origin}/note/${activeNote?.id}`,
              );
              toast.success("Link copied!");
            }}
            className={cn(
              "flex items-center gap-2 px-3 lg:px-6 py-2 lg:py-2.5 bg-stone-900 border border-stone-800 rounded-xl",
              "text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 hover:text-white",
              "transition-all shadow-lg cursor-pointer",
            )}
          >
            <Share2 size={13} />{" "}
            <span className="hidden sm:inline">Copy Link</span>
          </button>
        )}

        {/* Delete */}
        {activeNote?.role === "OWNER" && (
          <button
            onClick={() => onDeleteNote(activeNote.id)}
            className={cn(
              "p-2.5 rounded-xl bg-muted border border-border hover:bg-red-500/20 hover:text-red-500",
              "transition-all text-muted-foreground ml-2 cursor-pointer",
            )}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
