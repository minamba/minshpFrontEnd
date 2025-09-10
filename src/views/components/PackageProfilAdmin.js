// src/views/components/PackageProfilAdmin.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  getPackageProfilRequest,
  addPackageProfilRequest,
  updatePackageProfilRequest,
  deletePackageProfilRequest,
} from "../../lib/actions/PackageProfilActions";
import { getCartRequest } from "../../lib/actions/CartActions";

// ✅ import utilitaire LS
import {
  patchPackageProfilInCart,
  removePackageProfilFromCart,
} from "../../lib/utils/cartLocalStorage";

// ───────── Utils / Helpers
const getId = (x) =>
  x?.id ?? x?.Id ?? x?.packageProfilId ?? x?.PackageProfilId ?? null;

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const toUI = (pp) => {
  const name = pp?.name ?? pp?.Name ?? "";
  const description = pp?.description ?? pp?.Description ?? "";
  const longer = num(pp?.longer ?? pp?.Longer ?? pp?.longueur ?? pp?.Longueur);
  const width = num(pp?.width ?? pp?.Width ?? pp?.largeur ?? pp?.Largeur);
  const height = num(pp?.height ?? pp?.Height ?? pp?.hauteur ?? pp?.Hauteur);
  const weight = num(pp?.weight ?? pp?.Weight ?? pp?.poids ?? pp?.Poids);
  return { id: getId(pp), name, description, longer, width, height, weight };
};

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.35)",
        zIndex: 1050,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 12,
          width: "min(720px, 100%)",
          boxShadow: "0 20px 60px rgba(0,0,0,.25)",
        }}
      >
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #eee" }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

export const PackageProfilAdmin = () => {
  const dispatch = useDispatch();
  const packageProfils = useSelector((s) => s.packageProfils?.packageProfils) || [];

  useEffect(() => {
    dispatch(getPackageProfilRequest?.());
    dispatch(getCartRequest());
  }, [dispatch]);

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("add"); // "add" | "edit"
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    longer: "",
    width: "",
    height: "",
    weight: "",
  });

  const resetForm = () =>
    setForm({ name: "", description: "", longer: "", width: "", height: "", weight: "" });

  const openAdd = () => {
    setMode("add");
    setEditingId(null);
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (pp) => {
    const row = toUI(pp);
    setMode("edit");
    setEditingId(row.id);
    setForm({
      name: row.name ?? "",
      description: row.description ?? "",
      longer: String(row.longer ?? ""),
      width: String(row.width ?? ""),
      height: String(row.height ?? ""),
      weight: String(row.weight ?? ""),
    });
    setModalOpen(true);
  };

  const close = () => setModalOpen(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    if (!form.name.trim()) return { ok: false, msg: "Le nom est requis." };
    for (const k of ["longer", "width", "height", "weight"]) {
      const v = Number(form[k]);
      if (!isFinite(v) || v <= 0) {
        return { ok: false, msg: `“${k}” doit être un nombre positif.` };
      }
    }
    return { ok: true };
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = validate();
    if (!res.ok) { alert(res.msg); return; }

    const toInt = (v, def = 0) => {
      const n = parseInt(String(v).replace(",", ".").trim(), 10);
      return Number.isFinite(n) ? n : def;
    };
    const toDec = (v, def = 0) => {
      const n = parseFloat(String(v).replace(",", ".").trim());
      return Number.isFinite(n) ? n : def;
    };

    const payload = {
      Name: form.name.trim(),
      Description: form.description.trim(),
      Longer: toInt(form.longer),
      Width:  toInt(form.width),
      Height: toInt(form.height),
      Weight: toDec(form.weight),
    };

    if (mode === "add") {
      await dispatch(addPackageProfilRequest(payload));
    } else {
      // Update côté API
      await dispatch(updatePackageProfilRequest({ Id: editingId, ...payload }));

      // ✅ Patch immédiat du panier en localStorage
      // (Si ton API renvoie l'entité normalisée en SUCCESS, tu peux remplacer
      // { Id: editingId, ...payload } par cette entité pour être 100% fidèle.)
      patchPackageProfilInCart({ Id: editingId, ...payload });
    }

    await dispatch(getPackageProfilRequest?.());
    close();
  };

  const onDelete = async (pp) => {
    const row = toUI(pp);
    if (!window.confirm(`Supprimer le profil “${row.name}” ?`)) return;

    await dispatch(deletePackageProfilRequest(row.id ?? row.Id ?? pp?.PackageProfilId));

    // ✅ Nettoyage des items qui référencent ce packageProfil
    removePackageProfilFromCart(row.id);

    await dispatch(getPackageProfilRequest?.());
  };

  const rows = useMemo(
    () => (packageProfils || []).map(toUI).sort((a, b) => a.name.localeCompare(b.name)),
    [packageProfils]
  );

  return (
    <div className="container py-4">
      <h1 className="display-5 mb-3">Gestion des PackageProfil</h1>

      <div className="mb-3">
        <button className="btn btn-primary" onClick={openAdd}>
          + Ajouter un PackageProfil
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>Nom</th>
              <th>Description</th>
              <th>Longueur (cm)</th>
              <th>Largeur (cm)</th>
              <th>Hauteur (cm)</th>
              <th>Poids (kg)</th>
              <th style={{ width: 180 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center">Aucun PackageProfil.</td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td style={{ whiteSpace: "pre-wrap" }}>{r.description || "—"}</td>
                  <td>{r.longer}</td>
                  <td>{r.width}</td>
                  <td>{r.height}</td>
                  <td>{r.weight}</td>
                  <td className="d-flex gap-2">
                    <button className="btn btn-sm btn-warning" onClick={() => openEdit(r)}>
                      Modifier
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => onDelete(r)}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        title={mode === "add" ? "Ajouter un PackageProfil" : "Modifier un PackageProfil"}
        onClose={close}
      >
        <form onSubmit={onSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Nom *</label>
              <input
                className="form-control"
                name="name"
                value={form.name}
                onChange={onChange}
                required
                placeholder="Ex. Colis XL"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Poids (kg) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                name="weight"
                value={form.weight}
                onChange={onChange}
                required
                placeholder="Ex. 2.5"
              />
            </div>

            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                name="description"
                value={form.description}
                onChange={onChange}
                rows={2}
                placeholder="Notes, matière, contraintes, etc."
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Longueur (cm) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                className="form-control"
                name="longer"
                value={form.longer}
                onChange={onChange}
                required
                placeholder="Ex. 40"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Largeur (cm) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                className="form-control"
                name="width"
                value={form.width}
                onChange={onChange}
                required
                placeholder="Ex. 30"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Hauteur (cm) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                className="form-control"
                name="height"
                value={form.height}
                onChange={onChange}
                required
                placeholder="Ex. 20"
              />
            </div>
          </div>

          <div className="d-flex justify-content-end mt-4">
            <button type="button" className="btn btn-secondary me-2" onClick={close}>
              Annuler
            </button>
            <button type="submit" className="btn btn-dark">
              {mode === "add" ? "Ajouter" : "Enregistrer"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
