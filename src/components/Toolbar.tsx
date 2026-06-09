import { useRef, useState } from "react";
import type { CardsConfig } from "cli-cards";
import { useCardStore } from "../stores/cardStore";
import { cardToPngBlob, downloadBlob } from "../utils/rasterize";

const btn =
  "rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-ink hover:border-accent hover:text-accent disabled:opacity-50";
const btnPrimary =
  "rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-light disabled:opacity-50";

export function Toolbar() {
  const { card, dimensions, palette, loadConfig } = useCardStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const downloadPng = async () => {
    setBusy(true);
    setError(null);
    try {
      const blob = await cardToPngBlob(card, dimensions, palette, 2);
      downloadBlob(blob, card.file || "card.png");
    } catch (err) {
      console.error(err);
      setError("Could not render the PNG. See the console for details.");
    } finally {
      setBusy(false);
    }
  };

  const exportJson = () => {
    const config: CardsConfig = { dimensions, palette, cards: [card] };
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json",
    });
    downloadBlob(blob, "cards.config.json");
  };

  const importJson = async (file: File) => {
    setError(null);
    try {
      const config = JSON.parse(await file.text()) as CardsConfig;
      const first = config.cards?.[0];
      if (!first || !Array.isArray(first.lines)) {
        throw new Error("No cards found in config");
      }
      loadConfig(first, config.dimensions, config.palette);
    } catch (err) {
      console.error(err);
      setError("That file is not a valid cards.config.json.");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <button className={btnPrimary} onClick={downloadPng} disabled={busy}>
          {busy ? "Rendering…" : "Download PNG"}
        </button>
        <button className={btn} onClick={exportJson}>
          Export config JSON
        </button>
        <button className={btn} onClick={() => fileRef.current?.click()}>
          Import config JSON
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) importJson(file);
            e.target.value = "";
          }}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
