// src/pages/admin/CustomerAdmin.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import "../../App.css";

import {
  getCustomerRequest,
} from "../../lib/actions/CustomerActions";

import {
  updateUserRequest,     // PUT /account/{id} (IDP) -> propage vers /customer (API)
  registerRequest,       // POST /account/register (IDP) -> crée user + customer
  deleteUserRequest,
} from "../../lib/actions/AccountActions";

export const CustomerAdmin = () => {
  const dispatch = useDispatch();
  const customers = useSelector((s) => s?.customers?.customers) || [];

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    id: null,        // id customer local si besoin
    aspId: null,     // IdAspNetUser (pour l’update IDP)
    civility: "M",   // "M" | "Mme"
    lastName: "",
    firstName: "",
    phone: "",
    email: "",
    birthDate: "",   // "YYYY-MM-DD"
    pseudo: "",
    actif: true,     // ✅ nouveau
  });

  useEffect(() => {
    dispatch(getCustomerRequest());
  }, [dispatch]);

  // Empêche le scroll quand la modale est ouverte
  useEffect(() => {
    document.body.classList.toggle("no-scroll", showModal);
    return () => document.body.classList.remove("no-scroll");
  }, [showModal]);

  // Map d’une ligne vers le formulaire
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
    actif: !!c?.actif, // ✅ map bool
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

  const openAdd = () => {
    setIsEditing(false);
    resetForm();
    setShowModal(true);
  };

  const openEdit = (c) => {
    setIsEditing(true);
    setFormData(toForm(c));
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Payload minimal
    const payload = {
      Id: formData.aspId,                // pour UpdateUser côté IDP
      Civility: formData.civility,
      LastName: formData.lastName,
      FirstName: formData.firstName,
      Phone: formData.phone,
      Email: formData.email,
      BirthDate: formData.birthDate || null,
      Pseudo: formData.pseudo,
      Actif: formData.actif,             // ✅ on envoie Actif
    };

    if (isEditing) {
      await dispatch(updateUserRequest(payload));
    } else {
      // registerRequest doit accepter au minimum Email/Password si tu crées un vrai compte.
      // Ici on part du principe que ton IDP sait créer le customer avec ces champs (adapter si besoin).
      await dispatch(registerRequest(payload));
    }

    await dispatch(getCustomerRequest());
    closeModal();
  };

  const handleDelete = async (c) => {
    if (!c) return;
    if (window.confirm(`Supprimer le client "${c?.lastName ?? ""} ${c?.firstName ?? ""}" ?`)) {
      const id = c?.idAspNetUser ?? c?.Id;
      if (id != null) {
        await dispatch(deleteUserRequest(id));
        await dispatch(getCustomerRequest());
      }
    }
  };

  // Trie simple (par N° client puis Nom)
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
              <th>Actif</th>
              <th style={{ width: 140 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center">Aucun client.</td>
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
                  <td>{c?.actif ? "Oui" : "Non"}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => openEdit(c)}
                        title="Modifier"
                      >
                        <i className="bi bi-pencil" />
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(c)}
                        title="Supprimer"
                      >
                        <i className="bi bi-trash" />
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
                  <select
                    className="form-select"
                    name="civility"
                    value={formData.civility}
                    onChange={handleChange}
                  >
                    <option value="M">M.</option>
                    <option value="Mme">Mme</option>
                  </select>
                </div>

                <div className="col-sm-4">
                  <label className="form-label">Nom</label>
                  <input
                    type="text"
                    className="form-control"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-sm-4">
                  <label className="form-label">Prénom</label>
                  <input
                    type="text"
                    className="form-control"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-sm-6">
                  <label className="form-label">N° (téléphone)</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-sm-6">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-sm-6">
                  <label className="form-label">Date de naissance</label>
                  <input
                    type="date"
                    className="form-control"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-sm-6">
                  <label className="form-label">Pseudo</label>
                  <input
                    type="text"
                    className="form-control"
                    name="pseudo"
                    value={formData.pseudo}
                    onChange={handleChange}
                  />
                </div>

                {/* ✅ Actif */}
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
                    <label className="form-check-label" htmlFor="cust-active">
                      Actif
                    </label>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end mt-3">
                <button type="button" className="btn btn-secondary me-2" onClick={closeModal}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-dark">
                  {isEditing ? "Modifier" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
