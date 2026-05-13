import { useState, useEffect } from "react";
import { useVaultStore, useUIStore } from "@/stores";
import { updateFrontmatterFields, deleteFrontmatterField } from "@/lib/parser/frontmatter";
import type { VaultFile } from "@/types";

const TYPE_OPTIONS = ["note", "task", "project", "meeting", "contact"];
const STATUS_OPTIONS = ["todo", "in-progress", "done", "blocked", "archived"];
const PRIORITY_OPTIONS = ["p1", "p2", "p3"];
const SPECIAL_FIELDS = new Set(["type", "status", "priority", "due", "date", "tags"]);

function valueToString(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (Array.isArray(v)) return v.join(", ");
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}

function FieldText({
  label,
  value,
  inputType = "text",
  onSave,
  onDelete,
}: {
  label: string;
  value: string;
  inputType?: string;
  onSave: (v: string) => void;
  onDelete?: () => void;
}) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <div className="flex items-center gap-1 py-0.5 group">
      <span className="text-xs text-neutral-600 w-16 shrink-0 truncate" title={label}>
        {label}
      </span>
      <input
        type={inputType}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (draft !== value) onSave(draft);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave(draft);
        }}
        className="flex-1 min-w-0 bg-transparent border border-transparent hover:border-neutral-800 focus:border-neutral-700 rounded px-1.5 py-0.5 text-xs text-neutral-300 outline-none transition-colors"
      />
      {onDelete && (
        <button
          onClick={onDelete}
          className="text-neutral-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all text-xs w-4 shrink-0"
          title="Delete field"
        >
          ×
        </button>
      )}
    </div>
  );
}

function FieldSelect({
  label,
  value,
  options,
  onSave,
}: {
  label: string;
  value: string;
  options: string[];
  onSave: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 py-0.5">
      <span className="text-xs text-neutral-600 w-16 shrink-0 truncate" title={label}>
        {label}
      </span>
      <select
        value={value ?? ""}
        onChange={(e) => onSave(e.target.value)}
        className="flex-1 min-w-0 bg-neutral-900 border border-neutral-800 rounded px-1.5 py-0.5 text-xs text-neutral-300 outline-none focus:border-neutral-700 transition-colors"
      >
        <option value="">—</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

interface Props {
  file: VaultFile;
}

export default function FrontmatterPanel({ file }: Props) {
  const updateFile = useVaultStore((s) => s.updateFile);
  const toggleFrontmatter = useUIStore((s) => s.toggleFrontmatter);
  const [addingField, setAddingField] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const fm = file.frontmatter;

  const saveField = (key: string, value: unknown) => {
    const newContent = updateFrontmatterFields(file.content, { [key]: value });
    updateFile(file.id, newContent);
  };

  const deleteField = (key: string) => {
    const newContent = deleteFrontmatterField(file.content, key);
    updateFile(file.id, newContent);
  };

  const addField = () => {
    const key = newKey.trim();
    if (!key) return;
    saveField(key, newValue.trim() || null);
    setNewKey("");
    setNewValue("");
    setAddingField(false);
  };

  const customFields = Object.entries(fm).filter(([k]) => !SPECIAL_FIELDS.has(k));

  return (
    <div className="w-56 border-l border-neutral-800 flex flex-col bg-neutral-950 shrink-0 overflow-hidden">
      <div className="flex items-center px-3 h-9 border-b border-neutral-800 shrink-0">
        <span className="text-xs text-neutral-500 font-medium flex-1">Properties</span>
        <button
          onClick={toggleFrontmatter}
          className="text-neutral-700 hover:text-neutral-500 transition-colors text-xs"
          title="Close panel"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        <FieldSelect
          label="type"
          value={valueToString(fm.type)}
          options={TYPE_OPTIONS}
          onSave={(v) => (v ? saveField("type", v) : deleteField("type"))}
        />
        <FieldSelect
          label="status"
          value={valueToString(fm.status)}
          options={STATUS_OPTIONS}
          onSave={(v) => (v ? saveField("status", v) : deleteField("status"))}
        />
        <FieldSelect
          label="priority"
          value={valueToString(fm.priority)}
          options={PRIORITY_OPTIONS}
          onSave={(v) => (v ? saveField("priority", v) : deleteField("priority"))}
        />
        <FieldText
          label="due"
          value={valueToString(fm.due)}
          inputType="date"
          onSave={(v) => (v ? saveField("due", v) : deleteField("due"))}
        />
        <FieldText
          label="tags"
          value={valueToString(fm.tags)}
          onSave={(v) => {
            const tags = v
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean);
            tags.length ? saveField("tags", tags) : deleteField("tags");
          }}
        />

        {customFields.length > 0 && (
          <div className="mt-2 pt-2 border-t border-neutral-800/60">
            {customFields.map(([key, val]) => (
              <FieldText
                key={key}
                label={key}
                value={valueToString(val)}
                onSave={(v) => saveField(key, v)}
                onDelete={() => deleteField(key)}
              />
            ))}
          </div>
        )}

        <div className="mt-3 pt-2 border-t border-neutral-800/60">
          {addingField ? (
            <div className="flex flex-col gap-1">
              <input
                autoFocus
                placeholder="field name"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && setAddingField(false)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-300 outline-none"
              />
              <input
                placeholder="value"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addField()}
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-xs text-neutral-300 outline-none"
              />
              <div className="flex gap-1">
                <button
                  onClick={addField}
                  className="flex-1 text-xs px-2 py-1 rounded bg-violet-700 hover:bg-violet-600 text-white transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setAddingField(false);
                    setNewKey("");
                    setNewValue("");
                  }}
                  className="text-xs px-2 py-1 rounded text-neutral-600 hover:text-neutral-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingField(true)}
              className="text-xs text-neutral-700 hover:text-neutral-500 transition-colors w-full text-left"
            >
              + Add field
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
