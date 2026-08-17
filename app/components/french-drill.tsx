import { useEffect, useRef, useState } from "react";

import { sentences } from "./french-sentences";
import styles from "./french-drill.module.css";

// Lowercase, straighten apostrophes, drop all sentence punctuation (so an
// internal comma need not be typed), and collapse whitespace so that
// "Demain, j'irai au marché." matches "demain j'irai au marché". Accents and
// apostrophes are kept significant — this is a French drill, after all.
function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[.?!,;:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function shuffle<T>(array: T[]): T[] {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

type Feedback =
  | { kind: "correct" }
  | { kind: "none" }
  | { kind: "revealed"; answer: string }
  | { kind: "wrong" };

export default function FrenchDrill() {
  // Start with the deck unshuffled so the pre-rendered HTML matches the first
  // client render, then shuffle once mounted.
  const [deck, setDeck] = useState(sentences);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState<Feedback>({ kind: "none" });
  const [finished, setFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const restartRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setDeck(shuffle(sentences));
  }, []);

  useEffect(() => {
    if (finished) {
      restartRef.current?.focus();
    } else {
      inputRef.current?.focus();
    }
  }, [deck, index, finished]);

  const locked = feedback.kind === "correct";
  const card = deck[index];

  function advance() {
    setValue("");
    setFeedback({ kind: "none" });

    if (index + 1 < deck.length) {
      setIndex(index + 1);
    } else {
      setFinished(true);
    }
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (locked) {
      return;
    }

    const guess = normalise(value);
    const correct =
      guess !== "" && card.fr.some((answer) => normalise(answer) === guess);

    if (correct) {
      setFeedback({ kind: "correct" });
      window.setTimeout(advance, 650);
    } else {
      setFeedback({ kind: "wrong" });
      inputRef.current?.select();
    }
  }

  function reveal() {
    setFeedback({ kind: "revealed", answer: card.fr[0] });
    inputRef.current?.focus();
  }

  function restart() {
    setDeck(shuffle(sentences));
    setIndex(0);
    setValue("");
    setFeedback({ kind: "none" });
    setFinished(false);
  }

  const feedbackText = {
    correct: "Correct!",
    none: "",
    revealed: feedback.kind === "revealed" ? feedback.answer : "",
    wrong: "Not quite — try again.",
  }[feedback.kind];

  return (
    <div className={styles.app}>
      <p className={styles.progress} aria-live="polite">
        {finished ? `${deck.length} / ${deck.length}` : `${index + 1} / ${deck.length}`}
      </p>
      <p className={styles.prompt} lang="en">
        {finished ? "Bravo — you have finished the deck." : card.en}
      </p>
      <form onSubmit={onSubmit} hidden={finished}>
        <input
          type="text"
          name="answer"
          lang="fr"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Type the French translation"
          aria-label="French translation"
          ref={inputRef}
          value={value}
          disabled={locked}
          onChange={(event) => setValue(event.target.value)}
        />
        <div className={styles.buttons}>
          <input type="submit" value="Check" />
          <input type="button" value="Show answer" onClick={reveal} />
        </div>
      </form>
      <p
        className={
          feedback.kind === "none"
            ? styles.feedback
            : `${styles.feedback} ${styles[feedback.kind]}`
        }
        aria-live="polite"
      >
        {feedbackText}
      </p>
      <button
        type="button"
        className={styles.restart}
        hidden={!finished}
        onClick={restart}
        ref={restartRef}
      >
        Start again
      </button>
    </div>
  );
}
