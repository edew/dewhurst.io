import { useEffect, useRef, useState } from "react";

import { execute } from "./pulsar-parser";
import styles from "./pulsar-clone.module.css";

const SIZE = 32;

// Each cell's value, from 0 to 1, is drawn as a character with more ink the
// higher it is. A cell is two characters wide, so that at the grid's line
// height it comes out roughly square.
const RAMP = " .:-=+*#%@";

function cell(value: number) {
  const v = Number.isFinite(value) ? Math.min(Math.max(value, 0), 1) : 0;
  const glyph = RAMP[Math.round(v * (RAMP.length - 1))];

  return glyph + glyph;
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
  const screenRef = useRef<HTMLPreElement>(null);
  const [expression, setExpression] = useState(
    EXAMPLES[0].patterns[0].expression,
  );
  const expressionRef = useRef(expression);
  expressionRef.current = expression;

  const isExample = EXAMPLES.some(({ patterns }) =>
    patterns.some((pattern) => pattern.expression === expression),
  );

  useEffect(() => {
    const screen = screenRef.current!;

    function f(x: number, y: number, t: number) {
      try {
        return execute(expressionRef.current, { x, y, t });
      } catch {
        return 1;
      }
    }

    function draw(t: number) {
      const lines = [];

      for (let y = 0; y < SIZE; y++) {
        let line = "";

        for (let x = 0; x < SIZE; x++) {
          line += cell(f(x, y, t));
        }

        lines.push(line);
      }

      screen.textContent = lines.join("\n");
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
      <pre className={styles.screen} ref={screenRef} aria-hidden="true" />
      <textarea
        name="expression"
        aria-label="Expression"
        placeholder="cos(x - y * (t * 5.8))"
        value={expression}
        onChange={(event) => setExpression(event.target.value)}
      />
      <select
        name="example"
        aria-label="Pattern"
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
