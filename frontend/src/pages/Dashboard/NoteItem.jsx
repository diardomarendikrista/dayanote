import { FileText } from "lucide-react";
import { cn } from "../../utils/cn";

const NoteItem = ({ note, isActive, onClick, userId }) => {
  return (
    <div
      className={cn(
        "group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border",
        isActive
          ? "bg-brand-primary border-brand-primary text-white shadow-xl shadow-brand-primary/20"
          : "bg-muted/30 border-border hover:border-brand-primary/30 text-muted-foreground hover:text-foreground",
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <FileText
          size={16}
          className={cn(
            "transition-colors",
            isActive
              ? "text-white"
              : "text-muted-foreground group-hover:text-brand-primary",
          )}
        />
        <div className="flex flex-col overflow-hidden">
          <span className="truncate text-sm font-black uppercase tracking-tight font-['Outfit']">
            {note.title || "Untitled Note"}
          </span>
          <span
            className={cn(
              "text-[10px] uppercase tracking-wider font-bold",
              isActive
                ? "text-red-100"
                : "text-muted-foreground/60",
            )}
          >
            {!note.isPublic &&
            (note._count?.permissions > 0 ||
              note.permissions?.length > 0 ||
              note.ownerId !== userId)
              ? "🔒 Shared"
              : note.isPublic
                ? "🌐 Public"
                : "🔒 Private"}{" "}
            · ID: {note.id.substring(0, 8)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NoteItem;
