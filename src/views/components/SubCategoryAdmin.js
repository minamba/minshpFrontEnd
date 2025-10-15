// src/views/components/SubCategoryAdmin.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getSubCategoryRequest,
  addSubCategoryRequest,
  updateSubCategoryRequest,
  deleteSubCategoryRequest,
} from "../../lib/actions/SubCategoryActions";
import { getImageRequest, updateImageRequest } from "../../lib/actions/ImageActions";
import { getProductUserRequest } from "../../lib/actions/ProductActions";
import { getTaxeRequest } from "../../lib/actions/TaxeActions";
import "../../App.css";
import { toMediaUrl } from "../../lib/utils/mediaUrl";

export const SubCategoryAdmin = () => {
  const dispatch = useDispatch();

  // Un seul useSelector (on lit tout le store puis on dérive)
  const root = useSelector((s) => s);

  const subcategoriesFromStore =
    root?.subcategories?.subcategories ??
    root?.subCategories?.subCategories ??
    root?.subcategories ??
    root?.subCategories ??
    [];

  const categoriesFromStore = root?.categories?.categories || [];
  const imagesFromStore     = root?.images?.images || [];
  const productsFromStore   = root?.products?.products || [];
  const taxesFromStore      = root?.taxes?.taxes || [];
  const packageProfils      = root?.packageProfils?.packageProfils || [];
  const contentCategories   = root?.shipping?.contentCategories || [];

  // ───────── UI state ─────────
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({ name: "", display: false });
  const [idImage, setIdImage] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");

  const [selectedTaxIds, setSelectedTaxIds] = useState([]);              // string[]
  const [selectedPackageProfilId, setSelectedPackageProfilId] = useState(""); // string
  const [selectedContentCode, setSelectedContentCode] = useState("");    // string
  const [contentCodeQuery, setContentCodeQuery] = useState("");          // recherche code produit
  const [selectedCategoryId, setSelectedCategoryId] = useState("");      // Catégorie (id, string)

  // ───────── Fetch data ─────────
  useEffect(() => {
    dispatch(getSubCategoryRequest());
    dispatch(getImageRequest());
    dispatch(getProductUserRequest());
    dispatch(getTaxeRequest());
  }, [dispatch]);

  // Bloque le scroll + ESC
  useEffect(() => {
    document.body.classList.toggle("no-scroll", showModal);
    const onKey = (e) => e.key === "Escape" && setShowModal(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("no-scroll");
    };
  }, [showModal]);

  // ───────── Helpers ─────────
  const normalize = (s) =>
    String(s ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const csvToArray = (csv) =>
    String(csv ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

  const getPkgIdFromEntity = (x) =>
    x?.idPackageProfil ??
    x?.IdPackageProfil ??
    x?.packageProfilId ??
    x?.PackageProfilId ??
    x?.idPackageProfile ??
    null;

  const getContentCodeIdFromEntity = (x) =>
    x?.contentCode ?? x?.ContentCode ?? x?.idContentCode ?? x?.IdContentCode ?? null;

  const getCategoryIdFromEntity = (x) =>
    x?.idCategory ?? x?.IdCategory ?? x?.categoryId ?? x?.CategoryId ?? null;

  const getProductSubCatId = (p) =>
    p?.idSubCategory ?? p?.IdSubCategory ?? p?.subCategoryId ?? p?.SubCategoryId ?? null;

  const imageMatchesSubCat = (img, subCatId) =>
    String(img?.idSubCategory ?? img?.IdSubCategory ?? img?.subCategoryId ?? "") ===
    String(subCatId);

  // Codes produit: tableau robuste
  const allCodeCategories = useMemo(() => {
    if (Array.isArray(contentCategories?.allCodeCategories)) {
      return contentCategories.allCodeCategories;
    }
    if (Array.isArray(contentCategories)) return contentCategories;
    return [];
  }, [contentCategories]);

  const filteredCodeCategories = useMemo(() => {
    const q = normalize(contentCodeQuery);
    if (!q) return allCodeCategories;
    return allCodeCategories.filter(
      (cc) => normalize(cc.label).includes(q) || String(cc.id).includes(q)
    );
  }, [allCodeCategories, contentCodeQuery]);

  const getContentCodeLabelById = (id) => {
    const found = allCodeCategories.find((cc) => String(cc.id) === String(id));
    return found?.label || "—";
  };

  const packageProfilsById = useMemo(() => {
    const m = new Map();
    for (const p of packageProfils) {
      const id = p?.id ?? p?.Id;
      if (id != null) m.set(String(id), p);
    }
    return m;
  }, [packageProfils]);

  const getPackageProfilName = (entity) => {
    const category = categoriesFromStore.find((c) => c.id === entity.idCategory);
    const packageProfil = packageProfils.find((p) => p.id === category?.idPackageProfil);
    if (packageProfil == null) return "—";
    return packageProfil.name ?? packageProfil.Name ?? `#${packageProfil.id}`;
  };

  const categoryNameById = useMemo(() => {
    const m = new Map();
    for (const c of categoriesFromStore) {
      if (c?.id != null) m.set(String(c.id), c?.name ?? c?.Name ?? `#${c.id}`);
    }
    return m;
  }, [categoriesFromStore]);

  const getCategoryNameForSubCat = (subcat) => {
    const cid = getCategoryIdFromEntity(subcat);
    return cid == null ? "—" : categoryNameById.get(String(cid)) ?? `#${cid}`;
  };

  const extractTaxIdsFromEntity = (entity, taxesList) => {
    if (!entity) return [];
    const rawNames = String(entity.taxes ?? entity.taxeName ?? "").trim();
    if (!rawNames) return [];
    const tokens = csvToArray(rawNames);
    const ids = tokens
      .map((tok) => {
        if (/^\d+$/.test(tok)) return tok;
        const t = taxesList.find((x) => normalize(x.name) === normalize(tok));
        return t ? String(t.id) : "";
      })
      .filter(Boolean);
    return Array.from(new Set(ids));
  };

  // ───────── Handlers ─────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ name: "", display: false });
    setIdImage("");
    setSelectedProductId("");
    setSelectedTaxIds([]);
    setSelectedPackageProfilId("");
    setSelectedContentCode("");
    setSelectedCategoryId("");
    setContentCodeQuery("");
    setShowModal(true);
  };

  const handleEditClick = (subcat) => {
    setIsEditing(true);
    setCurrentId(subcat.id);
    setFormData({
      id: subcat.id,
      name: subcat.name,
      display: Boolean(subcat.display),
    });

    // Pré-sélections
    const pkgId = getPkgIdFromEntity(subcat);
    setSelectedPackageProfilId(pkgId != null ? String(pkgId) : "");

    const ccId = getContentCodeIdFromEntity(subcat);
    setSelectedContentCode(ccId != null ? String(ccId) : "");
    setContentCodeQuery("");

    const catId = getCategoryIdFromEntity(subcat);
    setSelectedCategoryId(catId != null ? String(catId) : "");

    // Image liée
    const img = imagesFromStore.find((i) => imageMatchesSubCat(i, subcat.id));
    setIdImage(img ? String(img.id) : "");

    // Produit (pour grille d’images)
    const productsInSub = productsFromStore.filter(
      (p) => String(getProductSubCatId(p)) === String(subcat.id)
    );
    if (img?.idProduct ?? img?.IdProduct) setSelectedProductId(String(img.idProduct ?? img.IdProduct));
    else if (productsInSub.length > 0) setSelectedProductId(String(productsInSub[0].id));
    else setSelectedProductId("");

    setSelectedTaxIds(extractTaxIdsFromEntity(subcat, taxesFromStore));

    setShowModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Supprimer cette sous-catégorie ?")) {
      await dispatch(deleteSubCategoryRequest(id));
      await dispatch(getSubCategoryRequest());
    }
  };

  const toggleTax = (id) => {
    const key = String(id);
    setSelectedTaxIds((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ NULL si aucune taxe sélectionnée
    const idsTaxesCsvOrNull =
      selectedTaxIds.length > 0 ? selectedTaxIds.join(",") : null;

    const pkgIdNum =
      selectedPackageProfilId !== "" ? Number(selectedPackageProfilId) : null;

    const contentCodeId =
      selectedContentCode !== "" ? Number(selectedContentCode) : null;

    const catIdNum =
      selectedCategoryId !== "" ? Number(selectedCategoryId) : null;

    if (isEditing) {
      await dispatch(
        updateSubCategoryRequest({
          id: currentId,
          name: formData.name,
          idTaxe: idsTaxesCsvOrNull,         // ← null si aucune taxe
          IdPackageProfil: pkgIdNum,
          ContentCode: contentCodeId,
          IdCategory: catIdNum,
          Display: !!formData.display,
          IdImage: Number(idImage)
        })
      );
      if (idImage) {
        await dispatch(
          updateImageRequest({
            id: Number(idImage),
            IdSubCategory: Number(currentId),
          })
        );
      }
    } else {
      await dispatch(
        addSubCategoryRequest({
          name: formData.name,
          IdTaxe: idsTaxesCsvOrNull,        // ← null si aucune taxe (on garde la même clé que ton code)
          IdPackageProfil: pkgIdNum,
          ContentCode: contentCodeId,
          IdCategory: catIdNum,
          Display: !!formData.display,
        })
      );
    }
    setShowModal(false);
  };

  // ───────── Dérivés ─────────
  const sortedSubCategories = useMemo(
    () =>
      [...subcategoriesFromStore].sort((a, b) =>
        (a?.name || "").toLowerCase().localeCompare((b?.name || "").toLowerCase())
      ),
    [subcategoriesFromStore]
  );

  const getSubCategoryImageUrl = (idSubCategory) => {
    const image = imagesFromStore.find((i) => imageMatchesSubCat(i, idSubCategory));
    // minuscule pour éviter 404
    return image ? image.url : "/images/placeholder.jpg";
  };

  const productsInCurrentSubCategory = useMemo(() => {
    if (!isEditing || !currentId) return [];
    return productsFromStore.filter(
      (p) => String(getProductSubCatId(p)) === String(currentId)
    );
  }, [isEditing, currentId, productsFromStore]);

  const imagesOfSelectedProduct = useMemo(() => {
    if (!isEditing || !selectedProductId) return [];
    return imagesFromStore.filter(
      (img) => Number(img.idProduct ?? img.IdProduct) === Number(selectedProductId)
    );
  }, [isEditing, selectedProductId, imagesFromStore]);

  const imagesForCreate = useMemo(() => {
    if (isEditing) return [];
    return imagesFromStore.filter(
      (i) => !(i.idSubCategory || i.IdSubCategory || i.subCategoryId)
    );
  }, [isEditing, imagesFromStore]);

  // ───────── UI ─────────
  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">Gestion des sous-catégories</h1>

      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-success" onClick={handleAddClick}>
          Ajouter une sous-catégorie
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>Image</th>
              <th>Nom</th>
              <th>Catégorie</th>
              <th>Taxes</th>
              <th>Code produit</th>
              <th>Package profil</th>
              <th>Afficher</th>
              <th style={{ width: 180 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedSubCategories.map((sc) => {
              const ids = extractTaxIdsFromEntity(sc, taxesFromStore);
              const taxNames = ids.length
                ? ids
                    .map(
                      (id) =>
                        taxesFromStore.find((t) => String(t.id) === String(id))?.name ||
                        `#${id}`
                    )
                    .join(", ")
                : "—";

              return (
                <tr
                  key={sc.id}
                  onClick={() => handleEditClick(sc)}
                  style={{ cursor: "pointer" }}
                >
                  <td>
                    <img
                      src={toMediaUrl(getSubCategoryImageUrl(sc.id))}
                      width={100}
                      alt={sc.name}
                    />
                  </td>
                  <td>{sc.name}</td>
                  <td>{getCategoryNameForSubCat(sc)}</td>
                  <td>{taxNames}</td>
                  <td>{getContentCodeLabelById(getContentCodeIdFromEntity(sc))}</td>
                  <td>{getPackageProfilName(sc)}</td>
                  <td>
                    {sc.display ? (
                      <span className="badge bg-success">Oui</span>
                    ) : (
                      <span className="badge bg-secondary">Non</span>
                    )}
                  </td>
                  <td className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-warning"
                      title="Modifier"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(sc);
                      }}
                    >
                      <i className="bi bi-pencil" />
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      title="Supprimer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(sc.id);
                      }}
                    >
                      <i className="bi bi-trash" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {sortedSubCategories.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center">
                  Aucune sous-catégorie.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ─────────── Modal ─────────── */}
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
            aria-labelledby="subcategory-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="subcategory-modal-title" className="mb-3">
              {isEditing ? "Modifier la sous-catégorie" : "Ajouter une sous-catégorie"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label>Nom</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Catégorie */}
              <div className="mb-3">
                <label>Catégorie</label>
                <select
                  className="form-select mt-2"
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  required
                >
                  <option value="">— Sélectionner —</option>
                  {categoriesFromStore.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Code produit : recherche + liste filtrée */}
              <div className="mb-3">
                <label>Code produit</label>
                <input
                  className="form-control mt-2"
                  placeholder="Rechercher un code produit (label ou id)…"
                  value={contentCodeQuery}
                  onChange={(e) => setContentCodeQuery(e.target.value)}
                />
                <select
                  className="form-select mt-2"
                  value={selectedContentCode}
                  onChange={(e) => setSelectedContentCode(e.target.value)}
                >
                  <option value="">— Sélectionner —</option>
                  {filteredCodeCategories.map((cc) => (
                    <option key={cc.id} value={String(cc.id)}>
                      {cc.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Taxes associées */}
              <div className="mb-3">
                <label>Taxes associées</label>
                <div className="d-flex flex-wrap gap-3 mt-2">
                  {taxesFromStore.map((t) => (
                    <label
                      key={t.id}
                      className="form-check d-flex align-items-center gap-2"
                      style={{ minWidth: 220 }}
                      title={t.name}
                    >
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={selectedTaxIds.includes(String(t.id))}
                        onChange={() => toggleTax(t.id)}
                      />
                      <span>
                        {t.name}
                        {typeof t.purcentage === "number" ? ` (${t.purcentage}%)` : ""}
                        {typeof t.amount === "number"
                          ? ` — ${t.amount.toLocaleString("fr-FR", {
                              style: "currency",
                              currency: "EUR",
                            })}`
                          : ""}
                      </span>
                    </label>
                  ))}
                  {taxesFromStore.length === 0 && (
                    <span className="text-muted">Aucune taxe disponible.</span>
                  )}
                </div>
              </div>

              {/* Afficher (switch) */}
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="displaySwitch"
                  checked={!!formData.display}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, display: e.target.checked }))
                  }
                />
                <label className="form-check-label" htmlFor="displaySwitch">
                  Afficher (publiée)
                </label>
              </div>

              {/* Images liées à la sous-catégorie */}
              {isEditing ? (
                <>
                  <div className="mb-3">
                    <label>Produits de cette sous-catégorie</label>
                    <select
                      className="form-select mt-2"
                      value={selectedProductId}
                      onChange={(e) => {
                        setSelectedProductId(e.target.value);
                        setIdImage("");
                      }}
                    >
                      {productsInCurrentSubCategory.length === 0 && (
                        <option value="">Aucun produit dans cette sous-catégorie</option>
                      )}
                      {productsInCurrentSubCategory.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.brand + ' - ' + p.model || p.title || `Produit #${p.id}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label>Images du produit sélectionné</label>
                    <div className="d-flex flex-wrap gap-3 mt-2">
                      {imagesOfSelectedProduct.map((img) => (
                        <button
                          type="button"
                          key={img.id}
                          onClick={() => setIdImage(String(img.id))}
                          className={`p-1 border rounded ${
                            String(idImage) === String(img.id) ? "border-primary" : "border-200"
                          }`}
                          style={{ width: 120 }}
                          title={img.fileName || img.url}
                        >
                          <img
                            src={toMediaUrl(img.url)}
                            alt={img.fileName || `img-${img.id}`}
                            style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 6 }}
                          />
                          <div className="form-check mt-1">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="idImage"
                              checked={String(idImage) === String(img.id)}
                              onChange={() => setIdImage(String(img.id))}
                            />
                            <label className="form-check-label" style={{ fontSize: 12 }}>
                              #{img.id}
                            </label>
                          </div>
                        </button>
                      ))}
                      {imagesOfSelectedProduct.length === 0 && (
                        <div className="text-muted">Aucune image pour ce produit.</div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="mb-3">
                  <label>Images disponibles (non liées)</label>
                  <div className="d-flex flex-wrap gap-3 mt-2">
                    {imagesForCreate.map((img) => (
                      <button
                        type="button"
                        key={img.id}
                        onClick={() => setIdImage(String(img.id))}
                        className={`p-1 border rounded ${
                          String(idImage) === String(img.id) ? "border-primary" : "border-200"
                        }`}
                        style={{ width: 120 }}
                        title={img.fileName || img.url}
                      >
                        <img
                          src={toMediaUrl(img.url)}
                          alt={img.fileName || `img-${img.id}`}
                          style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 6 }}
                        />
                        <div className="form-check mt-1">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="idImage"
                            checked={String(idImage) === String(img.id)}
                            onChange={() => setIdImage(String(img.id))}
                          />
                          <label className="form-check-label" style={{ fontSize: 12 }}>
                            #{img.id}
                          </label>
                        </div>
                      </button>
                    ))}
                    {imagesForCreate.length === 0 && (
                      <div className="text-muted">Aucune image disponible.</div>
                    )}
                  </div>
                </div>
              )}

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
