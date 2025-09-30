// src/pages/admin/CustomerAdmin.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import "../../App.css";

import {
  getPagedCustomerRequest,
  deleteCustomerRequest,
} from "../../lib/actions/CustomerActions";
import {
  updateUserRequest,
  registerRequest,
  addRoleRequest,
  removeRoleRequest,
  lockUserRequest,
  unlockUserRequest,
} from "../../lib/actions/AccountActions";

import { getUserRoles } from "../../lib/utils/jwt";

/* utils */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ROLE_CHANGE_DELAY_MS = 1000;
const LOCK_CHANGE_DELAY_MS = 800;
const ROLES = ["Admin", "Manager", "Customer"];

/* helpers */
const norm = (s) => String(s ?? "").trim().toLowerCase();
const getId = (c) => c?.id ?? c?.customerId ?? c?.Id ?? null;
const getAspId = (u) => u?.idAspNetUser ?? u?.IdAspNetUser ?? u?.aspId ?? null;
const getRoleNames = (c) =>
  Array.isArray(c?.roles)
    ? c.roles.map((r) => (typeof r === "string" ? r : r?.name)).filter(Boolean)
    : [];
const primaryRoleOf = (c) => getRoleNames(c)[0] || "";
const fmtDate = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("fr-FR");
};

// 🔐 (actuellement ton état visuel s'appuie sur `actif`)
const isLocked = (c) => {
  return c.actif;
};

