import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "react-router";

import {
  COMPOUND_CARDS,
  SIMPLE_CARDS,
  TOP10,
  VERBS_URL,
  VERDICT_CHIP,
  buildFormIndex,
  engOf,
  fmtFreq,
  norm,
  runSearch,
  tenseGloss,
  tenseRows,
  withPronoun,
  type English,
  type Verb,
} from "./mille-verbes-data";
import styles from "./mille-verbes.module.css";

/* ---------------- small pieces ---------------- */

// Highlights the matched slice of a lemma or a gloss. norm() keeps one
// character per character of composed (NFC) text — the marks it strips are the
// ones NFD has just added — so the offset found in the normalised text also
// indexes the original. The length of the match is measured on the normalised
// needle, because a needle typed on a keyboard that emits NFD is shorter once
// normalised than it looks.
function Hi({ needle, text }: { needle: string; text: string }) {
  if (!needle) {
    return <>{text}</>;
  }

  const n = norm(needle);
  const i = norm(text).indexOf(n);

  if (i < 0) {
    return <>{text}</>;
  }

  return (
    <>
      {text.slice(0, i)}
      <mark className={styles.mark}>{text.slice(i, i + n.length)}</mark>
      {text.slice(i + n.length)}
    </>
  );
}

function SearchIcon() {
  return (
    <svg
      className={styles.searchIcon}
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="4.5" />
      <line x1="10.5" y1="10.5" x2="14" y2="14" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 12 12"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="2,6.5 5,9.5 10,3" />
    </svg>
  );
}

function FreqBar({ max, verb }: { max: number; verb: Verb }) {
  // Square root, so that "être" at 32 000 per million does not flatten every
  // other bar to nothing.
  const pct = Math.max(1.5, 100 * Math.sqrt(verb.freq / max));

  return (
    <span className={styles.freq}>
      <span className={styles.bar}>
        <span
          className={styles.barFill}
          style={{ width: `${pct.toFixed(1)}%` }}
        />
      </span>
      <span className={styles.occ}>{fmtFreq(verb.freq)}</span>
    </span>
  );
}

function VerbRow({
  max,
  onOpen,
  query,
  selected,
  verb,
  where,
}: {
  max: number;
  onOpen: (lemma: string) => void;
  query: string;
  selected: boolean;
  verb: Verb;
  where: "" | "gloss" | "lemma";
}) {
  const gloss = (verb.glosses ?? []).join(", ") || "—";

  return (
    <button
      type="button"
      className={selected ? `${styles.row} ${styles.sel}` : styles.row}
      onClick={() => onOpen(verb.lemma)}
    >
      <span className={styles.rank}>{verb.rank}</span>
      <span className={styles.lemmaWrap}>
        <span className={styles.lemma}>
          <Hi text={verb.lemma} needle={where === "gloss" ? "" : query} />
        </span>
        {verb.aux === "être" ? (
          <span className={styles.chipEtre}>être</span>
        ) : null}
      </span>
      <span className={styles.gloss} lang="en">
        <Hi text={gloss} needle={where === "lemma" ? "" : query} />
      </span>
      <FreqBar max={max} verb={verb} />
      <span className={styles.go}>›</span>
    </button>
  );
}

/* ---------------- detail view ---------------- */

