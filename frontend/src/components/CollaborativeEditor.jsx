import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { IndexeddbPersistence } from "y-indexeddb";
import { useEffect, useState } from "react";
import { useAppStore } from "../store/useAppStore";

const CollaborativeEditor = ({ noteId }) => {
  const { user, token } = useAppStore();
  const [provider, setProvider] = useState(null);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          history: false,
        }),
        TaskList,
        TaskItem.configure({
          nested: true,
        }),
        Collaboration.configure({
          document: provider?.document,
        }),
        CollaborationCursor.configure({
          provider: provider,
          user: {
            name: user?.name || "Anonymous",
            color: "#" + Math.floor(Math.random() * 16777215).toString(16),
          },
        }),
      ],
    },
    [provider],
  );

  useEffect(() => {
    if (!noteId || !token) return;

    const ydoc = new Y.Doc();

    // Offline persistence
    const indexeddbProvider = new IndexeddbPersistence(noteId, ydoc);

    // Real-time sync
    const hocuspocusProvider = new HocuspocusProvider({
      url: import.meta.env.VITE_WS_URL || "ws://localhost:4015",
      name: noteId,
      document: ydoc,
      token: token,
    });

    setProvider(hocuspocusProvider);

    return () => {
      hocuspocusProvider.destroy();
      indexeddbProvider.destroy();
      ydoc.destroy();
    };
  }, [noteId, token]);

  if (!editor) return null;

  return (
    <div className="editor-container p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 transition-all">
      <div className="mb-4 flex items-center gap-2 text-sm text-zinc-500">
        <div
          className={`w-2 h-2 rounded-full ${provider?.status === "connected" ? "bg-green-500" : "bg-red-500 animate-pulse"}`}
        ></div>
        {provider?.status === "connected" ? "Connected" : "Connecting..."}
      </div>
      <EditorContent
        editor={editor}
        className="prose dark:prose-invert max-w-none focus:outline-none min-h-[500px]"
      />
    </div>
  );
};

export default CollaborativeEditor;
