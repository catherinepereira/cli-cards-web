import { useEffect, useRef, useState } from "react";
import { cardHtml } from "cli-cards";
import { useCardStore } from "../stores/cardStore";

export function CardPreview() {
  const { card, dimensions, palette } = useCardStore();
  const wrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0.5);

  // Write the card HTML straight into the iframe document instead of swapping
  // srcDoc, so edits update in place without the white reload flash
  useEffect(() => {
    const frame = frameRef.current;
    const doc = frame?.contentDocument;
    if (!doc) return;
    const html = cardHtml(card, dimensions, palette);
    doc.open();
    doc.write(html);
    doc.close();
  }, [card, dimensions, palette]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const update = () => setScale(wrap.clientWidth / dimensions.w);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [dimensions.w]);

  return (
    <div
      ref={wrapRef}
      className="border-border relative w-full overflow-hidden rounded-lg border"
      style={{ aspectRatio: dimensions.w / dimensions.h }}
    >
      <iframe
        ref={frameRef}
        title="card preview"
        width={dimensions.w}
        height={dimensions.h}
        scrolling="no"
        className="absolute top-0 left-0 origin-top-left border-0"
        style={{ transform: `scale(${scale})` }}
      />
    </div>
  );
}
