/**
 * @fileoverview Collaborative Editor component using TipTap and Y.js.
 * Handles real-time synchronization via Hocuspocus and offline persistence via IndexedDB.
 */

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Collaboration from "@tiptap/extension-collaboration";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { IndexeddbPersistence } from "y-indexeddb";
import { useEffect, useState, useRef } from "react";
import { useAppStore } from "../store/useAppStore";
import { Lock, Eye } from "lucide-react";
import { cn } from "../utils/cn";

/**
 * A reusable toolbar button for the editor.
 * 
 * @param {Object} props - Component props.
 * @param {Function} props.onClick - Click handler.
 * @param {boolean} props.isActive - Whether the styling for this button is currently active.
 * @param {boolean} props.disabled - Whether the button is disabled.
 * @param {string} props.title - Tooltip text.
 * @param {React.ReactNode} props.children - Icon or text content.
 */
const ToolbarButton = ({ onClick, isActive, disabled, title, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      "w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all cursor-pointer",
      isActive
        ? "bg-brand-primary text-white shadow-sm"
        : "text-muted-foreground hover:text-foreground hover:bg-muted",
      disabled && "opacity-30 cursor-not-allowed",
    )}
  >
    {children}
  </button>
);

/**
 * The editor toolbar containing formatting options.
 * Shows a simplified "Read Only" indicator if the user cannot edit.
 * 
 * @param {Object} props - Component props.
 * @param {Object} props.editor - TipTap editor instance.
 * @param {boolean} props.readOnly - Whether the editor is in read-only mode.
 */
const EditorToolbar = ({ editor, readOnly }) => {
  if (!editor || readOnly)
    return (
      <div
        className={cn(
          "flex items-center gap-3 px-6 py-3 border-b border-border bg-background/50",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-1 bg-muted border border-border rounded-lg",
            "text-[9px] font-black text-muted-foreground uppercase tracking-widest",
          )}
        >
          <Eye
            size={12}
            className="text-brand-primary"
          />{" "}
          Read Only Access
        </div>
      </div>
    );

  return (
    <div
      className={cn(
        "flex items-center gap-1 px-4 py-2.5 border-b border-border bg-background flex-wrap",
      )}
    >
      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
        title="Heading 1"
      >
        H1
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
      >
        H3
      </ToolbarButton>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Bold / Italic / Strike */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="Bold (Ctrl+B)"
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="Italic (Ctrl+I)"
      >
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        title="Strikethrough"
      >
        <span style={{ textDecoration: "line-through" }}>S</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive("code")}
        title="Inline Code"
      >
        {"<>"}
      </ToolbarButton>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title="Bullet List"
      >
        •≡
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title="Ordered List"
      >
        1≡
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        isActive={editor.isActive("taskList")}
        title="Task List (Checklist)"
      >
        ☑
      </ToolbarButton>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Block */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        title="Blockquote"
      >
        "
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive("codeBlock")}
        title="Code Block"
      >
        {"{ }"}
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        isActive={false}
        title="Horizontal Rule"
      >
        —
      </ToolbarButton>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Undo / Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo (Ctrl+Z)"
      >
        ↩
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo (Ctrl+Y)"
      >
        ↪
      </ToolbarButton>
    </div>
  );
};

/**
 * The active editor instance wrapper.
 * Manages TipTap configuration and update events.
 * 
 * @param {Object} props - Component props.
 * @param {Y.Doc} props.ydoc - The Y.js document instance.
 * @param {boolean} props.readOnly - Whether the editor is in read-only mode.
 * @param {Function} props.onUpdate - Callback triggered when the content changes.
 * @param {React.MutableRefObject<boolean>} props.isSynced - Ref tracking if initial synchronization is complete.
 */
