import { useState, useEffect, useRef, useCallback } from "react";
import { useVaultStore, useUIStore } from "@/stores";
import type { VaultFile } from "@/types";
import { toast } from "react-toastify";

interface Props {
  file: VaultFile;
}

export default function EditorView({ file }: Props) {
  const [draft, setDraft] = useState(file.content);
  const [saved, setSaved] = useState(false);
  const draftRef = useRef(draft);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updateFile = useVaultStore((s) => s.updateFile);
  const setEditing = useUIStore((s) => s.setEditing);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const save = useCallback(() => {
    updateFile(file.id, draftRef.current);
    setSaved(true);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setSaved(false), 1500);

    toast("Saved", { type: "success" });
  }, [file.id, updateFile]);

  useEffect(
    () => () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [save]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 h-9 border-b border-neutral-800 shrink-0 bg-neutral-950">
        <span className="text-xs text-neutral-600 font-mono flex-1 truncate">{file.path}</span>
        <button
          onClick={save}
          className={`text-xs px-3 py-1 rounded text-white transition-colors ${
            saved ? "bg-emerald-600 hover:bg-emerald-600" : "bg-violet-700 hover:bg-violet-600"
          }`}
        >
          {saved ? "Saved ✓" : "Save"}
        </button>
        <kbd className="text-xs text-neutral-700 font-mono">⌘S</kbd>
        <button
          onClick={() => setEditing(false)}
          title="Close editor"
          className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
        >
          ✕
        </button>
      </div>
      <textarea
        className="flex-1 bg-neutral-950 text-neutral-200 font-mono text-sm p-6 resize-none outline-none leading-relaxed"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        spellCheck={false}
        autoFocus
      />
    </div>
  );
}
