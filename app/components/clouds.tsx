import type { CSSProperties } from "react";

// Wispy stratus streaks over the daylight hero — the light theme's
// counterpart to the winking stars. Each streak is a hand-drawn closed
// lens shape in the strata bands' billow language: flat fills, with a
// larger 0.45-opacity echo of the same family set behind the solid
// streak for depth. The fourth wisp is echo-only, a fainter third
// tier. root.css shows them only under prefers-color-scheme: light.
export function Clouds() {
  return (
    <div id="clouds" aria-hidden="true">
      <div
        className="wisp w1"
        style={{ "--dur": "92s", "--delay": "-14s" } as CSSProperties}
      >
        <svg className="echo" viewBox="0 0 360 60" preserveAspectRatio="none">
          <path
            d="M0 30 Q25 14 55 10 Q85 6 115 9 Q145 12 170 8 Q200 4 230 7 Q260 10 285 16 Q310 22 335 26 Q350 28 360 30 Q335 34 310 36 Q285 38 260 37 Q235 36 210 37 Q185 38 160 39 Q135 38 110 37 Q85 36 60 34 Q35 32 0 30 Z"
            fill="#fbfdff"
            fillOpacity="0.45"
          />
        </svg>
        <svg viewBox="0 0 320 46" preserveAspectRatio="none">
          <path
            d="M0 23 Q20 12 45 9 Q70 6 95 8 Q120 10 140 7 Q165 4 190 6 Q215 8 235 12 Q260 16 285 19 Q305 21 320 23 Q300 26 280 27 Q260 28 240 27.5 Q220 27 200 27.5 Q180 28 160 28.5 Q140 28 120 27.5 Q100 27 80 26.5 Q60 26 40 25 Q20 24 0 23 Z"
            fill="#fbfdff"
          />
        </svg>
      </div>
      <div
        className="wisp w2"
        style={{ "--dur": "76s", "--delay": "-40s" } as CSSProperties}
      >
        <svg className="echo" viewBox="0 0 250 44" preserveAspectRatio="none">
          <path
            d="M0 22 Q18 10 42 7 Q65 4 88 7 Q112 10 130 6 Q150 2 172 6 Q195 10 215 15 Q233 19 250 22 Q233 26 215 28 Q195 30 172 29 Q150 28 130 28.5 Q112 29 88 28 Q65 27 42 25 Q18 23.5 0 22 Z"
            fill="#fbfdff"
            fillOpacity="0.45"
          />
        </svg>
        <svg viewBox="0 0 220 34" preserveAspectRatio="none">
          <path
            d="M0 17 Q15 8 35 6 Q55 4 75 6 Q95 8 110 5 Q130 2 150 5 Q170 8 190 12 Q205 15 220 17 Q205 20 190 21 Q170 22 150 21 Q130 20 110 20.5 Q95 21 75 20 Q55 19 35 18 Q15 17.5 0 17 Z"
            fill="#fbfdff"
          />
        </svg>
      </div>
      <div
        className="wisp w3"
        style={{ "--dur": "68s", "--delay": "-8s" } as CSSProperties}
      >
        <svg className="echo" viewBox="0 0 175 28" preserveAspectRatio="none">
          <path
            d="M0 14 Q14 6 33 4.5 Q49 3 64 5.5 Q79 8 91 4.5 Q105 1 122 4.5 Q138 8 154 10.5 Q165 12.5 175 14 Q163 16.5 149 17.5 Q134 18.5 117 17.5 Q99 16.5 82 17 Q64 17.5 49 16.5 Q33 15.5 14 15 Q6 14.5 0 14 Z"
            fill="#fbfdff"
            fillOpacity="0.45"
          />
        </svg>
        <svg viewBox="0 0 150 24" preserveAspectRatio="none">
          <path
            d="M0 12 Q12 5 28 4 Q42 3 55 5 Q68 7 78 4 Q90 1 105 4 Q118 7 132 9 Q142 11 150 12 Q140 14 128 15 Q115 16 100 15 Q85 14 70 14.5 Q55 15 42 14 Q28 13 12 13 Q4 12.5 0 12 Z"
            fill="#fbfdff"
          />
        </svg>
      </div>
      <div
        className="wisp w4"
        style={{ "--dur": "100s", "--delay": "-55s" } as CSSProperties}
      >
        <svg viewBox="0 0 200 30" preserveAspectRatio="none">
          <path
            d="M0 15 Q20 6 45 5 Q70 4 90 7 Q112 10 130 6 Q150 2 170 6 Q188 10 200 15 Q185 19 165 20 Q145 21 125 20 Q105 19 85 19.5 Q65 20 45 19 Q25 18 0 15 Z"
            fill="#fbfdff"
            fillOpacity="0.3"
          />
        </svg>
      </div>
    </div>
  );
}
