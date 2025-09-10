// src/pages/account/UserInformation.jsx
import React, { useMemo, useState, useEffect } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useSelector, useDispatch } from "react-redux";
import {
  updateUserRequest,
  updateUserPasswordRequest,
  updateUserReset,
  updateUserPasswordReset,
} from "../../../lib/actions/AccountActions";

/* =================== Phone helpers (tri par label) =================== */
// Liste brute
const PHONE_COUNTRIES_BASE = [
  { iso: "FR", label: "France",        dial: "+33",  trunk: "0" },
  { iso: "BE", label: "Belgique",      dial: "+32",  trunk: "0" },
  { iso: "ES", label: "Espagne",       dial: "+34",  trunk: "0" },
  { iso: "IT", label: "Italie",        dial: "+39",  trunk: "0" },
  { iso: "DE", label: "Allemagne",     dial: "+49",  trunk: "0" },
  { iso: "IE", label: "Irlande",       dial: "+353", trunk: "0" },
  { iso: "US", label: "États-Unis",    dial: "+1",   trunk: ""  },
  { iso: "ML", label: "Mali",          dial: "+223", trunk: ""  },
  { iso: "SN", label: "Sénégal",       dial: "+221", trunk: ""  },
  { iso: "MA", label: "Maroc",         dial: "+212", trunk: "0" },
  { iso: "DZ", label: "Algérie",       dial: "+213", trunk: "0" },
  { iso: "AE", label: "Dubaï (EAU)",   dial: "+971", trunk: "0" },
];

// Tri alphabétique par label (locale FR)
const PHONE_COUNTRIES = [...PHONE_COUNTRIES_BASE].sort((a, b) =>
  a.label.localeCompare(b.label, "fr", { sensitivity: "base" })
);

// ⚠️ Garder France en valeur par défaut même si la liste est triée
const DEFAULT_DIAL = "+33";
const byDial = Object.fromEntries(PHONE_COUNTRIES.map((c) => [c.dial, c]));
const cleanDigits = (s) => String(s || "").replace(/[^\d]/g, "");

/** Assemble en E.164: dial + local (retire la tête nationale "trunk" si présente) */
function composeE164(dial, local) {
  const meta = byDial[dial] || { trunk: "" };
  let loc = cleanDigits(local);
  if (meta.trunk && loc.startsWith(meta.trunk)) {
    loc = loc.slice(meta.trunk.length);
  }
  return `${dial}${loc}`;
}

/** Décompose un E.164 vers { dial, local } pour l’UI (réinjecte le trunk s’il existe) */
function splitE164(phone) {
  const raw = String(phone || "");
  const match = PHONE_COUNTRIES
    .sort((a, b) => b.dial.length - a.dial.length)
    .find((c) => raw.startsWith(c.dial));
  if (!match) return { dial: DEFAULT_DIAL, local: cleanDigits(raw) };

  let rest = raw.slice(match.dial.length);
  if (match.trunk && rest && !rest.startsWith(match.trunk)) {
    rest = `${match.trunk}${rest}`;
  }
  return { dial: match.dial, local: cleanDigits(rest) };
}

/* =================== UI: Modal générique succès =================== */
function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="gmodal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="gmodal-panel is-success" onClick={(e) => e.stopPropagation()}>
        <div className="gmodal-icon">
          <i className="bi bi-check-circle gmodal-icon--success" aria-hidden="true" />
        </div>
        <h4 className="gmodal-title">{title}</h4>
        <div className="gmodal-message">{children}</div>
        <div className="gmodal-actions">
          <button className="gbtn gbtn--primary" onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  );
}

/* =================== UI: Phone Input =================== */
function PhoneInput({ dial, local, onChange }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 8 }}>
      <select
        className="form-control"
        value={dial || DEFAULT_DIAL}
        onChange={(e) => onChange({ dial: e.target.value, local })}
      >
        {PHONE_COUNTRIES.map((c) => (
          <option key={c.iso} value={c.dial}>
            {c.label} ({c.dial})
          </option>
        ))}
      </select>
      <input
        className="form-control"
        placeholder="n° national (ex: 06 24 95 75 58)"
        value={local || ""}
        onChange={(e) => onChange({ dial: dial || DEFAULT_DIAL, local: cleanDigits(e.target.value) })}
        inputMode="tel"
        autoComplete="tel-national"
      />
    </div>
  );
}

