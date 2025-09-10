import React, { useEffect, useMemo, useState } from 'react';
import '../../App.css';
import { useSelector, useDispatch } from 'react-redux';
import {
  getPromotionCodesRequest,
  addPromotionCodeRequest,
  updatePromotionCodeRequest,
  deletePromotionCodeRequest
} from '../../lib/actions/PromotionCodeActions';
import { getProductUserRequest } from '../../lib/actions/ProductActions';
import { updateCartRequest, getCartRequest } from '../../lib/actions/CartActions';

export const PromotionCodeAdmin = () => {
  const dispatch = useDispatch();

  // ===== Store =====
  const promotionCodesFromStore = useSelector((s) => s.promotionCodes?.promotionCodes) || [];
  const productsFromStore       = useSelector((s) => s.products?.products) || [];
  const categoriesFromStore     = useSelector((s) => s.categories?.categories) || [];
  const subCategoriesFromStore  = useSelector((s) => s.subCategories?.subCategories) || [];
  const cartItems               = useSelector((s) => s?.items?.items) ?? JSON.parse(localStorage.getItem('items') || '[]');

  // ===== UI =====
  const [showModal, setShowModal]     = useState(false);
  const [isEditing, setIsEditing]     = useState(false);
  const [currentId, setCurrentId]     = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ===== Form =====
  const [formData, setFormData] = useState({
    name: '',
    idProduct: '',      // string | ''
    idCategory: '',     // string | ''
    idSubCategory: '',  // string | ''
    purcentage: 0,
    startDate: '',
    endDate: '',
    isUsed: false,
  });

  // Sélections pilotant les listes
  const [selectedCategoryId, setSelectedCategoryId]       = useState(''); // string
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(''); // string

  // ===== Helpers =====
  const parseDate = (val) => {
    if (!val) return null;
    const d = new Date(val);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const isPromoActive = (promo, nowMs = Date.now()) => {
    const start = parseDate(promo?.startDate);
    const end   = parseDate(promo?.endDate);
    const endMs = end ? (end.getTime() + 24 * 60 * 60 * 1000 - 1) : null;
    const startsOk = !start || start.getTime() <= nowMs;
    const endsOk   = !end   || nowMs <= endMs;
    return startsOk && endsOk;
  };

  const getActivePromoForProduct = (productId, promos) => {
    const nowMs = Date.now();
    return (promos || [])
      .filter(p => String(p.idProduct) === String(productId))
      .filter(p => isPromoActive(p, nowMs))
      .sort((a, b) => {
        const aKey = parseDate(a.startDate)?.getTime() ?? parseDate(a.dateCreation)?.getTime() ?? 0;
        const bKey = parseDate(b.startDate)?.getTime() ?? parseDate(b.dateCreation)?.getTime() ?? 0;
        return bKey - aKey;
      })[0] || null;
  };

  const computePriceWithPromo = (product, promo) => {
    const base = Number(product?.priceTtc ?? product?.price ?? 0);
    if (!promo || !isPromoActive(promo)) return base;
    const pct = Number(promo.purcentage) || 0;
    return +(base * (1 - pct / 100)).toFixed(2);
  };

  const writeCartPriceToLocalStorage = (productId, newPrice) => {
    const ls = JSON.parse(localStorage.getItem('items') || '[]');
    const next = ls.map(it =>
      String(it.id) === String(productId) ? { ...it, price: Number(newPrice) } : it
    );
    localStorage.setItem('items', JSON.stringify(next));
    return next;
  };

  const syncCartPrice = (productId, price) => {
    const inStore = (cartItems || []).find(ci => String(ci.id) === String(productId));
    const qty = inStore?.qty ?? 1;

    if (inStore) {
      const updated = { ...inStore, price: Number(price) };
      dispatch(updateCartRequest(updated, qty));
    }
    writeCartPriceToLocalStorage(productId, price);
    dispatch(getCartRequest());
  };

  // ===== Id helpers robustes =====
  // Map nom (ou title) de catégorie -> id (string)
  const categoryNameToId = useMemo(() => {
    const m = new Map();
    (categoriesFromStore || []).forEach(c => {
      const id = c?.id ?? c?.Id;
      const names = [c?.name, c?.title, c?.Name, c?.Title].filter(Boolean);
      names.forEach(n => {
        m.set(String(n).trim().toLowerCase(), String(id));
      });
    });
    return m;
  }, [categoriesFromStore]);

  const getCategoryIdFromProduct = (p) => {
    // 1) Id direct
    const direct =
      p?.idCategory ?? p?.categoryId ?? p?.idCategorie ?? p?.categorieId ?? p?.category?.id;
    if (direct != null && /^\d+$/.test(String(direct))) {
      return String(direct);
    }
    // 2) Nom -> id
    const name = (p?.categoryName ?? p?.category ?? p?.categorie ?? p?.Category ?? '')
      .toString()
      .trim()
      .toLowerCase();
    if (name) {
      const mapped = categoryNameToId.get(name);
      if (mapped) return mapped;
    }
    return null;
  };

  const getSubCategoryIdFromProduct = (p) =>
    p?.idSubCategory ?? p?.subCategoryId ?? p?.IdSubCategory ?? null;

  const getCategoryIdFromSubCategory = (sc) =>
    sc?.idCategory ?? sc?.IdCategory ?? sc?.categoryId ?? null;

  // Maps rapides
  const categoriesById = useMemo(() => {
    const m = new Map();
    categoriesFromStore.forEach(c => {
      const id = c?.id ?? c?.Id;
      if (id != null) m.set(String(id), c);
    });
    return m;
  }, [categoriesFromStore]);

  const subCategoriesById = useMemo(() => {
    const m = new Map();
    subCategoriesFromStore.forEach(sc => {
      const id = sc?.id ?? sc?.Id;
      if (id != null) m.set(String(id), sc);
    });
    return m;
  }, [subCategoriesFromStore]);

  // ===== Chargement =====
  useEffect(() => {
    dispatch(getPromotionCodesRequest());
    dispatch(getProductUserRequest());
    dispatch(getCartRequest());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getCartRequest());
  }, [cartItems, dispatch]);

  // Quand la liste des codes promo change, on recharge aussi les produits
  useEffect(() => {
    dispatch(getProductUserRequest());
  }, [promotionCodesFromStore, dispatch]);

  // ======= 🔁 MAJ PRIX PANIER via priceTtcCategoryCodePromoted =======
  const toNumOrNull = (v) => {
    if (v === null || v === undefined) return null;
    if (String(v).toLowerCase() === 'null') return null;
    const n = typeof v === 'number' ? v : parseFloat(v);
    return Number.isFinite(n) ? n : null;
  };

  useEffect(() => {
    const ls = JSON.parse(localStorage.getItem('items') || '[]');
    if (!Array.isArray(ls) || ls.length === 0) return;

    ls.forEach((it) => {
      const prod = productsFromStore.find(p => String(p.id) === String(it.id));
      if (!prod) return;

      const catPrice = toNumOrNull(prod?.priceTtcCategoryCodePromoted);
      if (catPrice == null) return;

      const current = toNumOrNull(it.price);
      if (current == null || Math.abs(current - catPrice) > 0.001) {
        syncCartPrice(it.id, catPrice);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productsFromStore]);

  // ===== Lock body scroll quand modal ouverte =====
  useEffect(() => {
    document.body.classList.toggle('no-scroll', showModal);
    const onKey = (e) => { if (e.key === 'Escape') setShowModal(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
    };
  }, [showModal]);

  // ===== Listes filtrées =====

  // Sous-catégories en fonction de la catégorie choisie
  const filteredSubCategories = useMemo(() => {
    if (!selectedCategoryId) return subCategoriesFromStore;
    return subCategoriesFromStore.filter(
      (sc) => String(getCategoryIdFromSubCategory(sc)) === String(selectedCategoryId)
    );
  }, [subCategoriesFromStore, selectedCategoryId]);

  // Produits (priorité sous-catégorie, sinon catégorie)
  const filteredProductsForModal = useMemo(() => {
    let base = productsFromStore;

    if (selectedSubCategoryId) {
      base = base.filter(
        (p) => String(getSubCategoryIdFromProduct(p)) === String(selectedSubCategoryId)
      );
    } else if (selectedCategoryId) {
      base = base.filter(
        (p) => String(getCategoryIdFromProduct(p)) === String(selectedCategoryId)
      );
    }

    // garder le produit déjà choisi même s'il ne matche plus (édition)
    if (formData.idProduct) {
      const exists = base.some(p => String(p.id) === String(formData.idProduct));
      if (!exists) {
        const picked = productsFromStore.find(p => String(p.id) === String(formData.idProduct));
        if (picked) base = [...base, picked];
      }
    }

    return [...base].sort((a, b) =>
      String(a?.name || '').localeCompare(String(b?.name || ''), 'fr', { sensitivity: 'base' })
    );
  }, [
    productsFromStore,
    selectedCategoryId,
    selectedSubCategoryId,
    formData.idProduct,
    categoryNameToId, // <= important si mapping nom->id change
  ]);

  // Si la sous-cat sélectionnée n’appartient plus à la catégorie, on la reset
  useEffect(() => {
    if (!selectedSubCategoryId || !selectedCategoryId) return;
    const sc = subCategoriesById.get(String(selectedSubCategoryId));
    if (!sc) return;
    const scCatId = getCategoryIdFromSubCategory(sc);
    if (String(scCatId) !== String(selectedCategoryId)) {
      setSelectedSubCategoryId('');
      setFormData(prev => ({ ...prev, idSubCategory: '', idProduct: '' }));
    }
  }, [selectedCategoryId, selectedSubCategoryId, subCategoriesById]);

  // Resync Cat/SubCat quand on choisit un produit manuellement
  useEffect(() => {
    if (!formData.idProduct) return;
    const prod = productsFromStore.find(p => String(p.id) === String(formData.idProduct));
    if (!prod) return;

    const scId  = getSubCategoryIdFromProduct(prod);
    const catId = scId
      ? getCategoryIdFromSubCategory(subCategoriesById.get(String(scId)))
      : getCategoryIdFromProduct(prod);

    if (catId != null && String(catId) !== String(selectedCategoryId)) {
      setSelectedCategoryId(String(catId));
    }
    if (scId != null && String(scId) !== String(selectedSubCategoryId)) {
      setSelectedSubCategoryId(String(scId));
    }
  }, [formData.idProduct, productsFromStore, selectedCategoryId, selectedSubCategoryId, subCategoriesById]);

  // ===== Handlers =====
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: !!checked }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: name === 'idProduct' ? String(value) : value }));
  };

  const handleCategoryChange = (e) => {
    const catId = String(e.target.value);
    setSelectedCategoryId(catId);
    // reset sous-cat & produit pour cohérence
    setSelectedSubCategoryId('');
    setFormData((prev) => ({ ...prev, idCategory: catId, idSubCategory: '', idProduct: '' }));
  };

  const handleSubCategoryChange = (e) => {
    const scId = String(e.target.value);
    setSelectedSubCategoryId(scId);
    // reset produit quand on change de sous-cat
    setFormData((prev) => ({ ...prev, idSubCategory: scId, idProduct: '' }));
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentId(null);
    setSelectedCategoryId('');
    setSelectedSubCategoryId('');
    setFormData({
      name: '',
      idProduct: '',
      idCategory: '',
      idSubCategory: '',
      purcentage: 0,
      startDate: '',
      endDate: '',
      isUsed: false
    });
    setShowModal(true);
  };

  const findProductByPromo = (promo) => {
    return (
      productsFromStore.find(p => String(p.id) === String(promo?.idProduct)) ||
      productsFromStore.find(p => String(p.idPromotionCode) === String(promo?.id)) ||
      null
    );
  };

  const handleEditClick = (promo) => {
    setIsEditing(true);
    setCurrentId(promo.id);

    const prod = findProductByPromo(promo);
    const subCatFromPromo = promo?.idSubCategory ?? '';
    const subCatFromProd  = prod ? getSubCategoryIdFromProduct(prod) : '';
    const scIdStr         = String(subCatFromPromo || subCatFromProd || '');

    const catFromPromo    = promo?.idCategory ?? '';
    let catFromSubCat     = '';
    if (scIdStr) {
      const sc = subCategoriesById.get(String(scIdStr));
      catFromSubCat = sc ? getCategoryIdFromSubCategory(sc) : '';
    }
    const catFromProd     = prod ? getCategoryIdFromProduct(prod) : '';
    const catIdStr        = String(catFromPromo || catFromSubCat || catFromProd || '');

    setSelectedCategoryId(catIdStr || '');
    setSelectedSubCategoryId(scIdStr || '');

    setFormData({
      name: promo?.name ?? '',
      idProduct: prod ? String(prod.id) : (promo?.idProduct ? String(promo.idProduct) : ''),
      idCategory: catIdStr || '',
      idSubCategory: scIdStr || '',
      purcentage: promo?.purcentage ?? 0,
      startDate: promo?.startDate ? String(promo.startDate).slice(0, 10) : '',
      endDate:   promo?.endDate   ? String(promo.endDate).slice(0, 10)   : '',
      isUsed: !!promo?.isUsed
    });

    setShowModal(true);
  };

  const handleDeleteClick = async (id) => {
    const doomed = promotionCodesFromStore.find(p => p.id === id);
    const productId = doomed?.idProduct;

    if (window.confirm('Supprimer cette promotion ?')) {
      await dispatch(deletePromotionCodeRequest(id));

      if (productId) {
        const product = productsFromStore.find(p => String(p.id) === String(productId));
        if (product) {
          const nextPromos = promotionCodesFromStore.filter(p => p.id !== id);
          const active     = getActivePromoForProduct(productId, nextPromos);
          const nextPrice  = computePriceWithPromo(product, active);
          syncCartPrice(productId, nextPrice);
        }
      }

      await dispatch(getPromotionCodesRequest());
      await dispatch(getProductUserRequest());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasSub = !!selectedSubCategoryId;
    const idProductToSend  = formData.idProduct ? String(formData.idProduct) : null;

    let idCategoryToSend    = null;
    let idSubCategoryToSend = null;

    if (hasSub) {
      // sous-catégorie prioritaire
      idSubCategoryToSend = String(selectedSubCategoryId);
      idCategoryToSend    = null; // on neutralise la catégorie
      // si pas de produit sélectionné, idProductToSend reste null
    } else {
      // pas de sous-cat → on cible la catégorie si fournie
      idSubCategoryToSend = null;
      idCategoryToSend    = selectedCategoryId || formData.idCategory || null;
    }

    const payload = {
      id: currentId,
      name: formData.name,
      idProduct: idProductToSend,
      idCategory: selectedCategoryId,
      idSubCategory: idSubCategoryToSend,
      purcentage: Number(formData.purcentage) || 0,
      startDate: formData.startDate,
      endDate: formData.endDate,
      isUsed: !!formData.isUsed
    };

    if (isEditing) {
      await dispatch(updatePromotionCodeRequest(payload));
    } else {
      const { id, ...createPayload } = payload;
      await dispatch(addPromotionCodeRequest(createPayload));
    }

    await dispatch(getPromotionCodesRequest());
    await dispatch(getProductUserRequest());
    setShowModal(false);
  };

  // ===== Affichage tableau (helpers noms) =====
  const getRowProductName = (promo) => {
    const prod =
      productsFromStore.find(p => String(p.id) === String(promo?.idProduct)) ||
      productsFromStore.find(p => String(p.idPromotionCode) === String(promo?.id));
    return prod?.name || prod?.title || 'NONE';
  };

  const getRowCategoryName = (promo) => {
    const category = categoriesFromStore.find(sc => sc.idPromotionCode === promo.id);
    if (category) return category.name
    else return "NONE";
  };

  const getRowSubCategoryName = (promo) => {

    const subCategory = subCategoriesFromStore.find(sc => sc.idPromotionCode === promo.id);
    if (subCategory) return subCategory.name
    else return "NONE";
  };

  // Tri + filtre tableau
  const sortedPromotions = [...promotionCodesFromStore].sort((a, b) => {
    const dateA = new Date(a?.dateCreation || 0);
    const dateB = new Date(b?.dateCreation || 0);
    return dateB - dateA;
  });

  const filteredPromotions = sortedPromotions.filter((promo) => {
    const productName = (getRowProductName(promo) || '').toLowerCase();
    const codeName    = (promo?.name || '').toLowerCase();
    const q           = (searchQuery || '').toLowerCase();
    return productName.includes(q) || codeName.includes(q);
  });

  // ===== Render =====
  return (
    <div className='container py-5'>
      <h1 className="text-center mb-4">Gestion des promotions (codes)</h1>

      <div className="d-flex justify-content-between mb-3">
        <input
          type="text"
          placeholder="Rechercher par produit ou code..."
          className="form-control w-50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className='btn btn-success ms-2' onClick={handleAddClick}>
          Ajouter une promotion
        </button>
      </div>

      <div className='table-responsive'>
        <table className='table table-striped table-hover shadow-sm'>
          <thead className='table-dark'>
            <tr>
              <th>Produit</th>
              <th>Catégorie</th>
              <th>Sous Catégorie</th>
              <th>Code</th>
              <th>Pourcentage</th>
              <th>Date début</th>
              <th>Date fin</th>
              <th>Création</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPromotions.map((promo) => (
              <tr
                key={promo.id}
                onClick={() => handleEditClick(promo)}
                style={{ cursor: 'pointer' }}
              >
                <td className={getRowProductName(promo) !== 'NONE' ? 'fw-bold text-primary' : 'fw-bold text-danger'}>{getRowProductName(promo)}</td>
                <td className='fw-bold text-muted'>{getRowCategoryName(promo)}</td>
                <td className='fw-bold text-muted'>{getRowSubCategoryName(promo)}</td>
                <td>{promo.name}</td>
                <td>{promo.purcentage}%</td>
                <td className='text-success fw-bold'>
                  {promo?.startDate ? new Date(promo.startDate).toLocaleDateString() : '—'}
                </td>
                <td className='text-danger fw-bold'>
                  {promo?.endDate ? new Date(promo.endDate).toLocaleDateString() : '—'}
                </td>
                <td>{promo?.dateCreation ? new Date(promo.dateCreation).toLocaleDateString() : '—'}</td>
                <td>
                  <button
                    className='btn btn-sm btn-warning me-2'
                    onClick={(e) => { e.stopPropagation(); handleEditClick(promo); }}
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button
                    className='btn btn-sm btn-danger'
                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(promo.id); }}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
            {filteredPromotions.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center">Aucune promotion trouvée.</td>
              </tr>
            )}
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
            aria-labelledby="promo-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="promo-modal-title" className="mb-3">
              {isEditing ? 'Modifier la promotion' : 'Ajouter une promotion'}
            </h2>

            <form onSubmit={handleSubmit}>
              {/* Code (name) */}
              <div className="mb-3">
                <label>Code</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="ex: CODEPROMO10"
                  required
                />
              </div>

              {/* Catégorie */}
              <div className="mb-3">
                <label>Catégorie</label>
                <select
                  name="idCategory"
                  className="form-select"
                  value={selectedCategoryId}
                  onChange={handleCategoryChange}
                >
                  <option value="">Toutes les catégories</option>
                  {categoriesFromStore.map((cat) => (
                    <option key={cat.id ?? cat.Id} value={String(cat.id ?? cat.Id)}>
                      {cat.name || cat.title || `Catégorie ${cat.id ?? cat.Id}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sous-catégorie (dépend de la catégorie) */}
              <div className="mb-3">
                <label>Sous Catégorie (facultatif)</label>
                <select
                  name="idSubCategory"
                  className="form-select"
                  value={selectedSubCategoryId}
                  onChange={handleSubCategoryChange}
                >
                  <option value="">— Aucune —</option>
                  {filteredSubCategories.map((sc) => (
                    <option key={sc.id ?? sc.Id} value={String(sc.id ?? sc.Id)}>
                      {sc.name || sc.title || `Sous-catégorie ${sc.id ?? sc.Id}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Produit (filtré par sous-catégorie prioritairement, sinon catégorie) */}
              <div className="mb-3">
                <label>Produit (facultatif)</label>
                <select
                  name="idProduct"
                  className="form-select"
                  value={formData.idProduct}
                  onChange={handleInputChange}
                >
                  <option value="">— Sélectionnez un produit —</option>
                  {filteredProductsForModal.map((product) => (
                    <option key={product.id} value={String(product.id)}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label>Pourcentage (%)</label>
                <input
                  type="number"
                  name="purcentage"
                  className="form-control"
                  value={formData.purcentage}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.01"
                  required
                />
              </div>

              <div className="mb-3">
                <label>Date de début</label>
                <input
                  type="date"
                  name="startDate"
                  className="form-control"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label>Date de fin</label>
                <input
                  type="date"
                  name="endDate"
                  className="form-control"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isUsed"
                  name="isUsed"
                  checked={!!formData.isUsed}
                  onChange={handleInputChange}
                />
                <label className="form-check-label" htmlFor="isUsed">
                  Est utilisé
                </label>
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
