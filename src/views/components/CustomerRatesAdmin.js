// src/pages/admin/CustomerRatesAdmin.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
  getCustomerRateRequest,
  addCustomerRateRequest,
  updateCustomerRateRequest,
  deleteCustomerRateRequest,
} from "../../lib/actions/CustomerRateActions";

/* ---------- helpers tolérants ---------- */
const S = (v) => (v === 0 || v ? String(v) : "");

const normalize = (s) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const getId = (r) => r?.id ?? r?.Id ?? r?.rateId ?? r?.RateId ?? null;

const getEmail = (r) =>
  r?.customer?.email ??
  r?.customer?.mail ??
  r?.customer?.user?.email ??
  r?.email ??
  "—";

const getProductObj = (r) =>
  r?.product ?? r?.productVm ?? r?.productDTO ?? r?.Product ?? r?.ProductDTO ?? null;

const getProductLabel = (r) => {
  const p = getProductObj(r);
  if (!p) return "—";
  const brand =
    p?.brand ?? p?.Brand ?? p?.marque ?? p?.Marque ?? p?.manufacturer ?? "";
  const model = p?.model ?? p?.Model ?? p?.modele ?? p?.Modele ?? p?.title ?? "";
  const label = `${S(brand)}${brand && model ? " - " : ""}${S(model)}`.trim();
  return label || (p?.title ?? p?.Title ?? "—");
};

const getProductTitleForSearch = (r) => {
  const p = getProductObj(r);
  if (!p) return "";
  const brand =
    p?.brand ?? p?.Brand ?? p?.marque ?? p?.Marque ?? p?.manufacturer ?? "";
  const model = p?.model ?? p?.Model ?? p?.modele ?? p?.Modele ?? "";
  const title = p?.title ?? p?.Title ?? "";
  return [brand, model, title].filter(Boolean).join(" ").trim();
};

const getProductId = (r) => {
  const p = getProductObj(r);
  return p?.id ?? p?.Id ?? p?.productId ?? p?.ProductId ?? null;
};

const getProductCategoryName = (r) => {
  const p = getProductObj(r);
  return p?.category ?? p?.Category ?? p?.categoryName ?? p?.CategoryName ?? "";
};

const getRate = (r) =>
  Number(r?.rate ?? r?.Rate ?? r?.note ?? r?.Note ?? r?.stars ?? r?.Stars ?? NaN);

const getTitle = (r) => r?.title ?? r?.Title ?? r?.headline ?? r?.Headline ?? "";
const getMessage = (r) =>
  r?.message ?? r?.Message ?? r?.comment ?? r?.Comment ?? r?.avis ?? "";

const getCreationDate = (r) =>
  r?.creationDate ??
  r?.CreationDate ??
  r?.createdAt ??
  r?.CreatedAt ??
  r?.date ??
  null;

const toFrLongDate = (dLike) => {
  try {
    const d =
      dLike instanceof Date ? dLike : new Date(typeof dLike === "number" ? dLike : String(dLike));
    if (isNaN(d)) return "—";
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return "—";
  }
};

