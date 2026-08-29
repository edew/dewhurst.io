import type { CSSProperties } from "react";

import bands from "../strata-data.json";

export function Strata() {
  return (
    <div id="strata" aria-hidden="true">
      {bands.map((band) => (
        <div
          key={band.top}
          className="band"
          style={
            {
              top: band.top,
              bottom: band.bottom,
              "--band-fill-dark": band.fill,
              "--band-fill-light": band.lightFill,
              "--band-body-dark": band.bodyBackground,
              "--band-body-light": band.lightBodyBackground,
            } as CSSProperties
          }
        >
          <svg
            className="back"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
          >
            <path d={band.back} fillOpacity="0.45" />
          </svg>
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d={band.front} />
          </svg>
          <div className="body" />
        </div>
      ))}
    </div>
  );
}
