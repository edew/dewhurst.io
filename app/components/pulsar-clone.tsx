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

const EXAMPLES = [
  {
    group: "Ripples",
    patterns: [
      {
        name: "Stone in water",
        expression:
          "cos(((x - 3) * (x - 3) + (y - 3) * (y - 3)) / 40 - t / 300)",
      },
      {
        name: "Two stones",
        expression:
          "cos(((x - 10) * (x - 10) + (y - 16) * (y - 16)) / 40 - t / 300) + cos(((x - 22) * (x - 22) + (y - 16) * (y - 16)) / 40 - t / 300)",
      },
      {
        name: "Breathing rings",
        expression:
          "cos(((x - 16) * (x - 16) + (y - 16) * (y - 16)) / (8 + 6 * cos(t / 1000)))",
      },
    ],
  },
  {
    group: "Grids",
    patterns: [
      {
        name: "Checkerboard",
        expression: "cos(x * pi) * cos(y * pi) * cos(t / 500)",
      },
      { name: "Fan", expression: "cos((x - 16) * (y - 16) / 8 - t / 400)" },
      {
        name: "Saddle",
        expression:
          "cos((x - 16) * (x - 16) / 30 + (y - 16) * (y - 16) / 30 + (x - 16) * (y - 16) * cos(t / 900) / 10)",
      },
    ],
  },
  {
    group: "Motion",
    patterns: [
      {
        name: "Wandering blob",
        expression:
          "cos(x / 4 - cos(t / 700) * 8) * cos(y / 4 - sin(t / 900) * 8)",
      },
      { name: "Flag", expression: "sin(x / 3 + sin(y / 3 + t / 600) * 2)" },
      {
        name: "Static",
        expression: "sin(sin(x * 12.9) * 300 + sin(y * 7.3) * 700 + t / 200)",
      },
    ],
  },
];

export default function PulsarClone() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [expression, setExpression] = useState(
    EXAMPLES[0].patterns[0].expression,
  );
  const expressionRef = useRef(expression);
  expressionRef.current = expression;

  const isExample = EXAMPLES.some(({ patterns }) =>
    patterns.some((pattern) => pattern.expression === expression),
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.focus();
      const end = textarea.value.length;
      textarea.setSelectionRange(end, end);
    }
  }, []);

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
          const x0 = Math.round(i * rectWidth);
          const x1 = Math.round((i + 1) * rectWidth);
          const y0 = Math.round(j * rectHeight);
          const y1 = Math.round((j + 1) * rectHeight);

          const value = f(i, j, t);
          const rgb = color(x0);
          ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${value})`;
          ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
        }
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
        ref={textareaRef}
      />
      <select
        name="example"
        value={isExample ? expression : ""}
        onChange={(event) => setExpression(event.target.value)}
      >
        <option value="">Select a pattern...</option>
        {EXAMPLES.map(({ group, patterns }) => (
          <optgroup key={group} label={group}>
            {patterns.map(({ name, expression }) => (
              <option key={name} value={expression}>
                {name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