export const CustomerAdmin = () => {
  const dispatch = useDispatch();

  const token = localStorage.getItem("access_token");
  const roles = (typeof getUserRoles === "function" ? getUserRoles(token) : []) || [];
  const isAdmin = roles.map((r) => String(r).toLowerCase()).includes("admin");

  // -------- Store paginé --------
  const customerSlice = useSelector((s) => s?.customers) || {};
  const customers = Array.isArray(customerSlice.items) ? customerSlice.items : [];
  const totalCount = Number(customerSlice.totalCount ?? 0);
  const loading = !!customerSlice.loading;

  // -------- UI --------
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [uiSearch, setUiSearch] = useState("");
  const [serverSearch, setServerSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState(""); // "" | "actif" | "inactif"

  // modale add/edit
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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

  // modale rôles
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleUser, setRoleUser] = useState(null);
  const [selectedRoleName, setSelectedRoleName] = useState("");

  // pending lock operations (éviter double-clic)
  const [pendingLocks, setPendingLocks] = useState(() => new Set());

  /* ---- debounce de la recherche ---- */
  useEffect(() => {
    const t = setTimeout(() => {
      setServerSearch(uiSearch.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [uiSearch]);

  /* ---- fonction pour recharger la page courante ---- */
  const refreshPage = useCallback(() => {
    dispatch(
      getPagedCustomerRequest({
        page,
        pageSize,
        sort: "LastName:asc",
        filter: {
          ...(serverSearch ? { Search: serverSearch } : {}),
          ...(roleFilter ? { Role: roleFilter } : {}),
          ...(activeFilter
            ? { Actif: activeFilter === "actif" } // envoie un booléen côté API si supporté
            : {}),
        },
      })
    );
  }, [dispatch, page, pageSize, serverSearch, roleFilter, activeFilter]);

  /* ---- fetch initial + à chaque changement de filtres ---- */
  useEffect(() => {
    refreshPage();
  }, [refreshPage]);

  /* ---- lignes affichées (fallback filtre UI sur la page courante) ---- */
  const rows = useMemo(() => {
    const q = norm(uiSearch);
    return customers.filter((c) => {
      const matchesText =
        !q ||
        norm(c?.clientNumber).includes(q) ||
        norm(c?.lastName).includes(q) ||
        norm(c?.firstName).includes(q) ||
        norm(c?.email).includes(q) ||
        norm(c?.phone ?? c?.phoneNumber).includes(q);

      const matchesRole = !roleFilter || getRoleNames(c).includes(roleFilter);
      const matchesActive =
        !activeFilter ||
        (activeFilter === "actif" ? !!c?.actif : !c?.actif);

      return matchesText && matchesRole && matchesActive;
    });
  }, [customers, uiSearch, roleFilter, activeFilter]);

  /* ---- pagination infos ---- */
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIdx = totalCount ? (page - 1) * pageSize + 1 : 0;
  const endIdx = totalCount ? Math.min(totalCount, page * pageSize) : 0;

  /* ================== Actions: ADD / EDIT ================== */
  const openAdd = () => {
    setIsEditing(false);
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
    setShowModal(true);
  };

  const openEdit = (c) => {
    setIsEditing(true);
    setFormData({
      id: getId(c),
      aspId: getAspId(c),
      civility: c?.civility ?? c?.civilite ?? "M",
      lastName: c?.lastName ?? c?.nom ?? "",
      firstName: c?.firstName ?? c?.prenom ?? "",
      phone: c?.phone ?? c?.phoneNumber ?? "",
      email: c?.email ?? "",
      birthDate: (c?.birthDate ?? c?.dateOfBirth ?? c?.naissance ?? "").slice(0, 10),
      pseudo: c?.pseudo ?? "",
      actif: !!c?.actif,
    });
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const onFormChange = (e) => {
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
    if (isEditing) await dispatch(updateUserRequest(payload));
    else await dispatch(registerRequest(payload));

    closeModal();
    refreshPage();
  };

  /* ================== Action: DELETE ================== */
  const handleDelete = async (c) => {
    const id = getId(c);
    if (!id) return;
    if (!window.confirm(`Supprimer le client "${c?.lastName ?? ""} ${c?.firstName ?? ""}" ?`)) return;
    await dispatch(deleteCustomerRequest(id));
    refreshPage();
  };

  /* ================== Actions: ROLES ================== */
  const openRoleModal = (c) => {
    setRoleUser(c);
    setSelectedRoleName(primaryRoleOf(c) || ROLES[0] || "");
    setShowRoleModal(true);
  };
  const closeRoleModal = () => {
    setShowRoleModal(false);
    setRoleUser(null);
    setSelectedRoleName("");
  };

  const onAddRole = async () => {
    if (!roleUser || !selectedRoleName) return;
    const aspId = getAspId(roleUser);
    if (!aspId) {
      alert("IdAspNetUser manquant.");
      return;
    }
    await dispatch(addRoleRequest({ UserId: String(aspId), Role: String(selectedRoleName) }));
    await sleep(ROLE_CHANGE_DELAY_MS);
    refreshPage();
    closeRoleModal();
  };

  const onChangeRole = async () => {
    if (!roleUser || !selectedRoleName) return;
    const aspId = getAspId(roleUser);
    if (!aspId) {
      alert("IdAspNetUser manquant.");
      return;
    }
    const current = primaryRoleOf(roleUser);
    if (!current) {
      await onAddRole();
      return;
    }
    if (current === selectedRoleName) {
      closeRoleModal();
      return;
    }

    await dispatch(removeRoleRequest({ UserId: String(aspId), Role: String(current) }));
    await sleep(ROLE_CHANGE_DELAY_MS);
    await dispatch(addRoleRequest({ UserId: String(aspId), Role: String(selectedRoleName) }));
    await sleep(ROLE_CHANGE_DELAY_MS);
    refreshPage();
    closeRoleModal();
  };

  const canRemove = (c) => getRoleNames(c).length > 0;

  /* ================== 🔐 Lock / Unlock ================== */
  const toggleLock = async (c) => {
    const aspId = getAspId(c);
    if (!aspId) {
      alert("IdAspNetUser manquant.");
      return;
    }
    setPendingLocks((prev) => new Set(prev).add(aspId));
    try {
      await dispatch(lockUserRequest(String(aspId))); // lock (ton implé actuelle)
      await sleep(LOCK_CHANGE_DELAY_MS);
      refreshPage();
    } finally {
      setPendingLocks((prev) => {
        const next = new Set(prev);
        next.delete(aspId);
        return next;
      });
    }
  };

  /* ================== RENDER ================== */
  return (
    <div className="container py-3">
      {/* Toolbar */}
      <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
        <h2 className="m-0 me-auto">Clients</h2>
      </div>

      <div className="d-flex align-items-center gap-2 mb-2">
        <input
          className="form-control"
          style={{ minWidth: 260, width: 420, maxWidth: "40vw" }}
          placeholder="Rechercher (nom, prénom, email, n° client, téléphone)…"
          value={uiSearch}
          onChange={(e) => setUiSearch(e.target.value)}
        />

        <select
          className="form-select"
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
          style={{ width: 140 }}
        >
          {[10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>
      </div>

      {/* Filtres (rôle + actif) */}
      <div className="mb-3 d-flex gap-2 flex-wrap" style={{ maxWidth: 620 }}>
        <select
          className="form-select"
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          style={{ width: 300 }}
        >
          <option value="">— Tous les rôles —</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select
          className="form-select"
          value={activeFilter}
          onChange={(e) => {
            setActiveFilter(e.target.value); // "", "actif", "inactif"
            setPage(1);
          }}
          style={{ width: 300 }}
        >
          <option value="">— Tous les statuts —</option>
          <option value="actif">Actifs</option>
          <option value="inactif">Inactifs</option>
        </select>
      </div>

      <button type="button" className="btn btn-success mb-3" onClick={openAdd}>
        Ajouter un client
      </button>

      {/* Table */}
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
              <th>Rôle</th>
              <th>Actif</th>
              <th style={{ width: 170 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={11} className="text-center">
                  Chargement…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center">
                  Aucun client.
                </td>
              </tr>
            ) : (
              rows.map((c) => (
                <tr key={getId(c)}>
                  <td>{c?.clientNumber ?? "—"}</td>
                  <td>{c?.civility ?? c?.civilite ?? "—"}</td>
                  <td>{c?.lastName ?? "—"}</td>
                  <td>{c?.firstName ?? "—"}</td>
                  <td>{c?.phone ?? c?.phoneNumber ?? "—"}</td>
                  <td>{c?.email ?? "—"}</td>
                  <td>{fmtDate(c?.birthDate ?? c?.dateOfBirth ?? c?.naissance)}</td>
                  <td>{c?.pseudo ?? "—"}</td>
                  <td>{primaryRoleOf(c) || "NONE"}</td>
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

                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => openRoleModal(c)}
                        title="Droits / Rôles"
                      >
                        <i className="bi bi-eye" />
                      </button>

                      {/* 🔐 Lock / Unlock */}
                      <button
                        className="btn btn-sm btn-light"
                        onClick={() => toggleLock(c)}
                        title={c.actif ? "Bloquer l’utilisateur" : "Débloquer l’utilisateur"}
                        disabled={pendingLocks.has(getAspId(c)) || loading}
                        style={{ borderColor: "rgba(0,0,0,0.1)" }}
                      >
                        <i
                          className={`bi ${c.actif ? "bi-unlock" : "bi-lock-fill"}`}
                          style={{
                            fontSize: 18,
                            verticalAlign: "middle",
                            color: c.actif ? "#198754" : "#dc3545", // vert actif, rouge inactif
                          }}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex align-items-center justify-content-between mt-2">
          <div />
          <nav className="d-flex align-items-center gap-2">
            <button
              className="btn btn-light"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ← Précédent
            </button>
            <span>
              {startIdx}–{endIdx} sur {totalCount}
            </span>
            <button
              className="btn btn-light"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Suivant →
            </button>
          </nav>
        </div>
      )}

      {/* -------- MODALE ADD/EDIT -------- */}
      {showModal && (
        <div className="admin-modal-backdrop" role="presentation" onClick={closeModal}>
          <div
            className="admin-modal-panel"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "min(720px,95vw)", background: "#fff", borderRadius: 12 }}
          >
            <h3 className="mb-3">{isEditing ? "Modifier le client" : "Ajouter un client"}</h3>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-sm-4">
                  <label className="form-label">Civilité</label>
                  <select
                    className="form-select"
                    name="civility"
                    value={formData.civility}
                    onChange={onFormChange}
                  >
                    <option value="M">M.</option>
                    <option value="Mme">Mme</option>
                  </select>
                </div>

                <div className="col-sm-4">
                  <label className="form-label">Nom</label>
                  <input
                    className="form-control"
                    name="lastName"
                    value={formData.lastName}
                    onChange={onFormChange}
                    required
                  />
                </div>

                <div className="col-sm-4">
                  <label className="form-label">Prénom</label>
                  <input
                    className="form-control"
                    name="firstName"
                    value={formData.firstName}
                    onChange={onFormChange}
                    required
                  />
                </div>

                <div className="col-sm-6">
                  <label className="form-label">N° (téléphone)</label>
                  <input
                    className="form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={onFormChange}
                  />
                </div>

                <div className="col-sm-6">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={onFormChange}
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
                    onChange={onFormChange}
                  />
                </div>

                <div className="col-sm-6">
                  <label className="form-label">Pseudo</label>
                  <input
                    className="form-control"
                    name="pseudo"
                    value={formData.pseudo}
                    onChange={onFormChange}
                  />
                </div>

                <div className="col-sm-6 d-flex align-items-center">
                  <div className="form-check mt-4">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="cust-active"
                      name="actif"
                      checked={!!formData.actif}
                      onChange={onFormChange}
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

      {/* -------- MODALE RÔLES -------- */}
      {showRoleModal && (
        <div className="admin-modal-backdrop" role="presentation" onClick={closeRoleModal}>
          <div
            className="admin-modal-panel"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "min(560px,92vw)", background: "#fff", borderRadius: 12 }}
          >
            <h3 className="mb-2">Droits / Rôles</h3>
            <div className="text-muted mb-3" style={{ fontSize: 14 }}>
              Utilisateur :{" "}
              <strong>
                {roleUser?.email ?? `${roleUser?.lastName ?? ""} ${roleUser?.firstName ?? ""}`}
              </strong>
            </div>

            <div className="mb-3" role="radiogroup" aria-label="Rôles">
              {ROLES.map((r) => (
                <label
                  key={r}
                  className="d-flex align-items-center mb-2"
                  style={{ gap: 8, cursor: "pointer" }}
                >
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
              <button className="btn btn-secondary" onClick={closeRoleModal}>
                Fermer
              </button>
              {canRemove(roleUser) ? (
                <button
                  className="btn btn-primary"
                  onClick={onChangeRole}
                  disabled={!selectedRoleName || selectedRoleName === primaryRoleOf(roleUser)}
                >
                  Modifier le rôle
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={onAddRole}
                  disabled={!selectedRoleName}
                >
                  Attribuer le rôle
                </button>
              )}
            </div>

            <div className="mt-3 text-muted" style={{ fontSize: 13 }}>
              Rôle actuel : <strong>{primaryRoleOf(roleUser) || "Aucun"}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
