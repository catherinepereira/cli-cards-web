import { create } from "zustand";
import {
  DEFAULT_DIMENSIONS,
  DEFAULT_PALETTE,
  type Card,
  type CardLine,
  type Dimensions,
  type LineType,
  type Palette,
} from "cli-cards";

const STARTER: Card = {
  file: "mytool-cli-card.png",
  title: "mytool",
  bg: "#d7ecd5",
  accent: "#4f8a52",
  lines: [
    { t: "cmd", s: "pip install mytool" },
    { t: "cmd", s: "mytool run --input data/" },
    { t: "out", s: "processing 240 items" },
    { t: "ok", s: "✓ done, results in out/" },
  ],
};

// Derive the output filename from the title so users never type it
export function fileNameFor(title: string): string {
  const slug = title.trim().toLowerCase().replace(/\s+/g, "-") || "card";
  return `${slug}-cli-card.png`;
}

interface CardState {
  card: Card;
  dimensions: Dimensions;
  palette: Palette;
  setTitle: (title: string) => void;
  setField: <K extends keyof Card>(key: K, value: Card[K]) => void;
  setLine: (index: number, line: CardLine) => void;
  addLine: (t: LineType) => void;
  removeLine: (index: number) => void;
  reorderLine: (from: number, to: number) => void;
  loadConfig: (card: Card, dimensions?: Dimensions, palette?: Palette) => void;
  reset: () => void;
}

export const useCardStore = create<CardState>((set) => ({
  card: STARTER,
  dimensions: DEFAULT_DIMENSIONS,
  palette: DEFAULT_PALETTE,

  setTitle: (title) =>
    set((state) => ({
      card: { ...state.card, title, file: fileNameFor(title) },
    })),

  setField: (key, value) =>
    set((state) => ({ card: { ...state.card, [key]: value } })),

  setLine: (index, line) =>
    set((state) => {
      const lines = state.card.lines.slice();
      lines[index] = line;
      return { card: { ...state.card, lines } };
    }),

  addLine: (t) =>
    set((state) => ({
      card: { ...state.card, lines: [...state.card.lines, { t, s: "" }] },
    })),

  removeLine: (index) =>
    set((state) => ({
      card: {
        ...state.card,
        lines: state.card.lines.filter((_, i) => i !== index),
      },
    })),

  reorderLine: (from, to) =>
    set((state) => {
      if (from === to) return state;
      const lines = state.card.lines.slice();
      const [moved] = lines.splice(from, 1);
      lines.splice(to, 0, moved);
      return { card: { ...state.card, lines } };
    }),

  loadConfig: (card, dimensions, palette) =>
    set({
      card,
      dimensions: dimensions ?? DEFAULT_DIMENSIONS,
      palette: palette ?? DEFAULT_PALETTE,
    }),

  reset: () =>
    set({
      card: STARTER,
      dimensions: DEFAULT_DIMENSIONS,
      palette: DEFAULT_PALETTE,
    }),
}));
