import { useEffect, useState } from "react";
import * as api from "./api";

const STAGES = ["Applied", "Interview", "Offer", "Rejected"];
const weekLabel = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

function WeeklyChart({ weeks }) {
  const W = 640,
    H = 220,
    L = 32,
    R = 12,
    T = 12,
    B = 34;
  const max = Math.max(1, ...weeks.map((w) => w.count));
  const x = (i) => L + (i * (W - L - R)) / Math.max(1, weeks.length - 1);
  const y = (v) => H - B - (v * (H - T - B)) / max;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="chart"
      role="img"
      aria-label="Applications per week"
    >
      {[0, max].map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className="gridline" />
          <text x={L - 6} y={y(v) + 4} textAnchor="end" className="axis">
            {v}
          </text>
        </g>
      ))}
      <polyline
        fill="none"
        className="line"
        points={weeks.map((w, i) => `${x(i)},${y(w.count)}`).join(" ")}
      />
      {weeks.map((w, i) => (
        <g key={w.weekStart}>
          <circle cx={x(i)} cy={y(w.count)} r="4" className="dot">
            <title>{`Week of ${weekLabel(w.weekStart)}: ${w.count}`}</title>
          </circle>
          {i % 2 === 0 && (
            <text x={x(i)} y={H - 12} textAnchor="middle" className="axis">
              {weekLabel(w.weekStart)}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

function SourceBars({ sources }) {
  const max = Math.max(1, ...sources.map((s) => s.count));
  return (
    <div className="bars">
      {sources.map((s) => (
        <div className="barrow" key={s.source}>
          <span className="barlabel">{s.source}</span>
          <div className="bartrack">
            <div
              className="barfill"
              style={{ width: `${(s.count / max) * 100}%` }}
            />
          </div>
          <span className="barcount">{s.count}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .getDashboard()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error)
    return (
      <main className="wrap">
        <p className="error" role="alert">
          {error}
        </p>
      </main>
    );
  if (!data)
    return (
      <main className="wrap">
        <p className="empty">Loading…</p>
      </main>
    );

  return (
    <main className="wrap">
      <h1>Dashboard</h1>

      <div className="cards">
        <div className="stat">
          <span className="num">{data.total}</span>
          <span>Total</span>
        </div>
        {STAGES.map((s) => (
          <div className={`stat ${s}`} key={s}>
            <span className="num">{data.byStage[s]}</span>
            <span>{s}</span>
          </div>
        ))}
      </div>

      <div className="cards two">
        <div className="stat">
          <span className="num">{data.interviewRate}%</span>
          <span>Interview rate</span>
        </div>
        <div className="stat">
          <span className="num">{data.offerRate}%</span>
          <span>Offer rate</span>
        </div>
      </div>
      <p className="hint">
        Interview rate counts applications that reached the Interview or Offer
        stage.
      </p>

      <section className="card">
        <h2>Applications per week</h2>
        <WeeklyChart weeks={data.weekly} />
      </section>

      <section className="card">
        <h2>Applications by source</h2>
        <SourceBars sources={data.bySource} />
      </section>
    </main>
  );
}