export const CustomerRatesAdmin = () => {
  const dispatch = useDispatch();
  const customerRatesFromStore =
    useSelector((s) => s.customerRates?.customerRates) || [];
  const categoriesFromStore =
    useSelector((s) => s.categories?.categories) || [];

  /* ---------- État UI ---------- */
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    productLabel: "",
    rate: 5,
    title: "",
    message: "",
    creationDate: "",
  });

  // Filtres
  const [selectedCategory, setSelectedCategory] = useState(""); // "" = toutes
  const [selectedRate, setSelectedRate] = useState(""); // "" = toutes
  const [productQuery, setProductQuery] = useState(""); // recherche texte

  /* Chargement initial */
  useEffect(() => {
    dispatch(getCustomerRateRequest());
  }, [dispatch]);

  /* Gestion body scroll + ESC */
  useEffect(() => {
    document.body.classList.toggle("no-scroll", showModal);
    const onKey = (e) => e.key === "Escape" && setShowModal(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("no-scroll");
    };
  }, [showModal]);

  /* Tri récent -> ancien (avant filtrage) */
  const sortedRows = useMemo(() => {
    const copy = [...customerRatesFromStore];
    copy.sort((a, b) => {
      const da = new Date(getCreationDate(a) ?? 0).getTime();
      const db = new Date(getCreationDate(b) ?? 0).getTime();
      return db - da;
    });
    return copy;
  }, [customerRatesFromStore]);

  /* Options catégories (depuis le store) */
  const categoryOptions = useMemo(() => {
    const namesFromStore = (categoriesFromStore || [])
      .map((c) => c?.name)
      .filter(Boolean);
    // On peut aussi ajouter les catégories présentes dans les avis si non listées
    const namesFromRates = sortedRows
      .map((r) => getProductCategoryName(r))
      .filter(Boolean);
    const set = new Set([...namesFromStore, ...namesFromRates]);
    return Array.from(set).sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));
  }, [categoriesFromStore, sortedRows]);

  /* Filtrage */
  const rows = useMemo(() => {
    const q = normalize(productQuery);
    const hasRateFilter = selectedRate !== "" && !Number.isNaN(Number(selectedRate));
    const rateFilterVal = Number(selectedRate);

    return sortedRows.filter((r) => {
      // Filtre Catégorie
      if (selectedCategory) {
        const cat = getProductCategoryName(r);
        if (normalize(cat) !== normalize(selectedCategory)) return false;
      }
      // Filtre Note
      if (hasRateFilter) {
        const n = getRate(r);
        if (!Number.isFinite(n) || n !== rateFilterVal) return false;
      }
      // Filtre Recherche produit
      if (q) {
        const text = normalize(getProductTitleForSearch(r));
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [sortedRows, selectedCategory, selectedRate, productQuery]);

  /* Handlers */
  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      email: "",
      productLabel: "",
      rate: 5,
      title: "",
      message: "",
      creationDate: "",
    });
    setShowModal(true);
  };

  const handleEditClick = (rateRow) => {
    const id = getId(rateRow);
    setIsEditing(true);
    setCurrentId(id);
    setFormData({
      email: getEmail(rateRow) || "",
      productLabel: getProductLabel(rateRow) || "",
      rate: Number.isFinite(getRate(rateRow)) ? getRate(rateRow) : 0,
      title: getTitle(rateRow) || "",
      message: getMessage(rateRow) || "",
      creationDate: toFrLongDate(getCreationDate(rateRow)) || "",
    });
    setShowModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (!id) return;
    if (window.confirm("Supprimer cet avis ?")) {
      await dispatch(deleteCustomerRateRequest(id));
      await dispatch(getCustomerRateRequest());
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: name === "rate" ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEditing && currentId != null) {
      await dispatch(
        updateCustomerRateRequest({
          id: currentId,
          // on envoie uniquement les champs éditables
          rate: formData.rate,
          title: formData.title?.trim() || null,
          message: formData.message?.trim() || null,
        })
      );
    } else {
      // Création manuelle d’un avis (facultatif)
      await dispatch(
        addCustomerRateRequest({
          email: formData.email?.trim() || null,
          productLabel: formData.productLabel?.trim() || null,
          rate: formData.rate,
          title: formData.title?.trim() || null,
          message: formData.message?.trim() || null,
        })
      );
    }

    await dispatch(getCustomerRateRequest());
    setShowModal(false);
  };

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">Gestion des avis clients</h1>

      {/* Barre de filtres */}
      <div className="row g-2 align-items-end mb-3">
        <div className="col-12 col-md-4">
          <label className="form-label">Catégorie</label>
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Toutes les catégories</option>
            {categoryOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-6 col-md-3">
          <label className="form-label">Note</label>
          <select
            className="form-select"
            value={selectedRate}
            onChange={(e) => setSelectedRate(e.target.value)}
          >
            <option value="">Toutes</option>
            {[5, 4, 3, 2, 1, 0].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="col-12 col-md-5">
          <label className="form-label">Recherche produit</label>
          <input
            className="form-control"
            placeholder="Rechercher (marque, modèle, titre)…"
            value={productQuery}
            onChange={(e) => setProductQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-success" onClick={handleAddClick}>
          Ajouter un avis
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>Client</th>
              <th>Produit</th>
              <th style={{ width: 120 }}>Note</th>
              <th>Titre</th>
              <th>Avis</th>
              <th style={{ whiteSpace: "nowrap" }}>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const id = getId(r);
              const email = getEmail(r);
              const product = getProductLabel(r);
              const note = getRate(r);
              const title = getTitle(r);
              const msg = getMessage(r);
              const date = toFrLongDate(getCreationDate(r));
              const pid = getProductId(r);

              return (
                <tr key={id ?? `${email}-${date}-${Math.random()}`}>
                  <td title={email}>{email || "—"}</td>
                  <td title={product}>
                    {pid ? (
                      <Link to={`/product/${pid}`}>{product || "—"}</Link>
                    ) : (
                      product || "—"
                    )}
                  </td>
                  <td>
                    {Number.isFinite(note) ? (
                      <span className="badge bg-primary">{note}/5</span>
                    ) : (
                      <span className="badge bg-secondary">—</span>
                    )}
                  </td>
                  <td title={title} className="text-truncate" style={{ maxWidth: 260 }}>
                    {title || "—"}
                  </td>
                  <td className="text-truncate" style={{ maxWidth: 480 }} title={msg}>
                    {msg?.trim() || "—"}
                  </td>
                  <td>{date}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleEditClick(r)}
                      title="Modifier"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteClick(id)}
                      title="Supprimer"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-muted py-4">
                  Aucun avis client pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --------- Modale Add/Edit --------- */}
      {showModal && (
        <div
          className="admin-modal-backdrop"
          role="presentation"
          onClick={() => setShowModal(false)}
        >
          <div
            className="admin-modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-rate-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="customer-rate-modal-title" className="mb-3">
              {isEditing ? "Modifier l'avis" : "Ajouter un avis"}
            </h2>

            <form onSubmit={handleSubmit}>
              {/* Lecture seule : infos non éditées (client/produit/date) */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label>Client (email)</label>
                  <input
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={onChange}
                    readOnly={isEditing}
                    placeholder="client@email.fr"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label>Produit</label>
                  <input
                    className="form-control"
                    name="productLabel"
                    value={formData.productLabel}
                    onChange={onChange}
                    readOnly={isEditing}
                    placeholder="Marque - Modèle"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label>Date de création</label>
                <input className="form-control" value={formData.creationDate} readOnly />
              </div>

              {/* Champs éditables */}
              <div className="row">
                <div className="col-md-3 mb-3">
                  <label>Note</label>
                  <select
                    name="rate"
                    className="form-select"
                    value={formData.rate}
                    onChange={onChange}
                    required
                  >
                    {[5, 4, 3, 2, 1, 0].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-9 mb-3">
                  <label>Titre</label>
                  <input
                    className="form-control"
                    name="title"
                    value={formData.title}
                    onChange={onChange}
                    placeholder="Titre de l'avis"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label>Avis</label>
                <textarea
                  className="form-control"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={onChange}
                  placeholder="Contenu de l'avis"
                />
              </div>

              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={() => setShowModal(false)}
                >
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
