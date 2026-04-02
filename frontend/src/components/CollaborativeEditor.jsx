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

// Toolbar button component
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

// Toolbar component
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
        // Only trigger update if the editor is focused (user interaction) OR if it's already synced (remote interaction)
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

const CollaborativeEditor = ({ noteId, onUpdate, readOnly = false }) => {
  const { token } = useAppStore();
  const [ydoc, setYdoc] = useState(null);
  const isSynced = useRef(false);
  const [status, setStatus] = useState("connecting");

  useEffect(() => {
    if (!noteId) return;

    setYdoc(null);
    setStatus("connecting");

    const doc = new Y.Doc();
    const idb = new IndexeddbPersistence(noteId, doc);
    const hp = new HocuspocusProvider({
      url: import.meta.env.VITE_WS_URL || "ws://localhost:4015",
      name: noteId,
      document: doc,
      token: token || "", // Guest access support
      onConnect: () => setStatus("connected"),
      onDisconnect: () => setStatus("offline"),
      onAuthenticationFailed: () => setStatus("denied"),
      onSynced: () => {
        // Delay slightly to prevent initial load movement
        setTimeout(() => {
          isSynced.current = true;
        }, 800);
      },
    });

    const timer = setTimeout(() => setYdoc(doc), 50);

    return () => {
      clearTimeout(timer);
      hp.destroy();
      idb.destroy();
      doc.destroy();
    };
  }, [noteId, token]);

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
      {/* Status badge */}
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
