"use client";

import { useRef, useState, type ComponentType } from "react";
import { Bold, Heading2, Italic, Link2, List, ListOrdered, Quote } from "lucide-react";
import Markdown from "@/app/components/ui/Markdown";

interface MarkdownEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  rows?: number;
}

type Action = { label: string; icon: ComponentType<{ className?: string }>; apply: (selected: string) => string; line?: boolean };

// Wraps the selection (inline) or prefixes each selected line (block).
const ACTIONS: Action[] = [
  { label: "Negrita", icon: Bold, apply: (s) => `**${s || "texto"}**` },
  { label: "Cursiva", icon: Italic, apply: (s) => `_${s || "texto"}_` },
  { label: "Subtítulo", icon: Heading2, apply: (s) => `## ${s || "Subtítulo"}`, line: true },
  { label: "Lista", icon: List, apply: (s) => (s || "elemento").split("\n").map((l) => `- ${l}`).join("\n"), line: true },
  {
    label: "Lista numerada",
    icon: ListOrdered,
    apply: (s) => (s || "elemento").split("\n").map((l, i) => `${i + 1}. ${l}`).join("\n"),
    line: true,
  },
  { label: "Cita", icon: Quote, apply: (s) => (s || "cita").split("\n").map((l) => `> ${l}`).join("\n"), line: true },
  { label: "Enlace", icon: Link2, apply: (s) => `[${s || "texto"}](https://)` },
];

export default function MarkdownEditor({ label, value, onChange, error, rows = 12 }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<"write" | "preview">("write");

  const run = (action: Action) => {
    const el = textareaRef.current;
    if (!el) return;

    let start = el.selectionStart;
    const end = el.selectionEnd;

    // Block formats act on whole lines, so start at the line's beginning.
    if (action.line) {
      start = value.lastIndexOf("\n", start - 1) + 1;
    }

    const replacement = action.apply(value.slice(start, end));
    const needsBreak = action.line && start > 0 && value[start - 1] !== "\n";
    const insert = (needsBreak ? "\n" : "") + replacement;
    const next = value.slice(0, start) + insert + value.slice(end);

    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + insert.length, start + insert.length);
    });
  };

  const tabClass = (active: boolean) =>
    `rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
      active ? "bg-ink text-white" : "text-ink/50 hover:text-ink"
    }`;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-wider text-ink/50 uppercase">{label}</span>
        <div className="flex gap-1">
          <button type="button" className={tabClass(mode === "write")} onClick={() => setMode("write")}>
            Escribir
          </button>
          <button type="button" className={tabClass(mode === "preview")} onClick={() => setMode("preview")}>
            Vista previa
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-black/10 focus-within:border-brand">
        {mode === "write" ? (
          <>
            <div className="flex flex-wrap gap-0.5 border-b border-black/5 bg-surface/60 px-1.5 py-1">
              {ACTIONS.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  title={action.label}
                  aria-label={action.label}
                  onClick={() => run(action)}
                  className="flex h-7 w-7 items-center justify-center rounded text-ink/60 hover:bg-black/5 hover:text-ink"
                >
                  <action.icon className="h-4 w-4" />
                </button>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              rows={rows}
              className="block w-full resize-y bg-white px-4 py-3 font-mono text-[13px] leading-relaxed text-ink outline-none"
            />
          </>
        ) : (
          <div className="max-h-[32rem] min-h-40 overflow-y-auto bg-white px-4 py-3 text-sm leading-relaxed text-ink/80">
            {value.trim() ? <Markdown>{value}</Markdown> : <p className="text-ink/40">Nada que mostrar todavía.</p>}
          </div>
        )}
      </div>
      <p className="mt-1 text-[11px] text-ink/40">
        Admite Markdown: **negrita**, _cursiva_, ## subtítulos, listas y [enlaces](https://...).
      </p>
      {error && <p className="mt-1 text-xs text-brand">{error}</p>}
    </div>
  );
}