function TenseCard({
  e,
  mood,
  moodLabel,
  tense,
  tenseLabel,
  verb,
}: {
  e: English | null;
  mood: string;
  moodLabel: string;
  tense: string;
  tenseLabel: string;
  verb: Verb;
}) {
  const cells = verb.moods?.[mood]?.[tense];

  if (!cells || !cells.length) {
    return null;
  }

  const en = tenseGloss(mood, tense, e);

  return (
    <div className={styles.card}>
      <div className={styles.mood}>{moodLabel}</div>
      <div className={styles.tense}>
        <span className={styles.tenseName}>{tenseLabel}</span>
        {en ? (
          <span className={styles.tenseEn} lang="en">
            {en.text}
            {en.literary ? (
              <span className={styles.lit}> (literary)</span>
            ) : null}
          </span>
        ) : null}
      </div>
      <div className={styles.forms}>
        {tenseRows(cells, mood).map((row, i) => (
          <div className={styles.f} key={i}>
            <div className={styles.pr}>{row.pr}</div>
            <div className={styles.fo}>{row.form}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Detail({ onBack, verb }: { onBack: () => void; verb: Verb }) {
  const [tab, setTab] = useState<"compose" | "simple">("simple");
  const uid = useId();
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const tabId = (name: string) => `${uid}-tab-${name}`;
  const panelId = `${uid}-panel`;

  // Tabs are one stop in the tab order, and ←/→ move between them.
  function onTabKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }

    event.preventDefault();

    const next = tab === "simple" ? "compose" : "simple";

    setTab(next);
    tabRefs.current[next]?.focus();
  }

  const e = engOf(verb);
  const gloss = (verb.glosses ?? []).join(", ");
  const [verdictKind, verdictText] = VERDICT_CHIP[verb.verdict ?? ""] ?? [
    "dim" as const,
    verb.verdict ?? "",
  ];

  const inf =
    verb.moods?.infinitif?.["infinitif-présent"]?.[0]?.c?.[0] ?? verb.lemma;
  const ppr = verb.moods?.participe?.["participe-présent"]?.[0]?.c?.[0] ?? "";
  const ppAll = [
    ...new Set(
      (verb.moods?.participe?.["participe-passé"] ?? []).flatMap(
        (c) => c.c ?? [],
      ),
    ),
  ];
  const pp = ppAll[0] ?? "";
  const ppVars = ppAll.slice(1).join(" · ");
  const pcRows = tenseRows(
    verb.moods?.indicatif?.["passé-composé"] ?? [],
    "indicatif",
  );
  const pcCell = pcRows.length ? withPronoun(pcRows[0]) : "";

  return (
    <div className={styles.detail}>
      <button type="button" className={styles.backlink} onClick={onBack}>
        ← retour à la liste
      </button>

      <div className={styles.headword}>
        <span className={styles.hw}>{verb.lemma}</span>
        {verb.ipa ? <span className={styles.ipa}>/{verb.ipa}/</span> : null}
        {gloss ? (
          <span className={styles.tr} lang="en">
            {gloss}
          </span>
        ) : null}
      </div>

      <div className={styles.chips}>
        <span className={styles.chip}>
          auxiliaire <b>{verb.aux ?? "avoir"}</b>
        </span>
        <span className={`${styles.chip} ${styles.chipDim}`}>
          rang {verb.rank} · {fmtFreq(verb.freq)} occ./M
        </span>
        <span
          className={
            verdictKind === "ok"
              ? `${styles.chip} ${styles.chipOk}`
              : `${styles.chip} ${styles.chipDim}`
          }
        >
          {verdictKind === "ok" ? <CheckIcon /> : null}
          {verdictText}
        </span>
      </div>

      <div
        className={styles.tabs}
        role="tablist"
        aria-label="Temps"
        onKeyDown={onTabKeyDown}
      >
        <button
          type="button"
          role="tab"
          id={tabId("simple")}
          aria-controls={panelId}
          aria-selected={tab === "simple"}
          tabIndex={tab === "simple" ? 0 : -1}
          ref={(el) => {
            tabRefs.current.simple = el;
          }}
          className={
            tab === "simple" ? `${styles.tab} ${styles.tabOn}` : styles.tab
          }
          onClick={() => setTab("simple")}
        >
          Temps simples
        </button>
        <button
          type="button"
          role="tab"
          id={tabId("compose")}
          aria-controls={panelId}
          aria-selected={tab === "compose"}
          tabIndex={tab === "compose" ? 0 : -1}
          ref={(el) => {
            tabRefs.current.compose = el;
          }}
          className={
            tab === "compose" ? `${styles.tab} ${styles.tabOn}` : styles.tab
          }
          onClick={() => setTab("compose")}
        >
          Temps composés
        </button>
      </div>

      {/* The panel holds no focusable elements, so it takes a tab stop of its
          own — otherwise the cards are out of reach of the keyboard. */}
      <div
        className={styles.cards}
        role="tabpanel"
        id={panelId}
        aria-labelledby={tabId(tab)}
        tabIndex={0}
      >
        {(tab === "compose" ? COMPOUND_CARDS : SIMPLE_CARDS).map(
          ([mood, tense, moodLabel, tenseLabel]) => (
            <TenseCard
              key={mood + "/" + tense}
              e={e}
              mood={mood}
              moodLabel={moodLabel}
              tense={tense}
              tenseLabel={tenseLabel}
              verb={verb}
            />
          ),
        )}
      </div>

      <div className={styles.strip}>
        <div className={styles.item}>
          <div className={styles.k}>Infinitif</div>
          <div className={styles.v}>{inf}</div>
        </div>
        {ppr ? (
          <div className={styles.item}>
            <div className={styles.k}>Participe présent</div>
            <div className={styles.v}>
              {ppr}{" "}
              {e ? (
                <span className={styles.en} lang="en">
                  {e.ing}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}
        {pp ? (
          <div className={styles.item}>
            <div className={styles.k}>Participe passé</div>
            <div className={styles.v}>
              {pp}{" "}
              {ppVars ? (
                <span className={styles.varForm}>· {ppVars}</span>
              ) : null}{" "}
              {e ? (
                <span className={styles.en} lang="en">
                  {e.part}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}
        {pcCell ? (
          <div className={styles.item}>
            <div className={styles.k}>Passé composé</div>
            <div className={`${styles.v} ${styles.vItalic}`}>
              {pcCell}{" "}
              {e ? (
                <span className={`${styles.en} ${styles.enUpright}`} lang="en">
                  I {e.past}
                  {e.rest}, I have {e.part}
                  {e.rest}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ---------------- the app ---------------- */

export default function MilleVerbes() {
  const [verbs, setVerbs] = useState<Verb[]>(TOP10);
  const [full, setFull] = useState(false);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);

  // Which verb is open lives in the URL, so that a detail view can be linked
  // to and the browser's back button returns to the list. The page is
  // prerendered without search params, so the parameter is only read in an
  // effect — reading it while rendering would not match the served HTML.
  const [searchParams, setSearchParams] = useSearchParams();
  const wanted = searchParams.get("v") ?? "";
  const [lemma, setLemma] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const sorted = useMemo(
    () => verbs.slice().sort((a, b) => a.rank - b.rank),
    [verbs],
  );
  const byLemma = useMemo(
    () => new Map(sorted.map((v) => [v.lemma, v])),
    [sorted],
  );
  const maxFreq = useMemo(
    () => Math.max(...sorted.map((v) => v.freq), 1),
    [sorted],
  );
  const formIndex = useMemo(() => buildFormIndex(sorted), [sorted]);

  const trimmed = query.trim();
  const results = useMemo(
    () => runSearch(trimmed, sorted, formIndex),
    [formIndex, sorted, trimmed],
  );
  // One flat list of lemmas, for ↑↓ and ↵.
  const targets = useMemo(
    () => [
      ...results.verbs.map((s) => s.v.lemma),
      ...results.forms.map((h) => h.lemma),
    ],
    [results],
  );

  // The other 990 verbs arrive on the first hint that ten are not enough:
  // focusing the search box, typing, or asking for the rest of the list.
  const loadFull = useCallback(() => {
    if (loadingRef.current || full || typeof window === "undefined") {
      return;
    }

    loadingRef.current = true;
    setNotice("Chargement des mille verbes…");

    fetch(VERBS_URL)
      .then((r) => {
        if (!r.ok) {
          throw new Error(String(r.status));
        }
        return r.json() as Promise<{ verbs: Verb[] }>;
      })
      .then((d) => {
        setVerbs(d.verbs);
        setFull(true);
        setNotice("");
      })
      .catch(() => {
        loadingRef.current = false;
        setNotice("Impossible de charger les mille verbes.");
      });
  }, [full]);

  // Opening a verb pushes ?v=<lemme> — one history entry, so that the back
  // button returns to the list. Closing it replaces, so that the entry does
  // not linger in front of the list.
  const open = useCallback(
    (target: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);

          next.set("v", target);

          return next;
        },
        { preventScrollReset: true },
      );
    },
    [setSearchParams],
  );

  const close = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);

        next.delete("v");

        return next;
      },
      { preventScrollReset: true, replace: true },
    );
  }, [setSearchParams]);

  // "/" focuses the search box, escape clears it and goes back to the list.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const input = inputRef.current;
      const active = document.activeElement;
      const inField =
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement;

      if (
        event.key === "/" &&
        !inField &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        event.preventDefault();
        input?.focus();
        input?.select();
      } else if (event.key === "Escape") {
        setQuery("");

        if (wanted) {
          close();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [close, wanted]);

  useEffect(() => {
    setLemma(wanted);
  }, [wanted]);

  const detailVerb = lemma ? byLemma.get(lemma) : undefined;
  const openLemma = detailVerb?.lemma ?? "";

  // A link to a verb outside the bundled ten needs the other 990 first…
  useEffect(() => {
    if (lemma && !detailVerb) {
      loadFull();
    }
  }, [detailVerb, lemma, loadFull]);

  // …and once they are all in, a lemma still unknown is not a verb at all.
  useEffect(() => {
    if (full && lemma && !detailVerb) {
      setLemma("");
      close();
    }
  }, [close, detailVerb, full, lemma]);

  // Opening a verb swaps the whole panel out, so bring its top back into view.
  useEffect(() => {
    if (openLemma && rootRef.current) {
      rootRef.current.scrollIntoView({ block: "start" });
    }
  }, [openLemma]);

  // Fresh results, fresh cursor.
  useEffect(() => {
    setSel(0);
  }, [targets]);

  function back() {
    setQuery("");
    close();
  }

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);

    if (wanted) {
      close();
    }

    if (event.target.value.trim()) {
      loadFull();
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!trimmed || detailVerb || !targets.length) {
      return;
    }

    const clamp = (s: number) => Math.min(Math.max(s, 0), targets.length - 1);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSel((s) => (clamp(s) + 1) % targets.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSel((s) => (clamp(s) - 1 + targets.length) % targets.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      open(targets[clamp(sel)]);
    }
  }

  // The cursor is an index into `targets`, never a lemma: the same lemma can
  // be both a verb hit and a conjugated-form hit ("reste"), and two lit rows
  // read as a stuck cursor.
  const selIndex = targets.length ? Math.min(sel, targets.length - 1) : -1;

  return (
    <div className={styles.app} lang="fr" ref={rootRef}>
      <div className={styles.search}>
        <SearchIcon />
        <input
          type="text"
          lang="fr"
          autoComplete="off"
          spellCheck={false}
          placeholder="Cherchez un verbe — français, anglais, ou forme conjuguée…"
          aria-label="Cherchez un verbe"
          ref={inputRef}
          value={query}
          onChange={onChange}
          onFocus={loadFull}
          onKeyDown={onKeyDown}
        />
        <span className={styles.kbd}>/</span>
      </div>

      {/* Always in the tree, and hidden by CSS while empty, so that a screen
          reader has the live region before the message arrives in it. */}
      <p className={styles.notice} role="status">
        {notice}
      </p>

      {detailVerb ? (
        <Detail verb={detailVerb} onBack={back} key={detailVerb.lemma} />
      ) : trimmed ? (
        <section className={styles.panel}>
          <div className={styles.panelHead}>Résultats · « {trimmed} »</div>
          {!results.verbs.length && !results.forms.length ? (
            <p className={styles.empty}>
              Aucun verbe trouvé
              {full ? "" : " parmi les dix premiers — chargement du reste…"}
            </p>
          ) : null}
          {results.verbs.map((s, i) => (
            <VerbRow
              key={"v:" + s.v.lemma}
              max={maxFreq}
              onOpen={open}
              query={trimmed}
              selected={selIndex === i}
              verb={s.v}
              where={s.where}
            />
          ))}
          {results.forms.map((h, i) => (
            <button
              type="button"
              key={"f:" + h.form + h.lemma}
              className={
                selIndex === results.verbs.length + i
                  ? `${styles.rowForm} ${styles.sel}`
                  : styles.rowForm
              }
              onClick={() => open(h.lemma)}
            >
              <span className={styles.form}>{h.form}</span>
              <span className={styles.arrow}>→</span>
              <span className={styles.lemma}>{h.lemma}</span>
              <span className={styles.what}>forme conjuguée</span>
              <span className={styles.go}>›</span>
            </button>
          ))}
          <p className={styles.panelFoot}>
            Les formes conjuguées marchent aussi — « fussent » vous mène à être
            &nbsp;·&nbsp; ↑↓ naviguer, ↵ ouvrir, esc effacer
          </p>
        </section>
      ) : (
        <section>
          <div className={styles.panel}>
            {sorted.map((v) => (
              <VerbRow
                key={v.lemma}
                max={maxFreq}
                onOpen={open}
                query=""
                selected={false}
                verb={v}
                where=""
              />
            ))}
            {full ? (
              <p className={styles.panelFoot}>
                Mille verbes chargés — cherchez, ou parcourez la liste.
              </p>
            ) : (
              <button
                type="button"
                className={styles.loadmore}
                onClick={loadFull}
              >
                Afficher les 990 autres verbes ↓
              </button>
            )}
          </div>
        </section>
      )}

      <p className={styles.credit}>
        Conjugaisons:{" "}
        <a href="https://github.com/bretttolbert/verbecc">
          verbecc
        </a>{" "}
        · Fréquences:{" "}
        <a href="http://www.lexique.org">
          Lexique 3.83
        </a>
      </p>
    </div>
  );
}
