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

export const CategoryAdmin = () => {
  const categoriesFromStore = useSelector((s) => s.categories.categories) || [];
  const imagesFromStore     = useSelector((s) => s.images.images) || [];
  const productsFromStore   = useSelector((s) => s.products.products) || [];
  const taxesFromStore      = useSelector((s) => s.taxes?.taxes) || [];
  const packageProfils      = useSelector((s) => s.packageProfils?.packageProfils) || [];
  const dispatch = useDispatch();

  const [showModal, setShowModal]                   = useState(false);
  const [isEditing, setIsEditing]                   = useState(false);
  const [currentId, setCurrentId]                   = useState(null);
  const [formData, setFormData]                     = useState({ name: '' });
  const [idImage, setIdImage]                       = useState('');
  const [selectedProductId, setSelectedProductId]   = useState('');
  const [selectedTaxIds, setSelectedTaxIds]         = useState([]); // string[]
  const [selectedPackageProfilId, setSelectedPackageProfilId] = useState(''); // string

  useEffect(() => {
    dispatch(getCategoryRequest());
    dispatch(getImageRequest());
    dispatch(getProductUserRequest());
    dispatch(getTaxeRequest());
    // Si besoin: dispatch(getPackageProfilRequest());  // seulement si tu as l'action
  }, [dispatch]);

  // bloque scroll + ESC quand la modale est ouverte
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

  // id du package profil dans une catégorie (multi variantes possibles)
  const getPkgIdFromCategory = (cat) =>
    cat?.idPackageProfil ??
    cat?.IdPackageProfil ??
    cat?.packageProfilId ??
    cat?.PackageProfilId ??
    cat?.idPackageProfile ??
    null;

  const packageProfilsById = useMemo(() => {
    const m = new Map();
    for (const p of packageProfils) {
      const id = p?.id ?? p?.Id;
      if (id != null) m.set(String(id), p);
    }
    return m;
  }, [packageProfils]);

  const getPackageProfilName = (cat) => {
    const pid = getPkgIdFromCategory(cat);
    if (pid == null) return '—';
    const pp = packageProfilsById.get(String(pid));
    return pp?.name ?? pp?.Name ?? `#${pid}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Taxes ↔ IDs (depuis noms CSV potentiels en base)
  const extractTaxIdsFromCategory = (cat, taxesList) => {
    if (!cat) return [];
    const rawNames = String(cat.taxes ?? cat.taxeName ?? '').trim();
    if (!rawNames) return [];
    const tokens = csvToArray(rawNames);
    const ids = tokens
      .map((tok) => {
        if (/^\d+$/.test(tok)) return tok; // déjà un id
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
    setFormData({ name: '' });
    setIdImage('');
    setSelectedProductId('');
    setSelectedTaxIds([]);
    setSelectedPackageProfilId('');
    setShowModal(true);
  };

  const handleEditClick = (category) => {
    setIsEditing(true);
    setCurrentId(category.id);
    setFormData({ id: category.id, name: category.name });

    // Pré-sélection du package profil
    const pkgId = getPkgIdFromCategory(category);
    setSelectedPackageProfilId(pkgId != null ? String(pkgId) : '');

    // Image liée
    const img = imagesFromStore.find((i) => Number(i.idCategory) === Number(category.id));
    setIdImage(img ? String(img.id) : '');

    // Produit (pour grille d’images)
    const productsInCat = productsFromStore.filter((p) => Number(p.idCategory) === Number(category.id));
    if (img?.idProduct) setSelectedProductId(String(img.idProduct));
    else if (productsInCat.length > 0) setSelectedProductId(String(productsInCat[0].id));
    else setSelectedProductId('');

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

    const idsTaxesCsv = selectedTaxIds.join(',');
    const pkgIdNum =
      selectedPackageProfilId !== '' ? Number(selectedPackageProfilId) : null;

    if (isEditing) {
      await dispatch(updateCategoryRequest({
        id: currentId,
        name: formData.name,
        idTaxe: idsTaxesCsv,             // adapte si besoin côté API
        idPackageProfil: pkgIdNum,       // ✅ envoi de l’id package profil
        IdPackageProfil: pkgIdNum,       // (fallback si casse différente)
      }));
      if (idImage) {
        await dispatch(updateImageRequest({ id: Number(idImage), idCategory: Number(currentId) }));
      }
    } else {
      const addPayload = {
        name: formData.name,
        idsTaxes: idsTaxesCsv,
        idPackageProfil: pkgIdNum,
        IdPackageProfil: pkgIdNum,
      };
      await dispatch(addCategoryRequest(addPayload));
      await dispatch(getCategoryRequest());

      // retrouve l'id créé si nécessaire, puis lie l'image choisie
      const created = [...categoriesFromStore]
        .reverse()
        .find((c) => c.name === formData.name);
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
    const image = imagesFromStore.find((i) => Number(i.idCategory) === Number(idCategory));
    return image ? image.url : '/Images/placeholder.jpg';
  };

  const getCategoryId = (catName) => {
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

  const productsInCurrentCategory = useMemo(() => {
    if (!isEditing || !currentId) return [];
    return productsFromStore.filter(
      (p) => Number(getCategoryId(p.category)) === Number(currentId)
    );
  }, [isEditing, currentId, productsFromStore]);

  const imagesOfSelectedProduct = useMemo(() => {
    if (!isEditing || !selectedProductId) return [];
    return imagesFromStore.filter((img) => Number(img.idProduct) === Number(selectedProductId));
  }, [isEditing, selectedProductId, imagesFromStore]);

  const imagesForCreate = useMemo(() => {
    if (isEditing) return [];
    return imagesFromStore.filter((i) => !i.idCategory);
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
              <th>Package profil</th>{/* ✅ nouvelle colonne */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedCategories.map((cat) => (
              <tr key={cat.id} onClick={() => handleEditClick(cat)} style={{ cursor: 'pointer' }}>
                <td><img src={getCategoryImage(cat.id)} width={100} alt={cat.name} /></td>
                <td>{cat.name}</td>
                <td>{getCategoryTaxNames(cat)}</td>
                <td>{getPackageProfilName(cat)}</td>{/* ✅ affichage du nom */}
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

              {/* ✅ Sélecteur Package profil (toujours AVANT les images) */}
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

              {/* Taxes associées (checkbox) */}
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

              {/* Sélection d'images (inchangé, juste déplacé après le package profil) */}
              {isEditing ? (
                <>
                  <div className="mb-3">
                    <label>Produits de cette catégorie</label>
                    <select
                      className="form-select mt-2"
                      value={selectedProductId}
                      onChange={(e) => {
                        setSelectedProductId(e.target.value);
                        setIdImage('');
                      }}
                    >
                      {productsInCurrentCategory.length === 0 && (
                        <option value="">Aucun produit dans cette catégorie</option>
                      )}
                      {productsInCurrentCategory.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name || p.title || `Produit #${p.id}`}
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
                          className={`p-1 border rounded ${String(idImage) === String(img.id) ? 'border-primary' : 'border-200'}`}
                          style={{ width: 120 }}
                          title={img.fileName || img.url}
                        >
                          <img
                            src={img.url}
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
                          src={img.url}
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
