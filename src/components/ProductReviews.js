// src/components/ProductReviews.jsx
import React, { useMemo, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import RatingStars from "../lib/utils/RatingStars";
import { getCustomerRateRequest } from "../lib/actions/CustomerRateActions";

/* Récupère de manière tolérante l'id produit depuis un rate */
function getRateProductId(rate) {
  if (!rate || typeof rate !== "object") return null;
  const S = (v) => (v === 0 || v ? String(v) : null);
  return (
    S(rate.idProduct) ||
    S(rate.productId) ||
    S(rate.idProduit) ||
    S(rate.product?.id) ||
    S(rate.productVm?.id) ||
    S(rate.productDTO?.id) ||
    S(rate.product?.idProduct) ||
    S(rate.productRefId) ||
    S(rate.id) ||
    null
  );
}

export default function ProductReviews({
  productId,
  onAddReview,
  totalCount, // optionnel : force le total affiché ; sinon reviews.length
  className = "",
}) {
  const dispatch = useDispatch();
  const fetchOnce = useRef(false);

  const customerRates =
    useSelector((s) => s.customerRates?.customerRates) || [];

  const customersSlice = useSelector((s) => s.customers?.customers);
  const usersSlice     = useSelector((s) => s.users?.users);
  const customersList  = customersSlice ?? usersSlice ?? [];

  // Fetch (on garde ta logique)
  useEffect(() => {
    if (fetchOnce.current) return;
    if (customerRates.length === 0) {
      fetchOnce.current = true;
      dispatch(getCustomerRateRequest({ productId }));
      // Sinon : dispatch(getCustomerRateRequest());
    }
  }, [dispatch, customerRates.length, productId]);

  const getCustomerById = (id) =>
    Array.isArray(customersList)
      ? customersList.find((c) => String(c.id) === String(id))
      : null;

  const displayCustomerName = (c) => {
    if (!c) return "Client";
    const first =
      c.firstName || c.firstname || c.givenName || c.name || "";
    const last =
      c.lastName || c.lastname || c.familyName || "";
    const username = c.username || c.login || c.email || "";
    if (first && last)
      return `${first} ${String(last).charAt(0).toUpperCase()}.`;
    if (first) return first;
    if (username) return String(username).split("@")[0];
    return "Client";
  };

  // const toFrDate = (d) =>
  //   d
  //     ? new Date(d).toLocaleDateString("fr-FR", {
  //         day: "2-digit",
  //         month: "2-digit",
  //         year: "numeric",
  //       })
  //     : "";


const toFrDateLong = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt)) return "";
  return dt.toLocaleDateString("fr-FR", {
    day: "numeric",      // 10 (sans zéro)
    month: "long",       // octobre
    year: "numeric",     // 2025
  });
};


const timeOrNegInf = (d) => {
  if (!d) return -Infinity;
  const t = new Date(d).getTime();
  return Number.isFinite(t) ? t : -Infinity;
};


  // ---- Avis du produit courant
const reviews = useMemo(() => {
  const pidStr = String(productId);
  const list = (customerRates || []).filter(
    (r) => getRateProductId(r) === pidStr
  );

  const projected = list.map((r) => {
    const customer = getCustomerById(r.idCustomer ?? r.customerId);

    const title = r.title ?? r.subject ?? "";
    const message = r.message ?? r.comment ?? r.content ?? r.body ?? "";

    const verifiedDate = r.orderDate ?? r.orderedAt ?? r.order?.date ?? null;

    return {
      rating: Number(r.rate ?? r.rating ?? r.stars ?? 0),
      title,
      message,
      author: displayCustomerName(customer),
      creationDate: r.creationDate ?? r.createdAt ?? r.date,
      verified: Boolean(r.verified ?? r.fromOrder ?? r.isVerifiedPurchase),
      verifiedDate,
    };
  });

  // 🔽 Tri décroissant par date (récents → anciens)
  projected.sort(
    (a, b) => timeOrNegInf(b.creationDate) - timeOrNegInf(a.creationDate)
  );

  return projected;
}, [customerRates, productId, customersList]);

  // Total global affiché
  const total = totalCount ?? reviews.length;

  // Répartition par étoiles
  const distribution = useMemo(() => {
    const base = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const r of reviews) {
      const k = Math.max(
        1,
        Math.min(5, Math.round(Number(r.rating) || 0))
      );
      base[k] = (base[k] || 0) + 1;
    }
    return base;
  }, [reviews]);

  return (
    <section
      className={`reviews-section ${className}`}
      aria-labelledby="reviews-title"
    >
      <div className="reviews-grid">
        {/* Résumé gauche */}
        <aside className="reviews-summary">
          <h3 id="reviews-title" className="reviews-h3">
            {total} {total > 1 ? "avis" : "avis"}
          </h3>

          <div className="reviews-guideline">
            Charte de rédaction et de modération
          </div>

          {/* Étoiles + compteur (UN SEUL compteur, pas de doublon) */}
          <ul
            className="reviews-bars reviews-bars--compact"
            aria-label="Répartition des notes"
          >
            {[5, 4, 3, 2, 1].map((star) => {
              const n = distribution[star] || 0;
              const rowCls = n > 0 ? "has-reviews" : "is-zero";
              return (
                <li
                  key={star}
                  className={`reviews-bar reviews-bar--compact ${rowCls}`}
                >
                  <div className="reviews-bar-left">
                    {/* Masque le compteur interne du composant étoiles */}
                    <RatingStars
                      value={star}
                      size="sm"
                      className="rating--no-count"
                    />
                    <span className="reviews-row-count">
                      {n} {n > 1 ? "avis" : "avis"}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            className="reviews-cta"
            onClick={onAddReview}
            aria-label="Donner mon avis"
          >
            Donner mon avis
          </button>
        </aside>

        {/* Liste des avis – mise en page complète */}
        <div className="reviews-list">
          {reviews.length === 0 && total > 0 && (
            <p className="reviews-empty">
              Les avis détaillés ne sont pas disponibles pour le moment.
            </p>
          )}
          {reviews.length === 0 && total === 0 && (
            <p className="reviews-empty">Aucun avis pour le moment.</p>
          )}

          {reviews.map((r, idx) => (
            <article key={idx} className="review-card">
              {/* Ligne du haut : étoiles à gauche + date à droite */}
              <div className="review-toprow">
                <div className="review-stars">
                  <RatingStars
                    value={Number(r.rating) || 0}
                    size="sm"
                    className="rating--no-count"
                  />
                </div>
                <time className="review-date-right">
                  Publié le {toFrDateLong(r.creationDate)}
                </time>
              </div>

              {/* Auteur */}
              <div className="review-author-line">
                <strong>par {r.author || "Client"}</strong>
                  <span className="verified-badge" title="Achat vérifié">
                    Achat vérifié
                  </span>
              </div>

              {/* Titre */}
              {r.title && <h4 className="review-title">{r.title}</h4>}

              {/* Message (muted) */}
              {r.message && (
                <p className="review-message muted">{r.message}</p>
              )}

              {/* Pied (achat vérifié) */}
              <div className="review-footer">
                {r.verified && (
                  <div className="review-meta">
                    Avis publié suite à une commande
                    {r.verifiedDate ? ` du ${toFrDateLong(r.verifiedDate)}` : ""}
                  </div>
                )}
              </div>

              <hr className="review-sep" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
