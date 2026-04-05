/**
 * @fileoverview UserProfile component for the Dashboard Sidebar.
 * Displays user information (name, avatar) and provides access to settings and logout.
 */

import { LogOut } from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * UserProfile component.
 * 
 * @component
 * @param {Object} props - Component props.
 * @param {Object} props.user - The current user object.
 * @param {Function} props.onLogout - Callback to initiate logout.
 * @param {Function} props.onOpenSettings - Callback to open the settings modal.
 * @returns {React.ReactElement}
 */
const UserProfile = ({ user, onLogout, onOpenSettings }) => {
  return (
    <div className="p-8 border-t border-border bg-sidebar mt-auto">
      <div className="flex items-center justify-between">
        <div 
          className="flex items-center gap-4 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
          onClick={onOpenSettings}
        >
          <div
            className={cn(
              "w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center",
              "text-white font-black shrink-0 shadow-lg shadow-brand-primary/20",
            )}
          >
            {user?.name?.charAt(0)}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span
              className={cn(
                "text-xs font-black truncate text-foreground uppercase tracking-widest font-['Outfit']",
              )}
            >
              {user?.name}
            </span>
            <span className="text-[10px] text-muted-foreground truncate uppercase tracking-tight font-bold">
              Authorized User
            </span>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="p-2 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
          title="Logout System"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
