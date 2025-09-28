// src/pages/checkout/Success.jsx
import { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { confirmCheckoutSessionRequest } from "../../lib/actions/StripeActions";
import { saveCartRequest } from "../../lib/actions/CartActions";
import "../../styles/pages/success.css";

export default function Success() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const dispatch = useDispatch();

  // Variables CSS locales pour garantir une bonne lisibilité du texte
  // (au-dessus de :root si jamais --text/--muted ont été mises en blanc)
  const themeVars = useMemo(
    () => ({
      // texte principal & secondaire (lisibles sur carte blanche)
      "--text": "#0f172a",
      "--muted": "#64748b",
      // tu peux aussi surcharger le fond ici si besoin:
      // "--bg-color": "linear-gradient(180deg,#d1fae5 0%, #ffffff 100%)",
    }),
    []
  );

  useEffect(() => {
    if (!sessionId) return;
    (async () => {
      await dispatch(confirmCheckoutSessionRequest(sessionId));
      await dispatch(saveCartRequest([]));
      localStorage.setItem("items", "[]");
      localStorage.removeItem("promo_map");
    })();
  }, [sessionId, dispatch]);

  return (
    <main className="success-page" style={themeVars}>
      <section className="success-card" role="status" aria-live="polite">
        {/* Badge (coche) */}
        <div className="success-badge" aria-hidden="true">
          {/* SVG check (évite la dépendance à Bootstrap Icons) */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.45)" strokeWidth="2" />
            <path
              d="M7.5 12.5l3.2 3.2 5.8-7"
              stroke="#fff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="success-title">Paiement confirmé</h1>

        <p className="success-text">
          Merci pour votre commande&nbsp;! Nous la préparons dès maintenant.
          Vous recevrez un e-mail de confirmation avec les détails.
        </p>

        <div className="success-actions">
          <Link to="/" className="success-home-btn">
            Retour à l’accueil
          </Link>
        </div>
      </section>
    </main>
  );
}
