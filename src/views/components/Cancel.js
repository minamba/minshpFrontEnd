// src/pages/checkout/Cancel.jsx
import { Link } from "react-router-dom";

export const Cancel = () => {
  return (
    <main className="cancel-page">
      <section className="cancel-card">
        {/* Croix blanche dans une bulle rouge */}
        <div className="cancel-badge bg-danger text-white" aria-hidden="true">
          <i className="bi bi-x-lg" />
        </div>

        <h1 className="cancel-title">Paiement annulé</h1>

        <p className="cancel-text">
          Le paiement a été annulé. Aucun montant n’a été débité.
          <br />
          Vous pouvez réessayer plus tard si besoin.
        </p>

        <div className="cancel-actions">
          <Link to="/" className="btn btn-primary">
            Retour à l’accueil
          </Link>
        </div>
      </section>
    </main>
  );
};
