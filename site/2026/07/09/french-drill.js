import { LitElement, html, live } from "/lit.js";

import { sentences } from "./french-sentences.js";

// Lowercase, drop accents, straighten apostrophes, drop all sentence
// punctuation (so an internal comma need not be typed), and collapse
// whitespace so that "Demain, j'irai au marché." matches "demain j'irai au
// marche". Accents need not be typed, but every letter under them must be
// right, and apostrophes are kept significant.
function normalise(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘`]/g, "'")
    .replace(/[.?!,;:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function shuffle(array) {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const FEEDBACK = {
  correct: "Correct!",
  none: "",
  wrong: "Not quite - try again.",
};

// <french-drill></french-drill>, styled by french-drill.css
class FrenchDrill extends LitElement {
  static properties = {
    deck: { state: true },
    // { kind: "correct" | "none" | "wrong" } or { kind: "revealed", answer }
    feedback: { state: true },
    finished: { state: true },
    index: { state: true },
    value: { state: true },
  };

  constructor() {
    super();
    // The deck starts in the order it is written, and is shuffled by "Start
    // again".
    this.deck = sentences;
    this.feedback = { kind: "none" };
    this.finished = false;
    this.index = 0;
    this.value = "";
  }

  // Rendered into the page itself rather than a shadow root, so that the
  // site's styles for inputs and buttons apply.
  createRenderRoot() {
    return this;
  }

  get input() {
    return this.querySelector("input[name=answer]");
  }

  updated(changed) {
    // Not on the first render, when each of these changes from nothing: the
    // page should not open with the drill holding the keyboard.
    if (["deck", "index", "finished"].some((name) => changed.get(name) !== undefined)) {
      (this.finished ? this.querySelector(".restart") : this.input)?.focus();
    }
  }

  advance() {
    this.value = "";
    this.feedback = { kind: "none" };

    if (this.index + 1 < this.deck.length) {
      this.index += 1;
    } else {
      this.finished = true;
    }
  }

  onSubmit(event) {
    event.preventDefault();

    if (this.feedback.kind === "correct") {
      return;
    }

    const guess = normalise(this.value);
    const card = this.deck[this.index];
    const correct =
      guess !== "" && card.fr.some((answer) => normalise(answer) === guess);

    if (correct) {
      this.feedback = { kind: "correct" };
      window.setTimeout(() => this.advance(), 650);
    } else {
      this.feedback = { kind: "wrong" };
      this.input?.select();
    }
  }

  reveal() {
    this.feedback = { kind: "revealed", answer: this.deck[this.index].fr[0] };
    this.input?.focus();
  }

  restart() {
    this.deck = shuffle(sentences);
    this.index = 0;
    this.value = "";
    this.feedback = { kind: "none" };
    this.finished = false;
  }

  render() {
    const { deck, feedback, finished, index } = this;
    const card = deck[index];
    const feedbackText =
      feedback.kind === "revealed" ? feedback.answer : FEEDBACK[feedback.kind];

    return html`
      <p class="progress" aria-live="polite">
        ${finished ? deck.length : index + 1} / ${deck.length}
      </p>
      <p class="prompt" lang="en">
        ${finished ? "Bravo - you have finished the deck." : card.en}
      </p>
      <form @submit=${this.onSubmit} ?hidden=${finished}>
        <input
          type="text"
          name="answer"
          lang="fr"
          autocomplete="off"
          autocapitalize="off"
          autocorrect="off"
          spellcheck="false"
          placeholder="Type the French translation"
          aria-label="French translation"
          .value=${live(this.value)}
          ?disabled=${feedback.kind === "correct"}
          @input=${(event) => (this.value = event.target.value)}
        />
        <div class="buttons">
          <input type="submit" value="Check" />
          <input type="button" value="Show answer" @click=${this.reveal} />
        </div>
      </form>
      <p
        class="feedback ${feedback.kind === "none" ? "" : feedback.kind}"
        aria-live="polite"
      >
        ${feedbackText}
      </p>
      <button
        type="button"
        class="restart"
        ?hidden=${!finished}
        @click=${this.restart}
      >
        Start again
      </button>
    `;
  }
}

customElements.define("french-drill", FrenchDrill);
