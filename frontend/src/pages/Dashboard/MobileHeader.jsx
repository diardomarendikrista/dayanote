import { Menu } from "lucide-react";

const MobileHeader = ({ onOpenSidebar, activeNoteId }) => {
  return (
    <div className="lg:hidden h-14 border-b border-border bg-background/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-2 text-muted-foreground hover:text-brand-primary transition-colors cursor-pointer"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-lg font-black tracking-tighter font-['Outfit'] text-foreground">
          DAYA<span className="text-brand-primary">NOTE</span>
        </h2>
      </div>
      <div className="flex items-center gap-3">
        {activeNoteId && (
          <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
        )}
      </div>
    </div>
  );
};

export default MobileHeader;
