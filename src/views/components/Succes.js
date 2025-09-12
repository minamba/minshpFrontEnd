// src/pages/checkout/Success.jsx
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { confirmCheckoutSessionRequest } from "../../lib/actions/StripeActions";
import { saveCartRequest } from "../../lib/actions/CartActions";

export default function Success() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const dispatch = useDispatch();

  useEffect(() => {
    if (!sessionId) return;
    (async () => {
      await dispatch(confirmCheckoutSessionRequest(sessionId));
      await dispatch(saveCartRequest([]));
      localStorage.setItem("items", "[]");
    })();
  }, [sessionId, dispatch]);

  return (
    <main className="success-page">
      <section className="success-card">
        {/* Si tu ne veux AUCUNE encoche, supprime ce bloc */}
        <div className="success-badge" aria-hidden="true">
          <i className="bi bi-check-lg" />
        </div>

        <h1 className="success-title">Paiement confirmé</h1>

        <p className="success-text">
          Merci pour votre commande ! Nous la préparons dès maintenant.
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
