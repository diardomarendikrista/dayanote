/**
 * @fileoverview Toast notification system.
 * Provides a global `toast` object for displaying success, error, and info messages.
 * Includes a `ToastContainer` that must be rendered at the root of the app.
 */

import { useEffect, useState } from "react";
import { Check, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "../utils/cn";

/**
 * Toast configuration for different notification types.
 */
const ICONS = {
  success: {
    icon: Check,
    bg: "bg-card dark:bg-emerald-500/10",
    border: "border-emerald-500/30 dark:border-emerald-500/20",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  error: {
    icon: AlertTriangle,
    bg: "bg-card dark:bg-red-500/10",
    border: "border-red-500/30 dark:border-red-500/20",
    text: "text-red-700 dark:text-red-400",
    dot: "bg-red-500",
  },
  info: {
    icon: Info,
    bg: "bg-card dark:bg-brand-primary/10",
    border: "border-brand-primary/30 dark:border-brand-primary/20",
    text: "text-brand-primary",
    dot: "bg-brand-primary",
  },
};

/**
 * Singleton toast manager.
 * Internally used to connect the `toast` object calls to the `ToastContainer` state.
 */
let addToastFn = null;

/**
 * Global toast API.
 */
export const toast = {
  success: (message) => addToastFn?.({ message, type: "success" }),
  error: (message) => addToastFn?.({ message, type: "error" }),
  info: (message) => addToastFn?.({ message, type: "info" }),
};

/**
 * Individual toast item component.
 * Handles its own entrance/exit animations and auto-dismiss timer.
 * 
 * @param {Object} props - Component props.
 * @param {number} props.id - Unique ID of the toast.
 * @param {string} props.message - Message to display.
 * @param {string} props.type - Type of toast ('success', 'error', 'info').
 * @param {Function} props.onRemove - Callback to remove the toast from global state.
 */
const ToastItem = ({ id, message, type, onRemove }) => {
  const { icon: Icon, bg, border, text, dot } = ICONS[type] || ICONS.info;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const t1 = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss after 4s
    const t2 = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(id), 300);
    }, 4000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-300 font-['Outfit']",
        bg,
        border,
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      )}
    >
      <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", dot)} />
      <Icon
        size={15}
        className={text}
      />
      <span className={cn("text-[14px] font-bold", text)}>{message}</span>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(() => onRemove(id), 300);
        }}
        className={cn(
          "ml-3 opacity-60 hover:opacity-100 transition-opacity",
          text,
        )}
      >
        <X size={13} />
      </button>
    </div>
  );
};

/**
 * Toast container component.
 * Manages the list of active toasts and provides the bridge to the global `toast` API.
 * 
 * @returns {React.ReactElement}
 */
const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    addToastFn = ({ message, type }) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
    };
    return () => {
      addToastFn = null;
    };
  }, []);

  /**
   * Internal helper to remove a toast by ID.
   * @param {number} id - The ID of the toast to remove.
   */
  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-[9999] max-w-sm">
      {toasts.map((t) => (
        <ToastItem
          key={t.id}
          {...t}
          onRemove={remove}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
