// src/pages/admin/CustomerAdmin.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import "../../App.css";
import { getUserRoles } from "../../lib/utils/jwt";

import { getCustomerRequest, deleteCustomerRequest } from "../../lib/actions/CustomerActions";
import { updateUserRequest, registerRequest, addRoleRequest, removeRoleRequest } from "../../lib/actions/AccountActions";

// helper: pause async
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// ajuste si besoin
const ROLE_CHANGE_DELAY_MS = 1000;

export const CustomerAdmin = () => {
  const dispatch = useDispatch();
  const customers = useSelector((s) => s?.customers?.customers) || [];

  // ⚠️ Désormais une liste de chaînes pour eviter d'exposer les rôles dans le network
  const roles = ["Admin", "Manager", "Customer"];

  const token = localStorage.getItem("access_token");

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // ---- Modal rôles ----
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleUser, setRoleUser] = useState(null);               // customer ciblé
  const [selectedRoleName, setSelectedRoleName] = useState(""); // radio sélectionnée

  const [formData, setFormData] = useState({
    id: null,
    aspId: null,
    civility: "M",
    lastName: "",
    firstName: "",
    phone: "",
    email: "",
    birthDate: "",
    pseudo: "",
    actif: true,
  });

  useEffect(() => { dispatch(getCustomerRequest()); }, [dispatch]);

  useEffect(() => {
    document.body.classList.toggle("no-scroll", showModal || showRoleModal);
    return () => document.body.classList.remove("no-scroll");
  }, [showModal, showRoleModal]);

  const toForm = (c) => ({
    id: c?.id ?? c?.customerId ?? c?.Id ?? null,
    aspId: c?.idAspNetUser ?? c?.IdAspNetUser ?? null,
    civility: c?.civility ?? c?.civilite ?? "M",
    lastName: c?.lastName ?? c?.nom ?? "",
    firstName: c?.firstName ?? c?.prenom ?? "",
    phone: c?.phone ?? c?.phoneNumber ?? "",
    email: c?.email ?? "",
    birthDate: (c?.birthDate ?? c?.dateOfBirth ?? c?.naissance ?? "").slice(0, 10),
    pseudo: c?.pseudo ?? "",
    actif: !!c?.actif,
  });

  const resetForm = () =>
    setFormData({
      id: null,
      aspId: null,
      civility: "M",
      lastName: "",
      firstName: "",
      phone: "",
      email: "",
      birthDate: "",
      pseudo: "",
      actif: true,
    });

  const openAdd = () => { setIsEditing(false); resetForm(); setShowModal(true); };
  const openEdit = (c) => { setIsEditing(true); setFormData(toForm(c)); setShowModal(true); };
  const closeModal = () => setShowModal(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      Id: formData.aspId,
      Civility: formData.civility,
      LastName: formData.lastName,
      FirstName: formData.firstName,
      Phone: formData.phone,
      Email: formData.email,
      BirthDate: formData.birthDate || null,
      Pseudo: formData.pseudo,
      Actif: formData.actif,
    };
    if (isEditing) {
      await dispatch(updateUserRequest(payload));
    } else {
      await dispatch(registerRequest(payload));
    }
    await dispatch(getCustomerRequest());
    closeModal();
  };

  const handleDelete = async (c) => {
    if (!c) return;
    if (window.confirm(`Supprimer le client "${c?.lastName ?? ""} ${c?.firstName ?? ""}" ?`)) {
      await dispatch(deleteCustomerRequest(c?.id ?? c?.customerId ?? c?.Id));
      await dispatch(getCustomerRequest());
    }
  };

  // ---------- RÔLES ----------
  // supporte both: tableau de strings ou d'objets { name }
  const getUserRoleNames = (customer) =>
    Array.isArray(customer?.roles)
      ? customer.roles.map((r) => (typeof r === "string" ? r : r?.name)).filter(Boolean)
      : [];

  const primaryRoleOf = (customer) => getUserRoleNames(customer)[0] || ""; // on considère un rôle max affiché

  const openRoleModal = (customer) => {
    setRoleUser(customer);
    const current = primaryRoleOf(customer);
    // présélection : rôle actuel s'il existe, sinon 1er de la liste si dispo
    setSelectedRoleName(current || roles[0] || "");
    setShowRoleModal(true);
  };

  const closeRoleModal = () => {
    setShowRoleModal(false);
    setRoleUser(null);
    setSelectedRoleName("");
  };

  const canRemove = (customer) => getUserRoleNames(customer).length > 0;
  const hasRolesDefined = Array.isArray(roles) && roles.length > 0;

  const getAspId = (u) => u?.idAspNetUser ?? u?.IdAspNetUser ?? u?.aspId ?? null;

  const onAddRole = async () => {
    if (!roleUser || !selectedRoleName) return;
    const aspId = getAspId(roleUser);
    if (!aspId) { alert("IdAspNetUser manquant pour cet utilisateur."); return; }

    await dispatch(addRoleRequest({ UserId: String(aspId), Role: String(selectedRoleName) }));
    await dispatch(getCustomerRequest());
    closeRoleModal();
  };

  const onRemoveRole = async () => {
    if (!roleUser || !selectedRoleName) return;
    const aspId = getAspId(roleUser);
    if (!aspId) { alert("IdAspNetUser manquant pour cet utilisateur."); return; }

    await dispatch(removeRoleRequest({ UserId: String(aspId), Role: String(selectedRoleName) }));
    await dispatch(getCustomerRequest());
    closeRoleModal();
  };

  // Modifier le rôle : supprime l'ancien puis ajoute le nouveau avec une pause
  const onChangeRole = async () => {
    if (!roleUser || !selectedRoleName) return;

    const aspId = getAspId(roleUser);
    if (!aspId) { alert("IdAspNetUser manquant pour cet utilisateur."); return; }

    const current = primaryRoleOf(roleUser) || "";

    // Si aucun rôle actuel → assignation simple
    if (!current) {
      await onAddRole();
      return;
    }

    // Si le rôle choisi est identique → rien à faire
    if (current === selectedRoleName) {
      closeRoleModal();
      return;
    }

    // 1) Supprimer l'ancien rôle
    await dispatch(removeRoleRequest({ UserId: String(aspId), Role: String(current) }));

    // petite pause pour laisser le backend persister
    await sleep(ROLE_CHANGE_DELAY_MS);

    // 2) Ajouter le nouveau rôle
    await dispatch(addRoleRequest({ UserId: String(aspId), Role: String(selectedRoleName) }));

    await dispatch(getCustomerRequest());
    closeRoleModal();
  };

  // ---------- TABLE ----------
  const rows = useMemo(() => {
    const list = Array.isArray(customers) ? customers : [];
    return [...list].sort((a, b) => {
      const an = (a?.clientNumber ?? a?.customerNo ?? a?.customerNumber ?? a?.number ?? "").toString();
      const bn = (b?.clientNumber ?? b?.customerNo ?? b?.customerNumber ?? b?.number ?? "").toString();
      if (an !== bn) return an.localeCompare(bn);
      const al = (a?.lastName ?? a?.nom ?? "").toString();
      const bl = (b?.lastName ?? b?.nom ?? "").toString();
      return al.localeCompare(bl);
    });
  }, [customers]);

  const fmtDate = (v) => {
    if (!v) return "—";
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("fr-FR");
  };

  const getRoleBadge = (customer) => primaryRoleOf(customer) || "NONE";

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Clients</h2>
        <button type="button" className="btn btn-success mt-5" onClick={openAdd}>
          Ajouter un client
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>N° client</th>
              <th>Civilité</th>
              <th>Nom</th>
              <th>Prénom</th>
              <th>N°</th>
              <th>Email</th>
              <th>Date de naissance</th>
              <th>Pseudo</th>
              <th>Role</th>
              <th>Actif</th>
              <th style={{ width: 180 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center">Aucun client.</td>
              </tr>
            ) : (
              rows.map((c) => (
                <tr key={c?.id ?? c?.customerId ?? c?.Id}>
                  <td>{c?.clientNumber ?? c?.customerNo ?? c?.customerNumber ?? c?.number ?? "—"}</td>
                  <td>{c?.civility ?? c?.civilite ?? c?.gender ?? "—"}</td>
                  <td>{c?.lastName ?? c?.nom ?? "—"}</td>
                  <td>{c?.firstName ?? c?.prenom ?? "—"}</td>
                  <td>{c?.phone ?? c?.phoneNumber ?? c?.tel ?? "—"}</td>
                  <td>{c?.email ?? "—"}</td>
                  <td>{fmtDate(c?.birthDate ?? c?.dateOfBirth ?? c?.naissance)}</td>
                  <td>{c?.pseudo ?? c?.username ?? "—"}</td>
                  <td>{getRoleBadge(c)}</td>
                  <td>{c?.actif ? "Oui" : "Non"}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-warning" onClick={() => openEdit(c)} title="Modifier">
                        <i className="bi bi-pencil" />
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c)} title="Supprimer">
                        <i className="bi bi-trash" />
                      </button>
                      <button className="btn btn-sm btn-secondary" onClick={() => openRoleModal(c)} title="Droits">
                        <i className="bi bi-eye" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* -------- MODALE ADD/EDIT -------- */}
      {showModal && (
        <div
          className="admin-modal-backdrop"
          role="presentation"
          onClick={closeModal}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 2000 }}
        >
          <div
            className="admin-modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-modal-title"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "min(720px,95vw)", background: "#fff", borderRadius: 12 }}
          >
            <h3 id="customer-modal-title" className="mb-3">
              {isEditing ? "Modifier le client" : "Ajouter un client"}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-sm-4">
                  <label className="form-label">Civilité</label>
                  <select className="form-select" name="civility" value={formData.civility} onChange={handleChange}>
                    <option value="M">M.</option>
                    <option value="Mme">Mme</option>
                  </select>
                </div>

                <div className="col-sm-4">
                  <label className="form-label">Nom</label>
                  <input type="text" className="form-control" name="lastName" value={formData.lastName} onChange={handleChange} required />
                </div>

                <div className="col-sm-4">
                  <label className="form-label">Prénom</label>
                  <input type="text" className="form-control" name="firstName" value={formData.firstName} onChange={handleChange} required />
                </div>

                <div className="col-sm-6">
                  <label className="form-label">N° (téléphone)</label>
                  <input type="tel" className="form-control" name="phone" value={formData.phone} onChange={handleChange} />
                </div>

                <div className="col-sm-6">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
                </div>

                <div className="col-sm-6">
                  <label className="form-label">Date de naissance</label>
                  <input type="date" className="form-control" name="birthDate" value={formData.birthDate} onChange={handleChange} />
                </div>

                <div className="col-sm-6">
                  <label className="form-label">Pseudo</label>
                  <input type="text" className="form-control" name="pseudo" value={formData.pseudo} onChange={handleChange} />
                </div>

                <div className="col-sm-6 d-flex align-items-center">
                  <div className="form-check mt-4">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="cust-active"
                      name="actif"
                      checked={!!formData.actif}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="cust-active">Actif</label>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end mt-3">
                <button type="button" className="btn btn-secondary me-2" onClick={closeModal}>Annuler</button>
                <button type="submit" className="btn btn-dark">{isEditing ? "Modifier" : "Ajouter"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------- MODALE RÔLES -------- */}
      {showRoleModal && (
        <div
          className="admin-modal-backdrop"
          role="presentation"
          onClick={closeRoleModal}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 2100 }}
        >
          <div
            className="admin-modal-panel"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "min(560px,92vw)", background: "#fff", borderRadius: 12 }}
          >
            <h3 className="mb-2">Droits / Rôles</h3>
            <div className="text-muted mb-3" style={{ fontSize: 14 }}>
              Utilisateur : <strong>{roleUser?.email ?? `${roleUser?.lastName ?? ""} ${roleUser?.firstName ?? ""}`}</strong>
            </div>

            {!hasRolesDefined && (
              <div className="alert alert-warning">Aucun rôle disponible.</div>
            )}

            {hasRolesDefined && (
              <>
                <div className="mb-3" role="radiogroup" aria-label="Rôles">
                  {roles.map((r) => (
                    <label key={r} className="d-flex align-items-center mb-2" style={{ gap: 8, cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="role-radio"
                        className="form-check-input"
                        checked={selectedRoleName === r}
                        onChange={() => setSelectedRoleName(r)}
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button className="btn btn-secondary" onClick={closeRoleModal}>Fermer</button>

                  {canRemove(roleUser) ? (
                    <button
                      className="btn btn-primary"
                      onClick={onChangeRole}
                      disabled={!selectedRoleName || selectedRoleName === primaryRoleOf(roleUser)}
                    >
                      Modifier le rôle
                    </button>
                  ) : (
                    <button className="btn btn-primary" onClick={onAddRole} disabled={!selectedRoleName}>
                      Attribuer le rôle
                    </button>
                  )}
                </div>

                {/* Indication du rôle actuel */}
                <div className="mt-3 text-muted" style={{ fontSize: 13 }}>
                  Rôle actuel : <strong>{primaryRoleOf(roleUser) || "Aucun"}</strong>
                </div>

                {canRemove(roleUser) && selectedRoleName === primaryRoleOf(roleUser) && (
                  <div className="mt-2 text-muted" style={{ fontSize: 12 }}>
                    Sélectionnez un rôle différent pour modifier.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
