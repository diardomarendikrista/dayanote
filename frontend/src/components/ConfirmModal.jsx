/**
 * @fileoverview A confirmation modal component for critical actions.
 * Provides a consistent UI for confirming destructive or significant actions.
 */

import Modal from "./Modal";
import { cn } from "../utils/cn";
import { AlertCircle, Trash2, LogOut } from "lucide-react";

/**
 * ConfirmModal component.
 * 
 * @component
 * @param {Object} props - Component props.
 * @param {boolean} props.isOpen - Whether the modal is visible.
 * @param {Function} props.onClose - Callback to close the modal.
 * @param {Function} props.onConfirm - Callback triggered when the confirm button is clicked.
 * @param {string} props.title - Title text of the modal.
 * @param {string} props.message - Descriptive message for the user.
 * @param {string} [props.confirmText="Confirm Action"] - Label for the confirmation button.
 * @param {string} [props.cancelText="Cancel"] - Label for the cancel button.
 * @param {string} [props.variant="primary"] - Visual style variant ('primary' or 'danger').
 * @param {string} [props.icon="alert"] - Icon to display ('alert', 'trash', or 'logout').
 * @param {boolean} [props.loading=false] - Whether the modal is in a loading state.
 */
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm Action",
  cancelText = "Cancel",
  variant = "primary", // 'primary', 'danger'
  icon = "alert", // 'alert', 'trash', 'logout'
  loading = false,
}) => {
  /**
   * Helper to determine which icon to display based on the `icon` prop.
   * @returns {React.ReactElement}
   */
  const getIcon = () => {
    switch (icon) {
      case "trash":
        return <Trash2 size={40} className="text-red-500" />;
      case "logout":
        return <LogOut size={40} className="text-stone-500" />;
      default:
        return <AlertCircle size={40} className="text-brand-primary" />;
    }
  };

  /**
   * Footer content containing the action buttons.
   */
  const footer = (
    <>
      <button
        onClick={onClose}
        className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        disabled={loading}
      >
        {cancelText}
      </button>
      <button
        onClick={onConfirm}
        disabled={loading}
        className={cn(
          "px-8 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg cursor-pointer disabled:opacity-50",
          variant === "danger"
            ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
            : "bg-brand-primary hover:bg-brand-hover text-white shadow-brand-primary/20"
        )}
      >
        {loading ? "Processing..." : confirmText}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="relative group">
          <div className={cn(
            "absolute inset-0 blur-2xl rounded-full transition-all group-hover:bg-opacity-20",
            variant === "danger" ? "bg-red-500/10" : "bg-brand-primary/10"
          )} />
          <div className="relative w-24 h-24 bg-card border border-border rounded-[2.5rem] flex items-center justify-center shadow-xl rotate-6 group-hover:rotate-0 transition-transform duration-500">
            {getIcon()}
          </div>
        </div>
        <p className="text-sm font-black text-stone-500 uppercase tracking-tight leading-relaxed max-w-[280px]">
          {message}
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
