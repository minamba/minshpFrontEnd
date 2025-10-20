import React from "react";

/**
 * RatingStars
 * - value: moyenne (0..5) — ex: 3.7
 * - count: nombre d'avis — ex: 15
 * - size: "sm" | "md" (taille des étoiles)
 * - className: classes supplémentaires
 */
export default function RatingStars({
  value = 0,
  count = 0,
  size = "md",
  className = "",
  "aria-label": ariaLabel,
}) {
  // On arrondit au 0.5 le plus proche (3.24 -> 3, 3.25 -> 3.5, 3.74 -> 3.5, 3.75 -> 4)
  const rounded = Math.max(0, Math.min(5, Math.round(value * 2) / 2));
  const full = Math.floor(rounded);
  const hasHalf = rounded - full === 0.5;

  const px = size === "sm" ? 16 : 18;

  const Star = ({ type }) => {
    // type: "full" | "half" | "empty"
    const fillFull = "var(--star-blue, #0ea5e9)";
    const fillEmpty = "var(--star-empty, #d1d5db)";

    if (type === "half") {
      // Étoile moitié bleue / moitié grise (clip rectangulaire)
      const id = Math.random().toString(36).slice(2);
      return (
        <svg
          width={px}
          height={px}
          viewBox="0 0 24 24"
          role="presentation"
          aria-hidden="true"
        >
          <defs>
            <clipPath id={`half-${id}`}>
              <rect x="0" y="0" width="12" height="24" />
            </clipPath>
          </defs>
          <path
            d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            fill={fillEmpty}
          />
          <path
            d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            fill={fillFull}
            clipPath={`url(#half-${id})`}
          />
        </svg>
      );
    }

    return (
      <svg
        width={px}
        height={px}
        viewBox="0 0 24 24"
        role="presentation"
        aria-hidden="true"
      >
        <path
          d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
          fill={type === "full" ? fillFull : fillEmpty}
        />
      </svg>
    );
  };

  return (
    <div
      className={`rating ${size === "sm" ? "rating--sm" : ""} ${className}`}
      aria-label={ariaLabel || `Note ${rounded} sur 5 — ${count} avis`}
      title={`${rounded.toString().replace(".", ",")} / 5 (${count} avis)`}
    >
      <span className="rating__stars" aria-hidden="true">
        {Array.from({ length: full }).map((_, i) => <Star key={`f${i}`} type="full" />)}
        {hasHalf && <Star type="half" />}
        {Array.from({ length: 5 - full - (hasHalf ? 1 : 0) }).map((_, i) => (
          <Star key={`e${i}`} type="empty" />
        ))}
      </span>
      <span className="rating__count">{count} avis</span>
    </div>
  );
}
