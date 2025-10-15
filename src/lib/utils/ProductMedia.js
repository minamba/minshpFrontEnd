import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

/** Hook minimaliste pour gérer le swipe/drag horizontal */
function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 40 }) {
  const startX = useRef(0);
  const lastX = useRef(0);
  const isDown = useRef(false);

  const onStart = (x) => {
    isDown.current = true;
    startX.current = x;
    lastX.current = x;
  };
  const onMove = (x) => {
    if (!isDown.current) return;
    lastX.current = x;
  };
  const onEnd = () => {
    if (!isDown.current) return;
    const delta = lastX.current - startX.current;
    if (delta <= -threshold) onSwipeLeft?.();
    if (delta >= threshold) onSwipeRight?.();
    isDown.current = false;
  };

  return { onStart, onMove, onEnd };
}

/* ------------------------------------------------------------------ */
/* Lightbox                                                            */
/* ------------------------------------------------------------------ */
function Lightbox({
  images,
  index,
  onClose,
  onChange,
  containerSelector = ".product-page",
}) {
  const [current, setCurrent] = useState(index ?? 0);
  const overlayRef = useRef(null);

  const canPrev = current > 0;
  const canNext = current < images.length - 1;

  useEffect(() => setCurrent(index ?? 0), [index]);

  const go = (i) => {
    const next = clamp(i, 0, images.length - 1);
    setCurrent(next);
    onChange?.(next);
  };
  const goPrev = () => canPrev && go(current - 1);
  const goNext = () => canNext && go(current + 1);

  // clavier
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, canPrev, canNext]);

  // empêcher scroll + interactions derrière (mobile)
  useEffect(() => {
    const el = document.querySelector(containerSelector);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    el?.classList?.add("no-touch-while-lb");
    return () => {
      document.body.style.overflow = prevOverflow;
      el?.classList?.remove("no-touch-while-lb");
    };
  }, [containerSelector]);

  // swipe
  const { onStart, onMove, onEnd } = useSwipe({
    onSwipeLeft: goNext,
    onSwipeRight: goPrev,
    threshold: 40,
  });

  // Portail
  const portalRoot =
    document.getElementById("portal-root") ||
    (() => {
      const div = document.createElement("div");
      div.id = "portal-root";
      document.body.appendChild(div);
      return div;
    })();

  const content = (
    <div
      className="lb-overlay"
      ref={overlayRef}
      onClick={(e) => {
        // close only when clicking backdrop
        if (e.target === overlayRef.current) onClose?.();
      }}
    >
      <div
        className="lb-content"
        onMouseDown={(e) => onStart(e.clientX)}
        onMouseMove={(e) => onMove(e.clientX)}
        onMouseUp={onEnd}
        onMouseLeave={onEnd}
        onTouchStart={(e) => onStart(e.touches[0].clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onTouchEnd={onEnd}
      >
        {/* Topbar */}
        <div className="lb-topbar">
          <div className="lb-counter">
            {current + 1} / {images.length}
          </div>
          <button className="lb-btn lb-close" onClick={onClose} aria-label="Fermer">
            ×
          </button>
        </div>

        {/* Media zone */}
        <div className="lb-stage">
          {canPrev && (
            <button className="lb-btn lb-arrow lb-prev" onClick={goPrev} aria-label="Précédent">
              ‹
            </button>
          )}

          <img
            key={current}
            className="lb-image"
            src={images[current]?.url || images[current]}
            alt={images[current]?.alt || `Image ${current + 1}`}
            draggable={false}
          />

          {canNext && (
            <button className="lb-btn lb-arrow lb-next" onClick={goNext} aria-label="Suivant">
              ›
            </button>
          )}
        </div>

        {/* Thumbs strip */}
        {images.length > 1 && (
          <div className="lb-thumbs">
            {images.map((img, i) => (
              <button
                key={i}
                className={`lb-thumb ${i === current ? "is-active" : ""}`}
                onClick={() => go(i)}
                aria-label={`Aller à l'image ${i + 1}`}
              >
                <img src={img?.url || img} alt={img?.alt || `Miniature ${i + 1}`} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, portalRoot);
}

/* ------------------------------------------------------------------ */
/* ProductMedia (galerie page produit + lightbox)                      */
/* ------------------------------------------------------------------ */
export const ProductMedia = ({
  images = [],
  initialIndex = 0,
  mainAlt = "Image produit",
}) => {
  const safeImages = useMemo(
    () =>
      images
        .filter(Boolean)
        .map((x) => (typeof x === "string" ? { url: x, alt: "" } : x)),
    [images]
  );

  const [current, setCurrent] = useState(clamp(initialIndex, 0, safeImages.length - 1));
  const [isLbOpen, setLbOpen] = useState(false);

  if (!safeImages.length) return null;

  return (
    <>
      {/* Colonne vignettes */}
      <div className="thumbs-col">
        {safeImages.map((img, i) => (
          <button
            key={i}
            className="thumb"
            onClick={() => setCurrent(i)}
            aria-label={`Sélectionner l'image ${i + 1}`}
          >
            <img src={img.url} alt={img.alt || `Miniature ${i + 1}`} loading="lazy" />
          </button>
        ))}
      </div>

      {/* Image principale */}
      <div className="product-main-image-wrap">
        <img
          className="product-main-image"
          src={safeImages[current].url}
          alt={safeImages[current].alt || mainAlt}
          onClick={() => setLbOpen(true)}
          role="button"
          style={{ cursor: "zoom-in" }}
        />
      </div>

      {/* Lightbox */}
      {isLbOpen && (
        <Lightbox
          images={safeImages}
          index={current}
          onChange={setCurrent}
          onClose={() => setLbOpen(false)}
        />
      )}
    </>
  );
};

export default ProductMedia;
