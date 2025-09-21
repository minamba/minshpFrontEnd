// src/pages/Error.jsx
import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

export const Error = ({ errorId }) => {
  const navigate = useNavigate();

  // 1) Générer/mémoriser l'ID d'erreur une seule fois
  const id = useMemo(
    () =>
      errorId ||
      `${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random()
        .toString(36)
        .slice(2, 6)
        .toUpperCase()}`,
    [errorId]
  );

  // 2) Construire le mailto après que "id" existe
  const SUPPORT_EMAIL = "contact@minshp.com";
  const mailHref = useMemo(() => {
    const subject = `Probleme de passage de commande`;
    const body = `Bonjour,

J'ai rencontré un problème technique lors de ma commande.

Mon numéro de client est : 
Mon mail est :

Merci de votre aide.`;
    const params = new URLSearchParams({ subject, body });
    return `mailto:${SUPPORT_EMAIL}?${params.toString()}`;
  }, [id]);

  const S = {
    page: {
      display: "grid",
      placeItems: "center",
      padding: "clamp(32px, 6vw, 64px) 16px",
      minHeight: "calc(100vh - 100px)",
      background:
        "radial-gradient(1200px 600px at 80% -100px, rgba(239,68,68,.06), transparent), radial-gradient(900px 500px at -10% 120%, rgba(59,130,246,.06), transparent), linear-gradient(180deg,#f8fafc 0%, #ffffff 60%, #f7f9ff 100%)",
    },
    card: {
      width: "min(1100px, 92vw)",
      background: "#fff",
      borderRadius: 16,
      boxShadow: "0 16px 40px rgba(0,0,0,.08)",
      padding: "clamp(24px, 3vw, 48px)",
      textAlign: "center",
    },
    badge: {
      width: 72,
      height: 72,
      borderRadius: 999,
      display: "grid",
      placeItems: "center",
      color: "#fff",
      background: "linear-gradient(135deg, #ef4444, #f97316)",
      boxShadow: "0 12px 24px rgba(239,68,68,.25)",
      margin: "0 auto 12px",
    },
    title: {
      margin: "8px 0",
      fontSize: "clamp(28px, 4vw, 42px)",
      fontWeight: 900,
      letterSpacing: ".01em",
      color: "#111",
    },
    text: {
      maxWidth: 900,
      margin: "0 auto 18px",
      color: "#374151",
      fontSize: "clamp(16px, 1.25vw, 18px)",
      lineHeight: 1.6,
    },
    note: { color: "#6b7280", fontSize: 14, marginTop: 6 },
    actions: {
      display: "flex",
      flexWrap: "wrap",
      gap: 10,
      justifyContent: "center",
      marginTop: 10,
    },
    btnPrimary: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      padding: "12px 18px",
      borderRadius: 12,
      background: "linear-gradient(135deg, #3b82f6, #2563eb)",
      color: "#fff",
      fontWeight: 800,
      textDecoration: "none",
      boxShadow: "0 10px 24px rgba(0,0,0,.08)",
    },
    btnLight: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      padding: "12px 18px",
      borderRadius: 12,
      background: "#f3f4f6",
      color: "#111",
      fontWeight: 800,
      border: 0,
      textDecoration: "none",
    },
    meta: { marginTop: 14, color: "#6b7280", fontSize: 13 },
    link: { color: "#2563eb", fontWeight: 700, textDecoration: "none" },
  };

  return (
    <div style={S.page}>
      <div style={S.card} role="alert" aria-live="polite">
        <div style={S.badge} aria-hidden="true">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.9)" strokeWidth="2" />
            <path d="M9 9l6 6M15 9l-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <h1 style={S.title}>Un problème technique est survenu</h1>

        <p style={S.text}>
          Notre système n’a pas pu finaliser l’opération. <br />
          <b>Vous ne serez pas débité.</b> Si un débit apparaît malgré tout,
          <b> il sera automatiquement remboursé sous 48&nbsp;heures</b>.
        </p>

        <p style={S.note}>
          Vous pouvez réessayer plus tard, consulter vos commandes ou revenir à l’accueil.
        </p>

        <div style={S.actions}>
          <button style={S.btnLight} onClick={() => navigate(-1)}>← Retour</button>
          <Link to="/account" style={S.btnLight}>Voir mes commandes</Link>
          <Link to="/" style={S.btnPrimary}>Revenir à l’accueil</Link>
        </div>

        <p style={S.meta}>
          Besoin d’aide ?{" "}
          <a
            href={mailHref}
            style={S.link}
            onClick={(e) => {
              e.preventDefault();
              window.location.href = mailHref; // force notre mailto
            }}
          >
            Contactez le support
          </a>{" "}
          {/* • ID d’erreur&nbsp;: <code>{id}</code> */}
        </p>
      </div>
    </div>
  );
};
