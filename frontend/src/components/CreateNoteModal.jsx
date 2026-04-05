/**
 * @fileoverview Modal component for creating a new note.
 * Includes a form for entering the note title and handles submission.
 */

import { useState } from "react";
import Modal from "./Modal";
import { cn } from "../utils/cn";
import { Plus, Check, FileText } from "lucide-react";

/**
 * CreateNoteModal component.
 * 
 * @component
 * @param {Object} props - Component props.
 * @param {boolean} props.isOpen - Whether the modal is visible.
 * @param {Function} props.onClose - Callback to close the modal.
 * @param {Function} props.onCreate - Callback triggered when the note is created, receives the title.
 * @param {boolean} [props.loading=false] - Whether the modal is in a loading state.
 */
const CreateNoteModal = ({ isOpen, onClose, onCreate, loading = false }) => {
  const [title, setTitle] = useState("");

  /**
   * Handles the form submission for creating a new note.
   * @param {React.FormEvent} e - Form event.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate(title);
    setTitle(""); // Reset for next time
  };

  /**
   * Footer content containing action buttons.
   */
  const footer = (
    <>
      <button
        onClick={onClose}
        className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        disabled={loading}
      >
        Cancel
      </button>
      <button
        onClick={handleSubmit}
        disabled={loading || !title.trim()}
        className={cn(
          "px-8 py-3 bg-brand-primary hover:bg-brand-hover text-white rounded-xl",
          "text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg shadow-brand-primary/20 cursor-pointer disabled:opacity-50",
          "flex items-center gap-2",
        )}
      >
        {loading ? (
          "Initializing..."
        ) : (
          <>
            <Check size={14} /> Create
            <span className="hidden sm:inline"> Note</span>
          </>
        )}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Note"
      subtitle="Define Identity for New Note"
      footer={footer}
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
            Note Title
          </label>
          <div className="relative group">
            <FileText
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-primary transition-colors"
            />
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Project Roadmap 2026"
              required
              className={cn(
                "w-full pl-12 pr-4 py-3.5 bg-input border border-border rounded-2xl text-sm font-bold",
                "focus:ring-1 focus:ring-brand-primary outline-none transition-all",
                "placeholder:text-muted-foreground/50 text-foreground shadow-inner",
              )}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreateNoteModal;