/* =================== Page =================== */
export const UserInformation = ({ user = {} }) => {
  const dispatch = useDispatch();

  // ---- Redux: flags de succès/erreur pour afficher popups + messages
  const {
    successUpdate,
    successUpdatePassword,
    errorUpdate,
    errorUpdatePassword,
  } = useSelector((s) => s.account);

  // ---- Client courant
  const customers = useSelector((s) => s?.customers?.customers) || [];
  const currentCustomer = customers.find((c) => c.idAspNetUser === user.id);

  // ---- États du formulaire "infos perso"
  const rawBirthDate = currentCustomer?.birthDate ?? null;
  const initialBirth = rawBirthDate ? rawBirthDate.slice(0, 10) : "";

  const [civility, setCivility] = useState(currentCustomer?.civilite ?? "Mme");
  const [firstName, setFirstName] = useState(currentCustomer?.firstName ?? "");
  const [lastName, setLastName] = useState(currentCustomer?.lastName ?? "");
  const [email] = useState(currentCustomer?.email ?? "");
  const [birthdate, setBirthdate] = useState(initialBirth);
  const [pseudo, setPseudo] = useState(currentCustomer?.pseudo ?? "");

  // Téléphone (décomposé en {dial, local})
  const initPhone = currentCustomer?.phoneNumber ?? "";
  const initSplit = splitE164(initPhone);
  const [phoneDial, setPhoneDial] = useState(initSplit.dial);
  const [phoneLocal, setPhoneLocal] = useState(initSplit.local);

  const [saving, setSaving] = useState(false);

  // ---- États du formulaire "mot de passe"
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changing, setChanging] = useState(false);

  // ---- Popups
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);

  // Si currentCustomer arrive après le premier rendu, re-synchroniser les champs
  useEffect(() => {
    const d = currentCustomer?.birthDate;
    setBirthdate(d ? d.slice(0, 10) : "");

    if (currentCustomer) {
      if (currentCustomer.firstName != null) setFirstName(currentCustomer.firstName);
      if (currentCustomer.lastName != null) setLastName(currentCustomer.lastName);
      if (currentCustomer.pseudo != null) setPseudo(currentCustomer.pseudo);
      if (currentCustomer.civilite != null) setCivility(currentCustomer.civilite);

      // 🔁 resync phone {dial, local} depuis currentCustomer.phoneNumber
      const p = currentCustomer.phoneNumber ?? "";
      const { dial, local } = splitE164(p);
      setPhoneDial(dial);
      setPhoneLocal(local);
    }
  }, [currentCustomer]);

  // Validations
  const profileValid = useMemo(() => {
    const hasNames = firstName.trim().length > 0 && lastName.trim().length > 0;
    const hasPseudo = pseudo.trim().length > 0;
    const birthOk = birthdate ? !Number.isNaN(new Date(birthdate).getTime()) : true;
    const phoneOk = cleanDigits(phoneLocal).length > 0; // simple check
    return hasNames && hasPseudo && birthOk && phoneOk;
  }, [firstName, lastName, pseudo, birthdate, phoneLocal]);

  const passwordValid = useMemo(
    () => currentPassword.length >= 1 && newPassword.length >= 6,
    [currentPassword, newPassword]
  );

  // Ouvrir les popups dès qu'un succès est détecté
  useEffect(() => {
    if (successUpdate) {
      setOpenProfileModal(true);
      setSaving(false);
    }
  }, [successUpdate]);

  useEffect(() => {
    if (successUpdatePassword) {
      setOpenPasswordModal(true);
      setChanging(false);
    }
  }, [successUpdatePassword]);

  // Fermer + reset flags
  const closeProfileModal = () => {
    setOpenProfileModal(false);
    dispatch(updateUserReset());
  };
  const closePasswordModal = () => {
    setOpenPasswordModal(false);
    dispatch(updateUserPasswordReset());
  };

  // Submit "infos perso"
  const saveProfile = async (e) => {
    e.preventDefault();
    if (!profileValid) return;

    // ⚙️ Compose E.164 propre: ex FR 06… -> +336…
    const phoneE164 = composeE164(phoneDial || DEFAULT_DIAL, phoneLocal || "");

    const payload = {
      Id: currentCustomer?.idAspNetUser ?? user.id, // fallback par sécurité
      Civility: civility,
      FirstName: firstName.trim(),
      LastName: lastName.trim(),
      Email: email,
      BirthDate: birthdate || null,
      Pseudo: pseudo.trim(),
      Actif: true,
      Phone: phoneE164,
    };
    setSaving(true);
    await dispatch(updateUserRequest(payload));
  };

  // Submit "mot de passe"
  const changePassword = async (e) => {
    e.preventDefault();
    if (!passwordValid) return;
    const payload = {
      Id: currentCustomer?.idAspNetUser ?? user.id,
      CurrentPassword: currentPassword,
      NewPassword: newPassword,
    };
    setChanging(true);
    await dispatch(updateUserPasswordRequest(payload));
    setCurrentPassword("");
    setNewPassword("");
  };

  return (
    <div
      className="account-placeholder"
      style={{ padding: 0, background: "transparent", boxShadow: "none" }}
    >
      {/* ====== Informations personnelles ====== */}
      <h2 className="orders-title" style={{ marginBottom: 6 }}>
        Informations personnelles
      </h2>
      <small style={{ color: "#6b7280", display: "block", marginBottom: 12 }}>
        <span style={{ color: "#ef4444" }}>*</span> Champs obligatoires
      </small>

      <form
        onSubmit={saveProfile}
        className="grid-2 gap-12"
        aria-label="Formulaire informations personnelles"
      >
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

          <span>
            Prénom <span style={{ color: "#ef4444" }}>*</span>
          </span>
          <input
            className="form-control"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Votre prénom"
            required
          />

          <span>
            Nom <span style={{ color: "#ef4444" }}>*</span>
          </span>
          <input
            className="form-control"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Votre nom"
            required
          />

          <span>
            Téléphone <span style={{ color: "#ef4444" }}>*</span>
          </span>
          <PhoneInput
            dial={phoneDial}
            local={phoneLocal}
            onChange={({ dial, local }) => {
              setPhoneDial(dial);
              setPhoneLocal(local);
            }}
          />
          <small style={{ color: "#6b7280" }}>
            Exemple FR : tapez <b>06…</b> — sera enregistré <b>+336…</b>
          </small>
        </div>

        {/* Colonne droite */}
        <div className="form-col">
          <span>
            Email <span style={{ color: "#ef4444" }}>*</span>
          </span>
          <input className="form-control" value={email} readOnly aria-readonly="true" />

          <span>
            Date de naissance <span style={{ color: "#ef4444" }}>*</span>
          </span>
          <input
            type="date"
            className="form-control"
            value={birthdate || ""}
            onChange={(e) => setBirthdate(e.target.value)}
            required
          />

          <span>Pseudo</span>
          <input
            className="form-control"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            placeholder="Votre pseudo"
          />
        </div>

        <div style={{ gridColumn: "1 / -1", marginTop: 6 }}>
          <button type="submit" className="gbtn gbtn--primary" disabled={!profileValid || saving}>
            {saving ? "Enregistrement…" : "Valider"}
          </button>
          {/* Erreur MAJ profil */}
          {errorUpdate && (
            <p style={{ color: "#dc2626", fontWeight: 600, marginTop: 8 }}>
              ⚠️ {typeof errorUpdate === "string" ? errorUpdate : "Les informations n’ont pas pu être mises à jour."}
            </p>
          )}
        </div>
      </form>

      <p style={{ color: "#6b7280", fontSize: ".9rem", marginTop: 10 }}>
        Les informations recueillies servent à la gestion de votre compte client et peuvent être utilisées
        pour la relation client-prospect.{" "}
        <a href="#" className="auth-link">En savoir plus sur la gestion des vos données et vos droits</a>.
      </p>

      {/* ====== Changer de mot de passe ====== */}
      <h3 className="orders-title" style={{ marginTop: 26, marginBottom: 10 }}>
        Changer de mot de passe
      </h3>

      <form onSubmit={changePassword} className="grid-2 gap-12" aria-label="Formulaire changement mot de passe">
        <div className="form-col">
          <span>
            Mot de passe actuel <span style={{ color: "#ef4444" }}>*</span>
          </span>
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
          <span>
            Nouveau mot de passe <span style={{ color: "#ef4444" }}>*</span>
          </span>
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
          {/* Erreur MAJ mot de passe */}
          {errorUpdatePassword && (
            <p style={{ color: "#dc2626", fontWeight: 600, marginTop: 8 }}>
              ⚠️ {typeof errorUpdatePassword === "string"
                ? errorUpdatePassword
                : "Le mot de passe n’a pas pu être mis à jour."}
            </p>
          )}
        </div>
      </form>

      {/* ======= POPUPS ======= */}
      <Modal open={openProfileModal} title="Informations mises à jour" onClose={closeProfileModal}>
        Vos informations personnelles ont été mises à jour avec succès.
      </Modal>

      <Modal open={openPasswordModal} title="Mot de passe mis à jour" onClose={closePasswordModal}>
        Votre mot de passe a été mis à jour avec succès.
      </Modal>
    </div>
  );
};
