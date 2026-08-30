// Data shapes, text helpers and the linguistic bits behind the Mille Verbes
// browser: the accent-insensitive index, the conjugated-form index that turns
// "fussent" into "être", and the English morphology that glosses each tense.

import top10 from "./mille-verbes-top10.json";

export interface Cell {
  c?: string[];
  g?: string;
  n?: string;
  p?: string;
  pr?: string;
}

export type Tenses = Record<string, Cell[]>;

export interface Verb {
  aux?: string;
  freq: number;
  glosses?: string[];
  ipa?: string;
  lemma: string;
  moods?: Record<string, Tenses>;
  rank: number;
  verdict?: string;
}

// The top ten ship in the bundle, so the list renders with no fetch — on the
// server too. The other 990 come from /mille-verbes/verbs.json on demand.
export const TOP10 = (top10 as { verbs: unknown[] }).verbs as Verb[];

export const VERBS_URL = "/mille-verbes/verbs.json";

/* ---------------- text helpers ---------------- */

// "être" and "etre" both normalise to "etre". Stripping combining marks keeps
// the string length, so highlight offsets still line up with the original.
export function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const PRONOUN_RE =
  /^(?:que\s+|qu')?(?:j'|je\s+|tu\s+|il\s+|elle\s+|on\s+|nous\s+|vous\s+|ils\s+|elles\s+)/i;

export function bare(s: string): string {
  return s.replace(PRONOUN_RE, "");
}

