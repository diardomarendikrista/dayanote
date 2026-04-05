/**
 * @fileoverview Generic Modal component with consistent styling.
 * Acts as a base for other specialized modals in the application.
 */

import { X } from "lucide-react";
import { cn } from "../utils/cn";

/**
 * Modal component.
 * 
 * @component
 * @param {Object} props - Component props.
 * @param {boolean} props.isOpen - Whether the modal is visible.
 * @param {Function} props.onClose - Callback to close the modal.
 * @param {string} props.title - Main title text.
 * @param {string} [props.subtitle] - Optional subtitle text.
 * @param {React.ReactNode} props.children - Modal body content.
 * @param {React.ReactNode} [props.footer] - Optional footer content (usually buttons).
 * @param {string} [props.maxWidth="max-w-lg"] - Tailwind max-width class.
 * @param {boolean} [props.showCloseBtn=true] - Whether to show the close (X) button in the header.
 * @returns {React.ReactElement|null}
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = "max-w-lg",
  showCloseBtn = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-sm bg-black/60 font-['Inter'] animate-in fade-in duration-300">
      <div
        className={cn(
          "bg-card border border-border w-full rounded-[2.5rem] overflow-hidden",
          "shadow-2xl animate-in zoom-in duration-300",
          maxWidth
        )}
      >
        {/* Header */}
        <div className="p-8 border-b border-border/50 flex items-center justify-between bg-muted/30">
          <div>
            <h3 className="text-xl font-black text-foreground uppercase tracking-tighter font-['Outfit']">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 font-['Outfit']">
                {subtitle}
              </p>
            )}
          </div>
          {showCloseBtn && (
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-8">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-8 pb-8 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
