import { useEffect, useRef } from "react";

// Twinkling stars over the hero — a fresh sky each visit. Generated on
// the client after mount so the random values never enter server-rendered
// markup (which would break hydration).
export function StarField() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let html = "";
    for (let i = 0; i < 110; i++) {
      const left = (Math.random() * 100).toFixed(2);
      const top = (Math.random() * 100).toFixed(2);
      const size = (0.8 + Math.random() * 2.4).toFixed(1);
      const dur = (2.5 + Math.random() * 4.5).toFixed(2);
      const delay = (-Math.random() * 7).toFixed(2);
      const peak = (0.5 + Math.random() * 0.5).toFixed(2);
      html +=
        `<i style="left:${left}%;top:${top}%;width:${size}px;height:${size}px;` +
        `--wink:${dur}s;--peak:${peak};animation-delay:${delay}s"></i>`;
    }
    ref.current!.innerHTML = html;
  }, []);

  return <div id="stars" aria-hidden="true" ref={ref} />;
}