// Formatted by hand rather than with toLocaleString, so that the server and
// the browser agree on the separators and hydration stays quiet.
function group(n: string): string {
  return n.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function fmtFreq(x: number): string {
  if (x >= 100) {
    return group(String(Math.round(x)));
  }

  const rounded = Math.round(x * 10) / 10;

  return Number.isInteger(rounded)
    ? String(rounded)
    : String(rounded).replace(".", ",");
}

/* ---------------- form index (for "fussent → être") ---------------- */

export interface FormHit {
  form: string;
  lemma: string;
}

const SIMPLE_TENSES: [string, string][] = [
  ["indicatif", "présent"],
  ["indicatif", "imparfait"],
  ["indicatif", "passé-simple"],
  ["indicatif", "futur-simple"],
  ["subjonctif", "présent"],
  ["subjonctif", "imparfait"],
  ["conditionnel", "présent"],
  ["imperatif", "imperatif-présent"],
];

export function buildFormIndex(verbs: Verb[]): Map<string, FormHit[]> {
  const idx = new Map<string, FormHit[]>();

  const add = (form: string, lemma: string) => {
    const key = norm(form);

    if (key.length < 2) {
      return;
    }

    let arr = idx.get(key);

    if (!arr) {
      idx.set(key, (arr = []));
    }

    if (!arr.some((e) => e.lemma === lemma)) {
      arr.push({ form, lemma });
    }
  };

  for (const v of verbs) {
    for (const [mood, tense] of SIMPLE_TENSES) {
      for (const cell of v.moods?.[mood]?.[tense] ?? []) {
        for (const c of cell.c ?? []) {
          add(bare(c), v.lemma);
        }
      }
    }

    for (const cells of Object.values(v.moods?.participe ?? {})) {
      for (const cell of cells) {
        for (const c of cell.c ?? []) {
          add(c, v.lemma);
        }
      }
    }
  }

  return idx;
}

/* ---------------- search ---------------- */

export interface VerbHit {
  score: number;
  v: Verb;
  where: "gloss" | "lemma";
}

export interface SearchResult {
  forms: FormHit[];
  verbs: VerbHit[];
}

export function runSearch(
  query: string,
  verbs: Verb[],
  formIndex: Map<string, FormHit[]>,
): SearchResult {
  const nq = norm(query.trim());
  const out: SearchResult = { forms: [], verbs: [] };

  if (!nq) {
    return out;
  }

  const scored: VerbHit[] = [];

  for (const v of verbs) {
    const nl = norm(v.lemma);
    let score: number | null = null;
    let where: "gloss" | "lemma" = "lemma";

    if (nl === nq) {
      score = 0;
    } else if (nl.startsWith(nq)) {
      score = 1;
    } else if (nq.length >= 3 && nl.includes(nq)) {
      score = 2;
    } else if (nq.length >= 2) {
      for (const g of v.glosses ?? []) {
        const ng = norm(g);
        const i = ng.indexOf(nq);

        // Word-initial matches only, so "eat" does not match "to defeat".
        if (i >= 0 && (i === 0 || !/[a-z]/.test(ng[i - 1]))) {
          score = 3;
          where = "gloss";
          break;
        }
      }
    }

    if (score !== null) {
      scored.push({ score, v, where });
    }
  }

  scored.sort((a, b) => a.score - b.score || a.v.rank - b.v.rank);
  out.verbs = scored.slice(0, 12);

  out.forms = (formIndex.get(nq) ?? [])
    .filter((h) => norm(h.lemma) !== nq)
    .slice(0, 6);

  return out;
}

/* ---------------- English morphology (for tense glosses) ---------------- */

const IRREGULAR: Record<string, [string, string]> = {
  be: ["was", "been"], have: ["had", "had"], do: ["did", "done"],
  say: ["said", "said"], go: ["went", "gone"], get: ["got", "got"],
  make: ["made", "made"], know: ["knew", "known"], think: ["thought", "thought"],
  take: ["took", "taken"], see: ["saw", "seen"], come: ["came", "come"],
  find: ["found", "found"], give: ["gave", "given"], tell: ["told", "told"],
  feel: ["felt", "felt"], become: ["became", "become"], leave: ["left", "left"],
  put: ["put", "put"], mean: ["meant", "meant"], keep: ["kept", "kept"],
  let: ["let", "let"], begin: ["began", "begun"], show: ["showed", "shown"],
  hear: ["heard", "heard"], run: ["ran", "run"], hold: ["held", "held"],
  bring: ["brought", "brought"], write: ["wrote", "written"], sit: ["sat", "sat"],
  stand: ["stood", "stood"], lose: ["lost", "lost"], pay: ["paid", "paid"],
  meet: ["met", "met"], set: ["set", "set"], lead: ["led", "led"],
  read: ["read", "read"], grow: ["grew", "grown"], fall: ["fell", "fallen"],
  send: ["sent", "sent"], build: ["built", "built"],
  understand: ["understood", "understood"], draw: ["drew", "drawn"],
  break: ["broke", "broken"], spend: ["spent", "spent"], cut: ["cut", "cut"],
  rise: ["rose", "risen"], drive: ["drove", "driven"], buy: ["bought", "bought"],
  wear: ["wore", "worn"], choose: ["chose", "chosen"], eat: ["ate", "eaten"],
  drink: ["drank", "drunk"], sleep: ["slept", "slept"], fly: ["flew", "flown"],
  forget: ["forgot", "forgotten"], forgive: ["forgave", "forgiven"],
  freeze: ["froze", "frozen"], hide: ["hid", "hidden"], hit: ["hit", "hit"],
  hurt: ["hurt", "hurt"], catch: ["caught", "caught"],
  teach: ["taught", "taught"], fight: ["fought", "fought"],
  seek: ["sought", "sought"], sell: ["sold", "sold"], shake: ["shook", "shaken"],
  shine: ["shone", "shone"], shoot: ["shot", "shot"], shut: ["shut", "shut"],
  sing: ["sang", "sung"], sink: ["sank", "sunk"], speak: ["spoke", "spoken"],
  steal: ["stole", "stolen"], stick: ["stuck", "stuck"], swear: ["swore", "sworn"],
  swim: ["swam", "swum"], throw: ["threw", "thrown"], wake: ["woke", "woken"],
  win: ["won", "won"], blow: ["blew", "blown"], bear: ["bore", "borne"],
  beat: ["beat", "beaten"], bend: ["bent", "bent"], bet: ["bet", "bet"],
  bite: ["bit", "bitten"], bleed: ["bled", "bled"], burn: ["burnt", "burnt"],
  burst: ["burst", "burst"], cost: ["cost", "cost"], deal: ["dealt", "dealt"],
  dig: ["dug", "dug"], feed: ["fed", "fed"], flee: ["fled", "fled"],
  hang: ["hung", "hung"], lay: ["laid", "laid"], lend: ["lent", "lent"],
  lie: ["lay", "lain"], light: ["lit", "lit"], ride: ["rode", "ridden"],
  ring: ["rang", "rung"], shed: ["shed", "shed"], slide: ["slid", "slid"],
  smell: ["smelt", "smelt"], spit: ["spat", "spat"], split: ["split", "split"],
  spread: ["spread", "spread"], spring: ["sprang", "sprung"],
  strike: ["struck", "struck"], sweep: ["swept", "swept"], tear: ["tore", "torn"],
  weep: ["wept", "wept"],
};

const VOWEL = /[aeiou]/;

function pastOf(w: string): string {
  if (IRREGULAR[w]) {
    return IRREGULAR[w][0];
  }
  if (w.endsWith("e")) {
    return w + "d";
  }
  if (w.endsWith("y") && !VOWEL.test(w[w.length - 2])) {
    return w.slice(0, -1) + "ied";
  }

  return w + "ed";
}

function partOf(w: string): string {
  return IRREGULAR[w] ? IRREGULAR[w][1] : pastOf(w);
}

function ingOf(w: string): string {
  if (w === "be") {
    return "being";
  }
  if (w.endsWith("ie")) {
    return w.slice(0, -2) + "ying";
  }
  if (w.endsWith("e") && !w.endsWith("ee")) {
    return w.slice(0, -1) + "ing";
  }

  return w + "ing";
}

export interface English {
  base: string;
  ing: string;
  part: string;
  past: string;
  rest: string;
}

// "to give up" → the parts needed to conjugate it. Null when the first gloss
// is not a plain "to X" verb.
export function engOf(v: Verb): English | null {
  const g = v.glosses?.[0] ?? "";

  if (!/^to\s+[a-z]/i.test(g)) {
    return null;
  }

  const words = g.slice(3).trim().split(/\s+/);
  const base = words[0].toLowerCase().replace(/[^a-z]/g, "");

  if (!base) {
    return null;
  }

  return {
    base,
    ing: ingOf(base),
    part: partOf(base),
    past: pastOf(base),
    rest: words.length > 1 ? " " + words.slice(1).join(" ") : "",
  };
}

export interface TenseGloss {
  literary: boolean;
  text: string;
}

export function tenseGloss(
  mood: string,
  tense: string,
  e: English | null,
): TenseGloss | null {
  if (!e) {
    return null;
  }

  const { base, ing, part, past, rest } = e;
  const plain = (text: string): TenseGloss => ({ literary: false, text });
  const lit = (text: string): TenseGloss => ({ literary: true, text });

  switch (mood + "/" + tense) {
    case "indicatif/présent":
      return plain(`I ${base}${rest}`);
    case "indicatif/imparfait":
      return plain(base === "be" ? "I was" : `I was ${ing}${rest}`);
    case "indicatif/passé-simple":
      return lit(`I ${past}${rest}`);
    case "indicatif/futur-simple":
      return plain(`I will ${base}${rest}`);
    case "indicatif/passé-composé":
      return plain(`I ${past}${rest}, I have ${part}${rest}`);
    case "indicatif/plus-que-parfait":
      return plain(`I had ${part}${rest}`);
    case "indicatif/passé-antérieur":
      return lit(`I had ${part}${rest}`);
    case "indicatif/futur-antérieur":
      return plain(`I will have ${part}${rest}`);
    case "subjonctif/présent":
      return plain(`(that) I ${base}${rest}`);
    case "subjonctif/imparfait":
      return lit(`(that) I ${past}${rest}`);
    case "subjonctif/passé":
      return plain(`(that) I have ${part}${rest}`);
    case "subjonctif/plus-que-parfait":
      return lit(`(that) I had ${part}${rest}`);
    case "conditionnel/présent":
      return plain(`I would ${base}${rest}`);
    case "conditionnel/passé":
      return plain(`I would have ${part}${rest}`);
    case "imperatif/imperatif-présent":
      return plain(`${base}${rest}!`);
    case "imperatif/imperatif-passé":
      return plain(`have ${part}${rest}!`);
    default:
      return null;
  }
}

/* ---------------- conjugation tables ---------------- */

const PERSON_LABEL: Record<string, string> = {
  "1s": "je", "2s": "tu", "3s": "il, elle",
  "1p": "nous", "2p": "vous", "3p": "ils, elles",
};

const PERSON_LABEL_SUBJ: Record<string, string> = {
  "1s": "que je", "2s": "que tu", "3s": "qu'il, qu'elle",
  "1p": "que nous", "2p": "que vous", "3p": "qu'ils, qu'elles",
};

const IMP_LABELS = ["(tu)", "(nous)", "(vous)"];

// "suis allé" + "suis allée" → "suis allé(e)";
// "sommes allés" + "sommes allées" → "sommes allé(e)s".
function mergeGender(m: string, f: string): string | null {
  const mw = m.split(" ");
  const fw = f.split(" ");

  if (mw.length !== fw.length) {
    return null;
  }

  const out: string[] = [];

  for (let i = 0; i < mw.length; i++) {
    const a = mw[i];
    const b = fw[i];

    if (a === b) {
      out.push(a);
    } else if (b === a + "e") {
      out.push(a + "(e)");
    } else if (a.endsWith("s") && b === a.slice(0, -1) + "es") {
      out.push(a.slice(0, -1) + "(e)s");
    } else {
      return null;
    }
  }

  return out.join(" ");
}

export interface TenseRow {
  form: string;
  pr: string;
}

export function tenseRows(cells: Cell[], mood: string): TenseRow[] {
  if (mood === "imperatif") {
    return cells.map((cell, i) => ({
      form: (cell.c ?? []).map(bare).join(" · "),
      pr: IMP_LABELS[i] ?? "",
    }));
  }

  const groups = new Map<string, Cell[]>();

  for (const cell of cells) {
    const key = (cell.p ?? "") + (cell.n ?? "");
    const group = groups.get(key);

    if (group) {
      group.push(cell);
    } else {
      groups.set(key, [cell]);
    }
  }

  const labels = mood === "subjonctif" ? PERSON_LABEL_SUBJ : PERSON_LABEL;
  const rows: TenseRow[] = [];
  const variantsOf = (c: Cell) => (c.c ?? []).map(bare);

  for (const [key, all] of groups) {
    // "on" duplicates the third person singular; drop it unless it is all
    // there is.
    let gcells = all.filter((c) => c.pr !== "on");

    if (!gcells.length) {
      gcells = all;
    }

    const uniq = [...new Set(gcells.map((c) => variantsOf(c).join(" · ")))];

    if (uniq.length === 1) {
      rows.push({ form: uniq[0], pr: labels[key] ?? "" });
      continue;
    }

    // Gender split (participle agreement): merge into (e) notation when the
    // two forms differ only by the agreement.
    const mc = gcells.find((c) => c.g === "m");
    const fc = gcells.find((c) => c.g === "f");
    let merged: string | null = null;

    if (mc && fc && gcells.length === 2) {
      const mv = variantsOf(mc);
      const fv = variantsOf(fc);

      if (mv.length === fv.length) {
        const parts = mv.map((m, i) => mergeGender(m, fv[i]));

        if (parts.every(Boolean)) {
          merged = parts.join(" · ");
        }
      }
    }

    if (merged !== null) {
      rows.push({ form: merged, pr: labels[key] ?? "" });
      continue;
    }

    for (const cell of gcells) {
      const l = labels[key] ?? "";
      const single =
        cell.g === "f"
          ? (l.split(", ").find((x) => /elle/.test(x)) ?? l)
          : (l.split(", ").find((x) => !/elle/.test(x)) ?? l);

      rows.push({ form: variantsOf(cell).join(" · "), pr: single });
    }
  }

  return rows;
}

export function withPronoun(row: TenseRow): string {
  if (row.pr === "je" && /^[aàâeéèêëiîïoôuûyh]/i.test(row.form)) {
    return "j'" + row.form;
  }

  return row.pr + " " + row.form;
}

export const SIMPLE_CARDS: [string, string, string, string][] = [
  ["indicatif", "présent", "Indicatif", "présent"],
  ["indicatif", "imparfait", "Indicatif", "imparfait"],
  ["indicatif", "passé-simple", "Indicatif", "passé simple"],
  ["indicatif", "futur-simple", "Indicatif", "futur simple"],
  ["subjonctif", "présent", "Subjonctif", "présent"],
  ["subjonctif", "imparfait", "Subjonctif", "imparfait"],
  ["conditionnel", "présent", "Conditionnel", "présent"],
  ["imperatif", "imperatif-présent", "Impératif", "présent"],
];

export const COMPOUND_CARDS: [string, string, string, string][] = [
  ["indicatif", "passé-composé", "Indicatif", "passé composé"],
  ["indicatif", "plus-que-parfait", "Indicatif", "plus-que-parfait"],
  ["indicatif", "passé-antérieur", "Indicatif", "passé antérieur"],
  ["indicatif", "futur-antérieur", "Indicatif", "futur antérieur"],
  ["subjonctif", "passé", "Subjonctif", "passé"],
  ["subjonctif", "plus-que-parfait", "Subjonctif", "plus-que-parfait"],
  ["conditionnel", "passé", "Conditionnel", "passé"],
  ["imperatif", "imperatif-passé", "Impératif", "passé"],
];

export const VERDICT_CHIP: Record<string, ["dim" | "ok", string]> = {
  clean: ["ok", "vérifié · Oxford-Hachette"],
  "hand-corrected": ["ok", "vérifié · corrigé à la main"],
  "attested-with-orphans": ["dim", "vérifié en partie"],
  failed: ["dim", "non vérifié"],
  "not-in-dictionary": ["dim", "hors dictionnaire"],
};
