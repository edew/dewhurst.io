import { useEffect, useRef, useState } from "react";

import { execute } from "./pulsar-parser";
import styles from "./pulsar-clone.module.css";

function hsvToRgb(hue: number, sat: number, val: number) {
  const h = hue / 360;
  const s = sat / 100;
  const v = val / 100;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r = 0;
  let g = 0;
  let b = 0;

  switch (i % 6) {
    case 0:
      ((r = v), (g = t), (b = p));
      break;
    case 1:
      ((r = q), (g = v), (b = p));
      break;
    case 2:
      ((r = p), (g = v), (b = t));
      break;
    case 3:
      ((r = p), (g = q), (b = v));
      break;
    case 4:
      ((r = t), (g = p), (b = v));
      break;
    case 5:
      ((r = v), (g = p), (b = q));
      break;
  }

  return {
    r: r * 255,
    g: g * 255,
    b: b * 255,
  };
}

const EXAMPLES = ["cos(x - y * (t / 1000))", "cos(t / 50)"];

export default function PulsarClone() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const debugRef = useRef<HTMLPreElement>(null);
  const [expression, setExpression] = useState("1");
  const expressionRef = useRef(expression);
  expressionRef.current = expression;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const dpr = window.devicePixelRatio || 1;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    ctx.scale(dpr, dpr);

    const rectCount = 32;
    const rectWidth = width / rectCount;
    const rectHeight = height / rectCount;

    ctx.textBaseline = "middle";

    function f(x: number, y: number, t: number) {
      try {
        return execute(expressionRef.current, { x, y, t });
      } catch {
        return 1;
      }
    }

    function color(x: number) {
      // Multiplyig by 360 here would give color values that "loop" back around to red
      // Multiplyig by 300 instead limits the final color or purple
      const h = (x / width) * 360;
      return hsvToRgb(h, 100, 100);
    }

    function draw(t: number) {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < rectCount; i++) {
        for (let j = 0; j < rectCount; j++) {
          const x = Math.floor(i * rectWidth);
          const y = Math.floor(j * rectHeight);
          const value = f(i, j, t);
          const rgb = color(x);
          ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${value})`;
          ctx.fillRect(x, y, rectWidth + 0.5, rectHeight + 0.5);
        }
      }

      if (debugRef.current) {
        debugRef.current.textContent = `${t}`;
      }
    }

    let previousTimestamp = 0;
    const stepMs = 1000 / 60;

    function callback(timestamp: number) {
      if (timestamp - previousTimestamp > stepMs) {
        draw(timestamp);
        previousTimestamp = timestamp;
      }

      frame = requestAnimationFrame(callback);
    }

    let frame = requestAnimationFrame(callback);

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={styles.app}>
      <canvas width={400} height={400} ref={canvasRef} />
      <textarea
        name="expression"
        placeholder="cos(x - y * (t * 5.8))"
        value={expression}
        onChange={(event) => setExpression(event.target.value)}
      />
      {EXAMPLES.map((example) => (
        <input
          key={example}
          type="button"
          value={example}
          onClick={() => setExpression(example)}
        />
      ))}
      <pre ref={debugRef}></pre>
    </div>
  );
}
