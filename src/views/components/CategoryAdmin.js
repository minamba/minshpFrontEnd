import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  getCategoryRequest,
  addCategoryRequest,
  updateCategoryRequest,
  deleteCategoryRequest
} from '../../lib/actions/CategoryActions';
import { getImageRequest, updateImageRequest } from '../../lib/actions/ImageActions';
import { getProductUserRequest } from '../../lib/actions/ProductActions';
import { getTaxeRequest } from '../../lib/actions/TaxeActions';
import '../../App.css';
import { toMediaUrl } from '../../lib/utils/mediaUrl';

export const CategoryAdmin = () => {
  const categoriesFromStore = useSelector((s) => s.categories.categories) || [];
  const imagesFromStore     = useSelector((s) => s.images.images) || [];
  const productsFromStore   = useSelector((s) => s.products.products) || [];
  const taxesFromStore      = useSelector((s) => s.taxes?.taxes) || [];
  const packageProfils      = useSelector((s) => s.packageProfils?.packageProfils) || [];
  const contentCategories   = useSelector((s) => s.shipping?.contentCategories) || [];
  const dispatch = useDispatch();

  const [showModal, setShowModal]                   = useState(false);
  const [isEditing, setIsEditing]                   = useState(false);
  const [currentId, setCurrentId]                   = useState(null);
  const [formData, setFormData]                     = useState({ name: '', display: false });
  const [idImage, setIdImage]                       = useState('');
  const [selectedProductId, setSelectedProductId]   = useState('');
  const [selectedTaxIds, setSelectedTaxIds]         = useState([]);       // string[]
  const [selectedPackageProfilId, setSelectedPackageProfilId] = useState(''); // string
  const [selectedContentCode, setSelectedContentCode]         = useState(''); // string (id du code produit)
  const [contentCodeQuery, setContentCodeQuery]               = useState(''); // 🔎 recherche Code produit

  useEffect(() => {
    dispatch(getCategoryRequest());
    dispatch(getImageRequest());
    dispatch(getProductUserRequest());
    dispatch(getTaxeRequest());
  }, [dispatch]);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', showModal);
    const onKey = (e) => { if (e.key === 'Escape') setShowModal(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
    };
  }, [showModal]);

  /* ───────── Helpers ───────── */
  const normalize = (s) =>
    String(s ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const csvToArray = (csv) =>
    String(csv ?? '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

  const toBool = (v) => {
    if (typeof v === 'string') {
      const t = v.trim().toLowerCase();
      if (t === 'true' || t === '1' || t === 'yes' || t === 'oui') return true;
      if (t === 'false' || t === '0' || t === 'no' || t === 'non') return false;
    }
    return Boolean(v);
  };

  // 🔐 Normalisation d'IDs pour éviter les mismatches
  const getProductId = (p) =>
    Number(p?.id ?? p?.Id ?? p?.productId ?? p?.ProductId ?? NaN);

  const getImageProductId = (img) =>
    Number(img?.idProduct ?? img?.IdProduct ?? img?.productId ?? img?.ProductId ?? NaN);

  const getImageCategoryId = (img) =>
    Number(img?.idCategory ?? img?.IdCategory ?? NaN);

  const getProductCategoryId = (p) =>
    Number(p?.idCategory ?? p?.IdCategory ?? NaN);

  const getDisplayFromCategory = (cat) => {
    const v = cat?.display ?? cat?.Display ?? cat?.isDisplayed ?? cat?.IsDisplayed ?? cat?.published ?? cat?.Published;
    return toBool(v);
  };

  // id package profil dans catégorie
  const getPkgIdFromCategory = (cat) =>
    cat?.idPackageProfil ??
    cat?.IdPackageProfil ??
    cat?.packageProfilId ??
    cat?.PackageProfilId ??
    cat?.idPackageProfile ??
    null;

  // id content code (code produit) dans catégorie
  const getContentCodeIdFromCategory = (cat) =>
    cat?.contentCode ??
    cat?.ContentCode ??
    cat?.idContentCode ??
    cat?.IdContentCode ??
    null;

  const packageProfilsById = useMemo(() => {
    const m = new Map();
    for (const p of packageProfils) {
      const id = p?.id ?? p?.Id;
      if (id != null) m.set(String(id), p);
    }
    return m;
  }, [packageProfils]);

  // Toujours obtenir un tableau de codes produit
  const allCodeCategories = useMemo(() => {
    if (Array.isArray(contentCategories?.allCodeCategories)) {
      return contentCategories.allCodeCategories;
    }
    if (Array.isArray(contentCategories)) return contentCategories;
    return [];
  }, [contentCategories]);

  // Index id -> label
  const contentCodeLabelById = useMemo(() => {
    const m = new Map();
    for (const cc of allCodeCategories) {
      if (cc?.id != null) m.set(String(cc.id), cc?.label ?? '');
    }
    return m;
  }, [allCodeCategories]);

  // 🔎 Liste filtrée selon la recherche
  const filteredCodeCategories = useMemo(() => {
    const q = normalize(contentCodeQuery);
    if (!q) return allCodeCategories;
    return allCodeCategories.filter(
      (cc) => normalize(cc.label).includes(q) || String(cc.id).includes(q)
    );
  }, [allCodeCategories, contentCodeQuery]);

  const getPackageProfilName = (cat) => {
    const pid = getPkgIdFromCategory(cat);
    if (pid == null) return '—';
    const pp = packageProfilsById.get(String(pid));
    return pp?.name ?? pp?.Name ?? `#${pid}`;
  };

  const getContentCodeLabel = (cat) => {
    const list = Array.isArray(contentCategories?.allCodeCategories)
      ? contentCategories.allCodeCategories
      : Array.isArray(contentCategories)
      ? contentCategories
      : [];
    const contentCategory = list.find((cc) => String(cc.id) === String(cat?.contentCode ?? cat?.ContentCode));
    const label = contentCategory?.label;
    return label || '—';
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const extractTaxIdsFromCategory = (cat, taxesList) => {
    if (!cat) return [];
    const rawNames = String(cat.taxes ?? cat.taxeName ?? '').trim();
    if (!rawNames) return [];
    const tokens = csvToArray(rawNames);
    const ids = tokens
      .map((tok) => {
        if (/^\d+$/.test(tok)) return tok;
        const t = taxesList.find((x) => normalize(x.name) === normalize(tok));
        return t ? String(t.id) : '';
      })
      .filter(Boolean);
    return Array.from(new Set(ids));
  };

  /* ───────── Actions UI ───────── */
  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ name: '', display: false });
    setIdImage('');
    setSelectedProductId('');
    setSelectedTaxIds([]);
    setSelectedPackageProfilId('');
    setSelectedContentCode('');
    setContentCodeQuery('');
    setShowModal(true);
  };

  const handleEditClick = (category) => {
    setIsEditing(true);
    setCurrentId(category.id);
    setFormData({ id: category.id, name: category.name, display: getDisplayFromCategory(category) });

    // Pré-sélections
    const pkgId = getPkgIdFromCategory(category);
    setSelectedPackageProfilId(pkgId != null ? String(pkgId) : '');

    const ccId = getContentCodeIdFromCategory(category);
    setSelectedContentCode(ccId != null ? String(ccId) : '');
    setContentCodeQuery(''); // reset recherche quand on ouvre

    // Image liée à la catégorie
    const img = imagesFromStore.find((i) => getImageCategoryId(i) === Number(category.id));
    setIdImage(img ? String(img.id) : '');

    // Produits rattachés à la catégorie (par idCategory si dispo, sinon via le nom comme avant)
    const productsInCatById = productsFromStore.filter(
      (p) => getProductCategoryId(p) === Number(category.id)
    );
    let nextSelectedProductId = '';
    if (img && !Number.isNaN(getImageProductId(img))) {
      nextSelectedProductId = String(getImageProductId(img));
    } else if (productsInCatById.length > 0) {
      nextSelectedProductId = String(getProductId(productsInCatById[0]));
    } else {
      // fallback ancien mapping par nom de catégorie si nécessaire
      const byName = productsFromStore.filter(
        (p) => String(p.category) === String(category.name)
      );
      if (byName.length > 0) nextSelectedProductId = String(getProductId(byName[0]));
    }
    setSelectedProductId(nextSelectedProductId);

    // Taxes pré-cochées
    setSelectedTaxIds(extractTaxIdsFromCategory(category, taxesFromStore));

    setShowModal(true);
  };

  useEffect(() => {
    if (!showModal || !isEditing || !currentId) return;
    if (selectedTaxIds.length > 0) return;
    const cat = categoriesFromStore.find((c) => c.id === currentId);
    if (cat && taxesFromStore.length) {
      setSelectedTaxIds(extractTaxIdsFromCategory(cat, taxesFromStore));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taxesFromStore]);

  const handleDeleteClick = async (id) => {
    if (window.confirm('Supprimer cette catégorie ?')) {
      await dispatch(deleteCategoryRequest(id));
      await dispatch(getCategoryRequest());
    }
  };

  const toggleTax = (id) => {
    const key = String(id);
    setSelectedTaxIds((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
    );
  };

  /* ───────── Soumission ───────── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // null si aucune taxe sélectionnée
    const idsTaxesCsvOrNull = selectedTaxIds.length > 0 ? selectedTaxIds.join(',') : null;

    const pkgIdNum =
      selectedPackageProfilId !== '' ? Number(selectedPackageProfilId) : null;

    // On envoie UNIQUEMENT l'id du “code produit”
    const contentCodeId = selectedContentCode !== '' ? Number(selectedContentCode) : null;

    if (isEditing) {
      await dispatch(updateCategoryRequest({
        id: currentId,
        name: formData.name,
        idTaxe: idsTaxesCsvOrNull,          // ← null si aucune taxe
        IdPackageProfil: pkgIdNum,
        ContentCode: contentCodeId,
        Display: !!formData.display,
      }));
      if (idImage) {
        await dispatch(updateImageRequest({ id: Number(idImage), idCategory: Number(currentId) }));
      }
    } else {
      const addPayload = {
        name: formData.name,
        idsTaxes: idsTaxesCsvOrNull,        // ← null si aucune taxe
        IdPackageProfil: pkgIdNum,
        ContentCode: contentCodeId,
        Display: !!formData.display,
      };
      await dispatch(addCategoryRequest(addPayload));
      await dispatch(getCategoryRequest());

      const created = [...categoriesFromStore].reverse().find((c) => c.name === formData.name);
      if (idImage && created?.id) {
        await dispatch(updateImageRequest({ id: Number(idImage), idCategory: Number(created.id) }));
      }
    }

    await dispatch(getImageRequest());
    await dispatch(getCategoryRequest());
    setShowModal(false);
  };

  /* ───────── Sélecteurs dérivés ───────── */
  const sortedCategories = useMemo(
    () => [...categoriesFromStore].sort((a, b) =>
      (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase())
    ),
    [categoriesFromStore]
  );

  const getCategoryImage = (idCategory) => {
    const image = imagesFromStore.find((i) => getImageCategoryId(i) === Number(idCategory));
    // évite le 404 'Images/placeholder.jpg' → 'images/placeholder.jpg'
    return image ? image.url : '/images/placeholder.jpg';
  };

  const getCategoryIdByName = (catName) => {
    const category = categoriesFromStore.find((c) => c.name === catName);
    return category ? category.id : null;
  };

  const getCategoryTaxNames = (cat) => {
    if (cat?.taxes) return cat.taxes;
    if (cat?.taxeName) return cat.taxeName;
    const ids = extractTaxIdsFromCategory(cat, taxesFromStore);
    if (ids.length) {
      const names = ids.map((id) => taxesFromStore.find((t) => String(t.id) === String(id))?.name || `#${id}`);
      return names.join(', ');
    }
    return '—';
  };

  // Produits de la catégorie courante
  const productsInCurrentCategory = useMemo(() => {
    if (!isEditing || !currentId) return [];
    // d'abord par idCategory
    const byId = productsFromStore.filter(
      (p) => getProductCategoryId(p) === Number(currentId)
    );
    if (byId.length) return byId;
    // fallback par nom si certains produits n'ont pas idCategory mais seulement le nom
    return productsFromStore.filter(
      (p) => Number(getCategoryIdByName(p.category)) === Number(currentId)
    );
  }, [isEditing, currentId, productsFromStore, categoriesFromStore]);

  // ✅ Images du produit sélectionné – comparaison robuste
  const imagesOfSelectedProduct = useMemo(() => {
    if (!isEditing || !selectedProductId) return [];
    const selId = Number(selectedProductId);
    return imagesFromStore.filter((img) => getImageProductId(img) === selId);
  }, [isEditing, selectedProductId, imagesFromStore]);

  const imagesForCreate = useMemo(() => {
    if (isEditing) return [];
    return imagesFromStore.filter((i) => !i.idCategory && !i.IdCategory);
  }, [isEditing, imagesFromStore]);

  /* ───────── UI ───────── */
  return (
    <div className='container py-5'>
      <h1 className="text-center mb-4">Gestion des catégories</h1>

      <div className="d-flex justify-content-end mb-3">
        <button className='btn btn-success' onClick={handleAddClick}>
          Ajouter une catégorie
        </button>
      </div>

      <div className='table-responsive'>
        <table className='table table-striped table-hover shadow-sm'>
          <thead className='table-dark'>
            <tr>
              <th>Image</th>
              <th>Nom</th>
              <th>Taxes</th>
              <th>Code produit</th>
              <th>Package profil</th>
              <th>Afficher</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedCategories.map((cat) => (
              <tr key={cat.id} onClick={() => handleEditClick(cat)} style={{ cursor: 'pointer' }}>
                <td><img src={toMediaUrl(getCategoryImage(cat.id))} width={100} alt={cat.name} /></td>
                <td>{cat.name}</td>
                <td>{getCategoryTaxNames(cat)}</td>
                <td>{getContentCodeLabel(cat)}</td>
                <td>{getPackageProfilName(cat)}</td>
                <td>
                  {getDisplayFromCategory(cat) ? (
                    <span className="badge bg-success">Oui</span>
                  ) : (
                    <span className="badge bg-secondary">Non</span>
                  )}
                </td>
                <td>
                  <button
                    className='btn btn-sm btn-warning me-2'
                    onClick={(e) => { e.stopPropagation(); handleEditClick(cat); }}
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button
                    className='btn btn-sm btn-danger'
                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(cat.id); }}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
            aria-labelledby="category-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="category-modal-title" className="mb-3">
              {isEditing ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
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

              {/* Afficher */}
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="displaySwitch"
                  name="display"
                  checked={!!formData.display}
                  onChange={handleInputChange}
                />
                <label className="form-check-label" htmlFor="displaySwitch">
                  Afficher (publiée)
                </label>
              </div>

              {/* Package profil */}
              <div className="mb-3">
                <label>Package profil</label>
                <select
                  className="form-select mt-2"
                  value={selectedPackageProfilId}
                  onChange={(e) => setSelectedPackageProfilId(e.target.value)}
                >
                  <option value="">— Sélectionner —</option>
                  {packageProfils.map((pp) => (
                    <option key={pp.id ?? pp.Id} value={String(pp.id ?? pp.Id)}>
                      {pp.name ?? pp.Name ?? `Profil #${pp.id ?? pp.Id}`}
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
                        {typeof t.purcentage === 'number' ? ` (${t.purcentage}%)` : ''}
                        {typeof t.amount === 'number'
                          ? ` — ${t.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`
                          : ''}
                      </span>
                    </label>
                  ))}
                  {taxesFromStore.length === 0 && (
                    <span className="text-muted">Aucune taxe disponible.</span>
                  )}
                </div>
              </div>

              {/* Images */}
              {isEditing ? (
                <>
                  <div className="mb-3">
                    <label>Produits de cette catégorie</label>
                    <select
                      className="form-select mt-2"
                      value={selectedProductId}
                      onChange={(e) => {
                        setSelectedProductId(e.target.value); // string OK
                        setIdImage('');
                      }}
                    >
                      {productsInCurrentCategory.length === 0 && (
                        <option value="">Aucun produit dans cette catégorie</option>
                      )}
                      {productsInCurrentCategory.map((p) => {
                        const pid = getProductId(p);
                        return (
                          <option key={pid} value={String(pid)}>
                            {p.name || p.title || `Produit #${pid}`}
                          </option>
                        );
                      })}
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
                          className={`p-1 border rounded ${String(idImage) === String(img.id) ? 'border-primary' : 'border-200'}`}
                          style={{ width: 120 }}
                          title={img.fileName || img.url}
                        >
                          <img
                            src={toMediaUrl(img.url)}
                            alt={img.fileName || `img-${img.id}`}
                            style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 6 }}
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
                        className={`p-1 border rounded ${String(idImage) === String(img.id) ? 'border-primary' : 'border-200'}`}
                        style={{ width: 120 }}
                        title={img.fileName || img.url}
                      >
                        <img
                          src={toMediaUrl(img.url)}
                          alt={img.fileName || `img-${img.id}`}
                          style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 6 }}
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
                <button type="button" className="btn btn-secondary me-2" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-dark">
                  {isEditing ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
