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

/** Modal succès basée sur tes classes .gmodal-* (backdrop + carte centrée) */
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
  const [phone, setPhone] = useState(currentCustomer?.phoneNumber ?? "");
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
    if (currentCustomer?.phoneNumber != null) setPhone(currentCustomer.phoneNumber);
    if (currentCustomer?.firstName != null) setFirstName(currentCustomer.firstName);
    if (currentCustomer?.lastName != null) setLastName(currentCustomer.lastName);
    if (currentCustomer?.pseudo != null) setPseudo(currentCustomer.pseudo);
    if (currentCustomer?.civilite != null) setCivility(currentCustomer.civilite);
  }, [currentCustomer]);

  // Validations
  const profileValid = useMemo(
    () =>
      firstName.trim().length > 0 &&
      lastName.trim().length > 0 &&
      pseudo.trim().length > 0 &&
      (birthdate ? !Number.isNaN(new Date(birthdate).getTime()) : true) &&
      phone.trim().length > 0,
    [firstName, lastName, pseudo, birthdate, phone]
  );

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
    const payload = {
      Id: currentCustomer?.idAspNetUser ?? user.id, // fallback par sécurité
      Civility: civility,
      FirstName: firstName.trim(),
      LastName: lastName.trim(),
      Email: email,
      BirthDate: birthdate || null,
      Pseudo: pseudo.trim(),
      Actif: true,
      Phone: phone.trim(),
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
          <input
            className="form-control"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Votre numéro de téléphone"
            required
          />
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
