import { useState } from "react";
import type { LineType } from "cli-cards";
import { useCardStore } from "../stores/cardStore";

const LINE_TYPES: { value: LineType; label: string }[] = [
  { value: "cmd", label: "$ command" },
  { value: "out", label: "output" },
  { value: "ok", label: "✓ success" },
];

const inputClass =
  "w-full rounded-sm border border-border bg-card px-3 py-2 text-sm text-ink outline-none focus:border-accent";
const labelClass = "mb-1 block text-xs font-medium text-ink-soft";

export function CardEditor() {
  const { card, setTitle, setField, setLine, addLine, removeLine, reorderLine } =
    useCardStore();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const onDrop = (to: number) => {
    if (dragIndex !== null) reorderLine(dragIndex, to);
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className={labelClass}>Title</label>
        <input
          className={inputClass}
          value={card.title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ColorField
          label="Background"
          value={card.bg}
          onChange={(v) => setField("bg", v)}
        />
        <ColorField
          label="Accent"
          value={card.accent}
          onChange={(v) => setField("accent", v)}
        />
      </div>

      <div>
        <span className="text-ink-soft mb-2 block text-xs font-medium">
          Lines
        </span>

        <div className="flex flex-col gap-2">
          {card.lines.map((line, i) => (
            <div
              key={i}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => {
                e.preventDefault();
                setOverIndex(i);
              }}
              onDrop={() => onDrop(i)}
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
              className={`flex items-center gap-2 rounded-sm ${
                overIndex === i && dragIndex !== i
                  ? "ring-accent ring-2"
                  : ""
              } ${dragIndex === i ? "opacity-50" : ""}`}
            >
              <span
                aria-hidden
                title="Drag to reorder"
                className="text-text-dim cursor-grab select-none px-1 active:cursor-grabbing"
              >
                ⠿
              </span>
              <select
                value={line.t}
                onChange={(e) =>
                  setLine(i, { ...line, t: e.target.value as LineType })
                }
                className="border-border bg-card text-ink-soft focus:border-accent rounded-sm border px-2 py-2 text-xs outline-none"
              >
                {LINE_TYPES.map((lt) => (
                  <option key={lt.value} value={lt.value}>
                    {lt.label}
                  </option>
                ))}
              </select>
              <input
                className={`${inputClass} font-mono`}
                value={line.s}
                onChange={(e) => setLine(i, { ...line, s: e.target.value })}
              />
              <button
                aria-label="Remove line"
                title="Remove line"
                onClick={() => removeLine(i)}
                className="text-text-dim shrink-0 px-2 hover:text-red-500"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            onClick={() => addLine("cmd")}
            className="border-border text-ink-soft hover:border-accent hover:text-accent mt-1 rounded-sm border border-dashed py-2 text-sm"
          >
            + add line
          </button>
        </div>
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex gap-2">
        <input
          type="color"
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border-border h-9 w-10 shrink-0 cursor-pointer overflow-hidden rounded-sm border p-0"
        />
        <div className="relative flex-1">
          <input
            className={`${inputClass} pr-9 font-mono`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <button
            type="button"
            onClick={copy}
            aria-label={copied ? "Copied" : "Copy hex"}
            title={copied ? "Copied" : "Copy hex"}
            className="text-text-dim hover:text-accent absolute top-1/2 right-2 -translate-y-1/2"
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
        </div>
      </div>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="9"
        y="9"
        width="11"
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M5 15V5a2 2 0 0 1 2-2h10"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