const EditorInstance = ({ ydoc, readOnly, onUpdate, isSynced }) => {

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({ history: false }),
        Collaboration.configure({ document: ydoc }),
        TaskList.configure({ HTMLAttributes: { class: "not-prose pl-2" } }),
        TaskItem.configure({ nested: true }),
      ],
      editable: !readOnly,
      content: "",
      editorProps: {
        attributes: {
          class:
            "focus:outline-none min-h-[500px] max-w-none text-base md:text-lg leading-relaxed",
        },
      },
      onUpdate: ({ editor }) => {
        /**
         * Trigger onUpdate callback only for user-initiated changes
         * or after initial synchronization to avoid redundant save triggers on load.
         */
        if ((editor.isFocused || isSynced.current) && typeof onUpdate === "function") {
          onUpdate();
        }
      },
    },
    [ydoc, readOnly],
  ); // Crucial: Remount if ydoc or readOnly changes

  if (!editor) return null;

  return (
    <div>
      <EditorToolbar
        editor={editor}
        readOnly={readOnly}
      />
      <div className="p-4 md:p-8">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

/**
 * Main Collaborative Editor component.
 * Sets up Y.js document, IndexedDB persistence, and Hocuspocus WebSocket provider.
 * 
 * @param {Object} props - Component props.
 * @param {string} props.noteId - The ID of the note to load.
 * @param {Function} props.onUpdate - Callback triggered when the content changes.
 * @param {boolean} [props.readOnly=false] - Whether the editor is in read-only mode.
 * @returns {React.ReactElement}
 */
const CollaborativeEditor = ({ noteId, onUpdate, readOnly = false }) => {
  const { token } = useAppStore();
  const [ydoc, setYdoc] = useState(null);
  const isSynced = useRef(false);
  const [status, setStatus] = useState("connecting");

  /**
   * Effect to initialize and clean up collaborative document resources.
   */
  useEffect(() => {
    if (!noteId) return;

    setYdoc(null);
    setStatus("connecting");

    const doc = new Y.Doc();
    
    /**
     * Local persistence using IndexedDB.
     */
    const idb = new IndexeddbPersistence(noteId, doc);
    
    /**
     * WebSocket provider for real-time synchronization.
     */
    const hp = new HocuspocusProvider({
      url: import.meta.env.VITE_WS_URL || "ws://localhost:4015",
      name: noteId,
      document: doc,
      token: token || "", // Guest access support
      onConnect: () => setStatus("connected"),
      onDisconnect: () => setStatus("offline"),
      onAuthenticationFailed: () => setStatus("denied"),
      onSynced: () => {
        /**
         * Mark as synced after initial load.
         * Delay prevents race conditions with local state during massive initial updates.
         */
        setTimeout(() => {
          isSynced.current = true;
        }, 800);
      },
    });

    /**
     * Slight delay for Y.js initialization before rendering the editor.
     */
    const timer = setTimeout(() => setYdoc(doc), 50);

    return () => {
      clearTimeout(timer);
      hp.destroy();
      idb.destroy();
      doc.destroy();
    };
  }, [noteId, token]);

  /**
   * Render Access Denied state.
   */
  if (status === "denied") {
    return (
      <div
        className={cn(
          "flex flex-col justify-center items-center min-h-[400px] space-y-4 bg-muted/30",
          "rounded-2xl border border-brand-primary/20",
        )}
      >
        <Lock
          size={32}
          className="text-brand-primary mb-2"
        />
        <h3 className="text-sm font-black text-foreground uppercase tracking-widest font-['Outfit']">
          Access Restricted
        </h3>
        <p className="text-xs text-stone-500 uppercase tracking-widest font-['Outfit']">
          You do not have permission to view this note.
        </p>
      </div>
    );
  }

  /**
   * Render Loading/Synchronizing state.
   */
  if (!ydoc) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        <p
          className={cn(
            "text-xs font-black text-stone-500 uppercase tracking-widest font-['Outfit']",
          )}
        >
          Synchronizing Instance...
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Real-time synchronization status badge */}
      <div className="absolute -top-10 right-0 flex items-center gap-2">
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border",
            status === "connected"
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              : "bg-orange-500/10 text-orange-400 border-orange-500/20 animate-pulse",
          )}
        >
          <div
            className={cn(
              "w-1 h-1 rounded-full",
              status === "connected" ? "bg-emerald-500" : "bg-orange-400",
            )}
          />
          {status === "connected"
            ? readOnly
              ? "Live View Active"
              : "Live Sync Active"
            : "Reconnecting..."}
        </div>
      </div>

      <div
        className={cn(
          "bg-card rounded-[2rem] border border-border overflow-hidden",
          "shadow-[0_0_80px_-20px_rgba(168,28,28,0.1)] focus-within:border-brand-primary/50 transition-all duration-500",
        )}
      >
        <EditorInstance
          ydoc={ydoc}
          onUpdate={onUpdate}
          readOnly={readOnly}
          isSynced={isSynced}
        />
      </div>
    </div>
  );
};

export default CollaborativeEditor;
