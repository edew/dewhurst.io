import bands from "../hills.json";

export function Hills() {
  return (
    <div id="hills" aria-hidden="true">
      {bands.map((band) => (
        <div
          key={band.top}
          className="band"
          style={{ top: band.top, bottom: band.bottom }}
        >
          <svg
            className="back"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
          >
            <path d={band.back} fill={band.fill} fillOpacity="0.45" />
          </svg>
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d={band.front} fill={band.fill} />
          </svg>
          <div className="body" style={{ background: band.bodyBackground }} />
        </div>
      ))}
    </div>
  );
}
