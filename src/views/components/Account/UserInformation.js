// src/pages/account/UserInformation.jsx
import React, { useMemo, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

/**
 * Affiche et édite les informations personnelles + changement de mot de passe.
 * Props:
 *  - user: { civility: 'M'|'Mme', firstName, lastName, email, birthdate (YYYY-MM-DD), pseudo }
 *  - onSaveProfile: (payload) => void | Promise<void>
 *  - onChangePassword: ({ currentPassword, newPassword }) => void | Promise<void>
 */
export const UserInformation = ({
  user = {},
  onSaveProfile,
  onChangePassword,
}) => {
  // --- FORM "infos perso" ---
  const [civility, setCivility] = useState(user.civility ?? "M");
  const [firstName, setFirstName] = useState(user.firstName ?? "");
  const [lastName, setLastName] = useState(user.lastName ?? "");
  const [email] = useState(user.email ?? ""); // souvent non modifiable
  const [birthdate, setBirthdate] = useState(user.birthdate ?? "");
  const [pseudo, setPseudo] = useState(user.pseudo ?? "");
  const [saving, setSaving] = useState(false);

  // --- FORM "changement de mot de passe" ---
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changing, setChanging] = useState(false);

  const profileValid = useMemo(
    () =>
      firstName.trim().length > 0 &&
      lastName.trim().length > 0 &&
      pseudo.trim().length > 0 &&
      (birthdate ? !Number.isNaN(new Date(birthdate).getTime()) : true),
    [firstName, lastName, pseudo, birthdate]
  );

  const passwordValid = useMemo(
    () => currentPassword.length >= 1 && newPassword.length >= 6,
    [currentPassword, newPassword]
  );

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!profileValid) return;
    const payload = {
      civility,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email, // gardé pour info
      birthdate: birthdate || null,
      pseudo: pseudo.trim(),
    };
    try {
      setSaving(true);
      if (onSaveProfile) await onSaveProfile(payload);
      else alert("Profil enregistré (démo).");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (!passwordValid) return;
    try {
      setChanging(true);
      if (onChangePassword)
        await onChangePassword({ currentPassword, newPassword });
      else alert("Mot de passe changé (démo).");
      setCurrentPassword("");
      setNewPassword("");
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="account-placeholder" style={{ padding: 0, background: "transparent", boxShadow: "none" }}>
      {/* ====== Informations personnelles ====== */}
      <h2 className="orders-title" style={{ marginBottom: 6 }}>
        Informations personnelles
      </h2>
      <small style={{ color: "#6b7280", display: "block", marginBottom: 12 }}>
        <span style={{ color: "#ef4444" }}>*</span> Champs obligatoires
      </small>

      <form onSubmit={saveProfile} className="grid-2 gap-12" aria-label="Formulaire informations personnelles">
        {/* Colonne gauche */}
        <div className="form-col">
          <span>Civilité</span>
          <div className="radio-row" role="radiogroup" aria-label="Civilité">
            <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <input
                type="radio"
                name="civility"
                value="M"
                checked={civility === "M"}
                onChange={() => setCivility("M")}
              />
              M.
            </label>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <input
                type="radio"
                name="civility"
                value="Mme"
                checked={civility === "Mme"}
                onChange={() => setCivility("Mme")}
              />
              Mme
            </label>
          </div>

          <span>Prénom <span style={{ color: "#ef4444" }}>*</span></span>
          <input
            className="form-control"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Votre prénom"
            required
          />

          <span>Nom <span style={{ color: "#ef4444" }}>*</span></span>
          <input
            className="form-control"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Votre nom"
            required
          />
        </div>

        {/* Colonne droite */}
        <div className="form-col">
          <span>Email <span style={{ color: "#ef4444" }}>*</span></span>
          <input
            className="form-control"
            value={email}
            readOnly
            aria-readonly="true"
          />

          <span>Date de naissance <span style={{ color: "#ef4444" }}>*</span></span>
          <input
            type="date"
            className="form-control"
            value={birthdate || ""}
            onChange={(e) => setBirthdate(e.target.value)}
            required
          />

          <span>Pseudo <span style={{ color: "#ef4444" }}>*</span></span>
          <input
            className="form-control"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            placeholder="Votre pseudo"
            required
          />
        </div>

        <div style={{ gridColumn: "1 / -1", marginTop: 6 }}>
          <button type="submit" className="gbtn gbtn--primary" disabled={!profileValid || saving}>
            {saving ? "Enregistrement…" : "Valider"}
          </button>
        </div>
      </form>

      <p style={{ color: "#6b7280", fontSize: ".9rem", marginTop: 10 }}>
        Les informations recueillies servent à la gestion de votre compte client et peuvent être utilisées
        pour la relation client-prospect. <a href="#" className="auth-link">En savoir plus sur la gestion
        des vos données et vos droits</a>.
      </p>

      {/* ====== Changer de mot de passe ====== */}
      <h3 className="orders-title" style={{ marginTop: 26, marginBottom: 10 }}>
        Changer de mot de passe
      </h3>

      <form onSubmit={changePassword} className="grid-2 gap-12" aria-label="Formulaire changement mot de passe">
        <div className="form-col">
          <span>Mot de passe actuel <span style={{ color: "#ef4444" }}>*</span></span>
          <div style={{ position: "relative" }}>
            <input
              className="form-control"
              type={showCur ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Mot de passe actuel"
              required
            />
            <button
              type="button"
              className="toggle-pass"
              onClick={() => setShowCur((s) => !s)}
              aria-label={showCur ? "Masquer le mot de passe actuel" : "Afficher le mot de passe actuel"}
              style={{ right: 8 }}
            >
              <i className={`bi ${showCur ? "bi-eye-slash" : "bi-eye"}`} />
            </button>
          </div>
        </div>

        <div className="form-col">
          <span>Nouveau mot de passe <span style={{ color: "#ef4444" }}>*</span></span>
          <div style={{ position: "relative" }}>
            <input
              className="form-control"
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nouveau mot de passe (min. 6 caractères)"
              required
            />
            <button
              type="button"
              className="toggle-pass"
              onClick={() => setShowNew((s) => !s)}
              aria-label={showNew ? "Masquer le nouveau mot de passe" : "Afficher le nouveau mot de passe"}
              style={{ right: 8 }}
            >
              <i className={`bi ${showNew ? "bi-eye-slash" : "bi-eye"}`} />
            </button>
          </div>
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <button type="submit" className="gbtn gbtn--primary" disabled={!passwordValid || changing}>
            {changing ? "Validation…" : "Valider"}
          </button>
        </div>
      </form>
    </div>
  );
};
