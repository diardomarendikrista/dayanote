import { FileText, Lock, Globe, Users, ChevronRight } from "lucide-react";
import { cn } from "../../utils/cn";

const NoteItem = ({
  note,
  isActive,
  onClick,
  userId,
  showChevron = false,
  compact = false,
}) => {
  const getStatusIcon = (size = 10) => {
    const isShared =
      !note.isPublic &&
      (note._count?.permissions > 0 ||
        note.permissions?.length > 0 ||
        note.ownerId !== userId);

    if (note.isPublic)
      return (
        <Globe
          size={size}
          className="shrink-0"
        />
      );
    if (isShared)
      return (
        <Users
          size={size}
          className="shrink-0"
        />
      );
    return (
      <Lock
        size={size}
        className="shrink-0"
      />
    );
  };

  const getStatusText = () => {
    const isShared =
      !note.isPublic &&
      (note._count?.permissions > 0 ||
        note.permissions?.length > 0 ||
        note.ownerId !== userId);

    if (note.isPublic) return "Public";
    if (isShared) return "Shared";
    return "Private";
  };

  return (
    <div
      className={cn(
        "group flex items-center justify-between rounded-2xl cursor-pointer transition-all border shrink-0",
        compact ? "p-4" : "p-4", // Keeping p-4 but layout inside changes
        isActive
          ? "bg-brand-primary border-brand-primary text-white shadow-xl shadow-brand-primary/20"
          : "bg-muted/30 border-border hover:border-brand-primary/30 text-muted-foreground hover:text-foreground",
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        {compact ? (
          <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
        ) : (
          <div className="relative shrink-0">
            <FileText
              size={16}
              className={cn(
                "transition-colors",
                isActive
                  ? "text-white"
                  : "text-muted-foreground group-hover:text-brand-primary",
              )}
            />
          </div>
        )}

        <div
          className={cn(
            "flex overflow-hidden text-left",
            compact ? "flex-row items-center gap-2" : "flex-col",
          )}
        >
          <span
            className={cn(
              "truncate font-black uppercase tracking-tight font-['Outfit']",
              compact ? "text-[11px]" : "text-sm",
              isActive ? "text-white" : "text-foreground",
            )}
          >
            {note.title || "Untitled Note"}
          </span>

          {compact ? (
            <div
              className={cn(
                "opacity-60",
                isActive ? "text-white" : "text-brand-primary",
              )}
            >
              {getStatusIcon(12)}
            </div>
          ) : (
            <div
              className={cn(
                "flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold",
                isActive ? "text-red-100" : "text-muted-foreground/85",
              )}
            >
              {getStatusIcon()}
              <span>{getStatusText()}</span>
              <span className="opacity-40">·</span>
              <span>ID: {note.id.substring(0, 8)}</span>
            </div>
          )}
        </div>
      </div>

      {showChevron && (
        <ChevronRight
          size={14}
          className={cn(
            "transition-transform group-hover:translate-x-0.5",
            isActive ? "text-white" : "text-muted-foreground",
          )}
        />
      )}
    </div>
  );
};

export default NoteItem;
