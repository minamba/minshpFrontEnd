import React, { memo, useEffect, useMemo, useRef, useState } from "react";

export const PromoTicker = memo(function PromoTicker({ messages = [] }) {
  const list = useMemo(
    () =>
      (Array.isArray(messages) ? messages : [])
        .filter(Boolean)
        .map((s) => String(s).trim())
        .filter(Boolean),
    [messages]
  );

  // Hooks toujours déclarés
  const [restartKey, setRestartKey] = useState(0);
  const [animating, setAnimating] = useState(true);
  const trackRef = useRef(null);

  const joined = useMemo(() => list.join(" • "), [list]);

  // Relancer quand le contenu change
  useEffect(() => {
    setAnimating(false);
    if (trackRef.current) { void trackRef.current.offsetHeight; } // reflow
    setAnimating(true);
    setRestartKey((k) => k + 1);
  }, [joined]);

  // Corriger bfcache + retour d’onglet
  useEffect(() => {
    const restart = () => {
      setAnimating(false);
      if (trackRef.current) { void trackRef.current.offsetHeight; }
      setAnimating(true);
      setRestartKey((k) => k + 1);
    };
    const onPageShow = (e) => { if (e.persisted) restart(); };
    const onVisibility = () => { if (document.visibilityState === "visible") restart(); };
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  if (list.length === 0) return null;

  return (
    <div className="promo-ticker promo-ticker--sticky" role="region" aria-label="Bandeau d'annonces">
      <div
        ref={trackRef}
        key={restartKey}
        className={`promo-track ${animating && !prefersReduced ? "is-animating" : "is-resting"}`}
        aria-hidden={prefersReduced ? "true" : "false"}
      >
        <div className="promo-items">
          {list.map((m, i) => (
            <span className="promo-item" key={`t1-${i}`}>{m}</span>
          ))}
        </div>
        <div className="promo-items" aria-hidden="true">
          {list.map((m, i) => (
            <span className="promo-item" key={`t2-${i}`}>{m}</span>
          ))}
        </div>
      </div>
    </div>
  );
});
