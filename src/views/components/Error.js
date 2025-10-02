// src/pages/Error.jsx
import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/pages/error.css";

export const Error = ({ errorId }) => {
  const navigate = useNavigate();

  const id = useMemo(
    () =>
      errorId ||
      `${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random()
        .toString(36)
        .slice(2, 6)
        .toUpperCase()}`,
    [errorId]
  );

  const SUPPORT_EMAIL = "support@minshp.com";
  const mailHref = useMemo(() => {
    const subject = `Probleme de passage de commande`;
    const body = `Bonjour,\n\nJ'ai rencontré un problème technique lors de ma commande.\n\nMon numéro de client est : \nMon mail est :\n\nMerci de votre aide.`;
    const params = new URLSearchParams({ subject, body });
    return `mailto:${SUPPORT_EMAIL}?${params.toString()}`;
  }, [id]);

  return (
    <div className="error-page">
      <div className="error-card" role="alert" aria-live="polite">
        <div className="error-badge" aria-hidden="true">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.9)" strokeWidth="2" />
            <path d="M9 9l6 6M15 9l-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <h1 className="error-title">Un problème technique est survenu</h1>

        <p className="error-text">
          Notre système n’a pas pu finaliser l’opération. <br />
          <b>Vous ne serez pas débité.</b> Si un débit apparaît malgré tout,
          <b> il sera automatiquement remboursé sous 48&nbsp;heures</b>.
        </p>

        <p className="error-note">
          Vous pouvez réessayer plus tard, consulter vos commandes ou revenir à l’accueil.
        </p>

        <div className="error-actions">
          <button className="error-btn error-btn-light" onClick={() => navigate(-1)}>
            ← Retour
          </button>
          <Link to="/account" className="error-btn error-btn-light">
            Voir mes commandes
          </Link>
          <Link to="/" className="error-btn error-btn-primary">
            Revenir à l’accueil
          </Link>
        </div>

        <p className="error-meta">
          Besoin d’aide ?{" "}
          <a
            href={mailHref}
            className="error-link"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = mailHref;
            }}
          >
            Contactez le support
          </a>
          {/* • ID d’erreur : <code>{id}</code> */}
        </p>
      </div>
    </div>
  );
};
