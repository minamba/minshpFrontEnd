// src/pages/account/ResetPassword.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../../App.css";
import axios from "axios";

// ---- Config API ----
// const API       = import.meta.env.VITE_API_BASE ?? "https://localhost:7183";
//const RESET_URL = `https://localhost:7183/account/reset-password`;
const RESET_URL = `https://auth.minshp.com/account/reset-password`;

// petite aide pour masquer l'email
const maskEmail = (e) => {
  if (!e) return "";
  const [user, domain] = e.split("@");
  const u = user?.length > 2 ? user[0] + "•".repeat(user.length - 2) + user.slice(-1) : "••";
  return `${u}@${domain ?? ""}`;
};

// score simple (0..4)
const scorePassword = (pwd) => {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) s++;
  if (/\d/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
};

const strengthLabel = (s) => ["Très faible", "Faible", "Correct", "Bon", "Excellent"][s];

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const token  = params.get("token") || "";
  const email  = params.get("email") || "";

  const [pwd, setPwd]   = useState("");
  const [pwd2, setPwd2] = useState("");
  const [capsOn, setCapsOn] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const strength = useMemo(() => scorePassword(pwd), [pwd]);
  const canSubmit = token && email && pwd.length >= 8 && pwd === pwd2 && strength >= 3;

  // si lien incomplet, message d’erreur direct
  useEffect(() => {
    if (!email || !token) {
      setMsg({
        type: "danger",
        text: "Lien invalide ou incomplet. Veuillez relancer une demande de réinitialisation."
      });
    }
  }, [email, token]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setSubmitting(true);
      setMsg({ type: "", text: "" });

      const r = await fetch(RESET_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // IMPORTANT: on envoie le token tel quel (Base64Url décodé côté serveur)
        body: JSON.stringify({ email, token, newPassword: pwd }),
      });

      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setMsg({
          type: "danger",
          text: j.error || (j.errors && j.errors.join(", ")) || "Le lien est invalide ou expiré.",
        });
        return;
      }

      setMsg({
        type: "success",
        text: "Votre mot de passe a été mis à jour. Redirection vers la connexion…",
      });
      setTimeout(() => navigate("/login"), 1200);
    } catch {
      setMsg({
        type: "danger",
        text: "Erreur réseau. Réessayez dans quelques instants.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // UI helpers
  const pill = (color) => ({
    fontSize: 12,
    background: color === "green" ? "#e8faf0" : color === "amber" ? "#fff7e6" : "#fee2e2",
    color: color === "green" ? "#065f46" : color === "amber" ? "#92400e" : "#991b1b",
    padding: "4px 10px",
    borderRadius: 999,
    fontWeight: 700,
  });
  const strengthBar = { height: 8, borderRadius: 6, background: "#eee", overflow: "hidden" };
  const strengthFill = (s) => ({
    height: "100%",
    width: `${(s / 4) * 100}%`,
    background: s >= 4 ? "#16a34a" : s === 3 ? "#22c55e" : s === 2 ? "#f59e0b" : "#ef4444",
    transition: "width .25s ease",
  });

  return (
    <div
      className="container"
      style={{
        minHeight: "calc(100vh - 120px)",
        display: "grid",
        placeItems: "center",
        padding: "40px 16px",
      }}
    >
      <div
        className="category-card"
        style={{
          width: "min(520px, 94vw)",
          borderRadius: 16,
          padding: 20,
          boxShadow: "0 16px 40px rgba(0,0,0,.07)",
          background: "#fff",
        }}
      >
        <div style={{ display: "grid", gap: 6, marginBottom: 10 }}>
          <h1 className="section-title" style={{ margin: 0, textAlign: "left" }}>
            Réinitialiser votre mot de passe
          </h1>
          <p style={{ color: "#6b7280", margin: 0 }}>
            Choisissez un nouveau mot de passe pour votre compte.
          </p>
        </div>

        {msg.text && (
          <div className={`alert alert-${msg.type}`} role="alert" style={{ marginBottom: 12 }}>
            {msg.text}
          </div>
        )}

        {/* Email lié au lien */}
        <div style={{ ...pill("amber"), display: "inline-flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
          <i className="bi bi-envelope-open" />
          <span>{maskEmail(email) || "email introuvable"}</span>
        </div>

        <form onSubmit={onSubmit} noValidate>
          {/* Nouveau mot de passe */}
          <PasswordField
            label="Nouveau mot de passe"
            value={pwd}
            onChange={setPwd}
            onCaps={(v) => setCapsOn(v)}
          />

          {/* Indicateur de robustesse */}
          <div style={{ display: "grid", gap: 6, marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>
              Robustesse : {strengthLabel(strength)}
            </div>
            <div style={strengthBar}>
              <div style={strengthFill(strength)} />
            </div>
          </div>

          <ul style={{ marginTop: 0, color: "#6b7280", fontSize: ".92rem" }}>
            <li>Au moins 8 caractères</li>
            <li>Majuscules et minuscules</li>
            <li>Au moins un chiffre</li>
            <li>Au moins un symbole</li>
          </ul>

          {/* Confirmation */}
          <PasswordField
            label="Confirmer le nouveau mot de passe"
            value={pwd2}
            onChange={setPwd2}
          />
          {pwd2 && pwd !== pwd2 && (
            <small className="text-danger">Les mots de passe ne correspondent pas.</small>
          )}
          {capsOn && (
            <div style={{ ...pill("amber"), display: "inline-flex", gap: 8, alignItems: "center", marginTop: 8 }}>
              <i className="bi bi-exclamation-triangle" />
              <span>Verr. Maj activée</span>
            </div>
          )}

          <button
            className="btn btn-dark w-100 mt-3"
            type="submit"
            disabled={!canSubmit || submitting}
          >
            {submitting ? "Mise à jour…" : "Mettre à jour mon mot de passe"}
          </button>

          <button
            type="button"
            className="btn btn-light w-100 mt-2"
            onClick={() => navigate("/login")}
          >
            <i className="bi bi-box-arrow-in-right me-1" />
            Aller à la connexion
          </button>
        </form>
      </div>
    </div>
  );
}

/* --------- Champ mot de passe réutilisable --------- */
function PasswordField({ label, value, onChange, onCaps }) {
  const [show, setShow] = useState(false);

  return (
    <label style={{ display: "grid", gap: 6, marginBottom: 12 }}>
      <span style={{ fontWeight: 700 }}>{label}</span>
      <div style={{ position: "relative" }}>
        <input
          className="form-control"
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyUp={(e) => onCaps?.(e.getModifierState && e.getModifierState("CapsLock"))}
          autoComplete="new-password"
        />
        <button
          type="button"
          aria-label={show ? "Masquer" : "Afficher"}
          onClick={() => setShow((s) => !s)}
          className="btn"
          style={{
            position: "absolute",
            right: 6,
            top: "50%",
            transform: "translateY(-50%)",
            background: "transparent",
            border: 0,
            color: "#374151",
          }}
        >
          <i className={`bi ${show ? "bi-eye-slash" : "bi-eye"}`} />
        </button>
      </div>
    </label>
  );
}
