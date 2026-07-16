import { sentences } from "./sentences.js";

const app = document.querySelector("#app");
const promptEl = app.querySelector(".prompt");
const progressEl = app.querySelector(".progress");
const feedbackEl = app.querySelector(".feedback");
const form = app.querySelector("form");
const input = form.elements.answer;
const revealBtn = form.elements.reveal;
const restartBtn = app.querySelector(".restart");

// Lowercase, straighten apostrophes, drop all sentence punctuation (so an
// internal comma need not be typed), and collapse whitespace so that
// "Demain, j'irai au marché." matches "demain j'irai au marché". Accents and
// apostrophes are kept significant — this is a French drill, after all.
function normalise(text) {
  return text
    .toLowerCase()
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

let deck = shuffle(sentences);
let index = 0;
let locked = false;

function render() {
  const card = deck[index];
  promptEl.textContent = card.en;
  progressEl.textContent = `${index + 1} / ${deck.length}`;
  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";
  input.value = "";
  input.disabled = false;
  locked = false;
  input.focus();
}

function isCorrect(value) {
  const guess = normalise(value);
  if (!guess) return false;
  return deck[index].fr.some((answer) => normalise(answer) === guess);
}

function advance() {
  if (index + 1 < deck.length) {
    index += 1;
    render();
  } else {
    finish();
  }
}

function finish() {
  promptEl.textContent = "Bravo — you have finished the deck.";
  progressEl.textContent = `${deck.length} / ${deck.length}`;
  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";
  form.hidden = true;
  restartBtn.hidden = false;
  restartBtn.focus();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (locked) return;

  if (isCorrect(input.value)) {
    feedbackEl.textContent = "Correct!";
    feedbackEl.className = "feedback correct";
    locked = true;
    input.disabled = true;
    setTimeout(advance, 650);
  } else {
    feedbackEl.textContent = "Not quite — try again.";
    feedbackEl.className = "feedback wrong";
    input.select();
  }
});

revealBtn.addEventListener("click", () => {
  feedbackEl.textContent = deck[index].fr[0];
  feedbackEl.className = "feedback revealed";
  input.focus();
});

restartBtn.addEventListener("click", () => {
  deck = shuffle(sentences);
  index = 0;
  form.hidden = false;
  restartBtn.hidden = true;
  render();
});

render();
