import { LitElement, html, live } from "/lit.js";

import { execute } from "./pulsar-parser.js";

const SIZE = 32;

function hsvToRgb(hue, sat, val) {
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

const STEP_MS = 1000 / 60;

// <pulsar-clone></pulsar-clone>, styled by pulsar-clone.css
class PulsarClone extends LitElement {
  static properties = { expression: { state: true } };

  constructor() {
    super();
    this.expression = EXAMPLES[0].patterns[0].expression;
  }

  // Rendered into the page itself rather than a shadow root, so that the
  // site's styles for inputs apply.
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();

    let previousTimestamp = 0;

    const callback = (timestamp) => {
      // A millisecond of slack, so that a 60Hz display's frames, which come
      // almost exactly a step apart, are not skipped
      if (timestamp - previousTimestamp > STEP_MS - 1) {
        this.draw(timestamp);
        previousTimestamp = timestamp;
      }

      this.frame = requestAnimationFrame(callback);
    };

    this.frame = requestAnimationFrame(callback);
    // Moved elsewhere in the page, it is connected again without being
    // rendered again
    this.observer?.observe(this.querySelector("canvas"));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    cancelAnimationFrame(this.frame);
    this.observer?.disconnect();
  }

  firstUpdated() {
    const canvas = this.querySelector("canvas");

    // CSS sets the canvas's size on the page; its pixel buffer follows it so
    // the grid stays sharp at any width and pixel density.
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;

      this.width = canvas.clientWidth;
      this.height = canvas.clientHeight;
      canvas.width = this.width * dpr;
      canvas.height = this.height * dpr;
      this.context = canvas.getContext("2d");
      this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    this.observer = new ResizeObserver(resize);
    this.observer.observe(canvas);
  }

  f(x, y, t) {
    try {
      const value = execute(this.expression, { x, y, t });

      // Not a number is no colour at all
      return Number.isFinite(value) ? value : 0;
    } catch {
      return 1;
    }
  }

  // A 32 by 32 grid of squares, coloured by a rainbow running across its
  // columns, each as opaque as the expression's value there.
  draw(t) {
    const { context, height, width } = this;

    if (!context) {
      return;
    }

    const rectWidth = width / SIZE;
    const rectHeight = height / SIZE;

    context.clearRect(0, 0, width, height);

    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        const x0 = Math.round(i * rectWidth);
        const x1 = Math.round((i + 1) * rectWidth);
        const y0 = Math.round(j * rectHeight);
        const y1 = Math.round((j + 1) * rectHeight);
        const rgb = hsvToRgb((x0 / width) * 360, 100, 100);

        context.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${this.f(i, j, t)})`;
        context.fillRect(x0, y0, x1 - x0, y1 - y0);
      }
    }
  }

  onInput(event) {
    this.expression = event.target.value;
  }

  render() {
    const { expression } = this;
    const isExample = EXAMPLES.some(({ patterns }) =>
      patterns.some((pattern) => pattern.expression === expression),
    );

    return html`
      <canvas aria-hidden="true"></canvas>
      <textarea
        name="expression"
        aria-label="Expression"
        placeholder="cos(x - y * (t * 5.8))"
        .value=${live(expression)}
        @input=${this.onInput}
      ></textarea>
      <select name="example" aria-label="Pattern" @change=${this.onInput}>
        <option value="" .selected=${!isExample}>Select a pattern...</option>
        ${EXAMPLES.map(
          ({ group, patterns }) => html`
            <optgroup label=${group}>
              ${patterns.map(
                (pattern) => html`
                  <option
                    value=${pattern.expression}
                    .selected=${pattern.expression === expression}
                  >
                    ${pattern.name}
                  </option>
                `,
              )}
            </optgroup>
          `,
        )}
      </select>
    `;
  }
}

customElements.define("pulsar-clone", PulsarClone);
