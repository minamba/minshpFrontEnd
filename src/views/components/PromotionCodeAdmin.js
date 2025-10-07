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
import { calculPrice } from '../../lib/utils/Helpers';

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
    generalCartAmount: '' // NEW: montant pour panier global (number | '')
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

  // ===== BULK SYNC selon Cat / Sous-cat (MAJEUR) =====
  const getCategoryIdFromProduct = (p) => {
    const direct =
      p?.idCategory ?? p?.categoryId ?? p?.idCategorie ?? p?.categorieId ?? p?.category?.id;
    if (direct != null && /^\d+$/.test(String(direct))) return String(direct);
    const name = (p?.categoryName ?? p?.category ?? p?.categorie ?? p?.Category ?? '')
      .toString().trim().toLowerCase();
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

  const bulkSyncCartByCategoryOrSubcategory = ({ categoryId = null, subCategoryId = null }) => {
    const ls = JSON.parse(localStorage.getItem('items') || '[]');
    if (!Array.isArray(ls) || ls.length === 0) return;

    const idsInCart = new Set(ls.map(it => String(it.id)));
    const affected = productsFromStore.filter(p => {
      if (!idsInCart.has(String(p.id))) return false;
      if (subCategoryId) return String(getSubCategoryIdFromProduct(p)) === String(subCategoryId);
      if (categoryId)    return String(getCategoryIdFromProduct(p)) === String(categoryId);
      return false;
    });

    affected.forEach(p => {
      const newPrice = calculPrice(p);
      if (newPrice == null) return;
      const current = ls.find(it => String(it.id) === String(p.id))?.price;
      if (current == null || Math.abs(Number(current) - Number(newPrice)) > 0.001) {
        syncCartPrice(p.id, newPrice);
      }
    });
  };

  // ===== Id helpers robustes =====
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

  // Fallbacks par idPromotionCode (édition)
  const findCategoryIdForPromo = (promoId) => {
    const cat = categoriesFromStore.find(c => String(c?.idPromotionCode) === String(promoId));
    return cat?.id ?? cat?.Id ?? null;
  };
  const findSubCategoryIdForPromo = (promoId) => {
    const sc = subCategoriesFromStore.find(s => String(s?.idPromotionCode) === String(promoId));
    return sc?.id ?? sc?.Id ?? null;
  };

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

  useEffect(() => {
    dispatch(getProductUserRequest());
  }, [promotionCodesFromStore, dispatch]);

  // ======= 🔁 MAJ PRIX PANIER via calculPrice à chaque MAJ produits =======
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

      const catPrice = calculPrice(prod);
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
  const filteredSubCategories = useMemo(() => {
    if (!selectedCategoryId) return subCategoriesFromStore;
    return subCategoriesFromStore.filter(
      (sc) => String(getCategoryIdFromSubCategory(sc)) === String(selectedCategoryId)
    );
  }, [subCategoriesFromStore, selectedCategoryId]);

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
    categoryNameToId,
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

    // NEW: parsing pour generalCartAmount
    if (name === 'generalCartAmount') {
      // Autoriser vide => '' ; sinon number
      const v = value === '' ? '' : Number(value);
      setFormData((prev) => ({ ...prev, generalCartAmount: Number.isFinite(v) ? v : '' }));
      return;
    }

    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: !!checked }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: name === 'idProduct' ? String(value) : value }));
  };

  const handleCategoryChange = (e) => {
    const catId = String(e.target.value);
    setSelectedCategoryId(catId);
    setSelectedSubCategoryId('');
    setFormData((prev) => ({ ...prev, idCategory: catId, idSubCategory: '', idProduct: '' }));
  };

  const handleSubCategoryChange = (e) => {
    const scId = String(e.target.value);
    setSelectedSubCategoryId(scId);
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
      isUsed: false,
      generalCartAmount: '' // NEW
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

    const scFromPromo   = promo?.idSubCategory ?? '';
    const scFromProd    = prod ? getSubCategoryIdFromProduct(prod) : '';
    const scFromLink    = findSubCategoryIdForPromo(promo?.id);
    const scId          = scFromPromo || scFromProd || scFromLink || '';

    const catFromPromo  = promo?.idCategory ?? '';
    const catFromSubCat = scId ? getCategoryIdFromSubCategory(subCategoriesById.get(String(scId))) : '';
    const catFromProd   = prod ? getCategoryIdFromProduct(prod) : '';
    const catFromLink   = findCategoryIdForPromo(promo?.id);
    const catId         = catFromPromo || catFromSubCat || catFromProd || catFromLink || '';

    const prodId        = prod ? String(prod.id) : (promo?.idProduct ? String(promo.idProduct) : '');

    setSelectedCategoryId(catId ? String(catId) : '');
    setSelectedSubCategoryId(scId ? String(scId) : '');

    setFormData({
      name: promo?.name ?? '',
      idProduct: prodId,
      idCategory: catId ? String(catId) : '',
      idSubCategory: scId ? String(scId) : '',
      purcentage: promo?.purcentage ?? 0,
      startDate: promo?.startDate ? String(promo.startDate).slice(0, 10) : '',
      endDate:   promo?.endDate   ? String(promo.endDate).slice(0, 10)   : '',
      isUsed: !!promo?.isUsed,
      generalCartAmount: (promo?.generalCartAmount ?? '') // NEW
    });

    setShowModal(true);
  };

  const handleDeleteClick = async (id) => {
    const doomed = promotionCodesFromStore.find(p => p.id === id);

    if (window.confirm('Supprimer cette promotion ?')) {
      await dispatch(deletePromotionCodeRequest(id));
      await dispatch(getPromotionCodesRequest());
      await dispatch(getProductUserRequest());

      // 🔁 MAJ panier selon la promo supprimée (sauf promo produit / panier global)
      if (!doomed?.idProduct && !toNumOrNull(doomed?.generalCartAmount)) {
        if (doomed?.idSubCategory) {
          bulkSyncCartByCategoryOrSubcategory({ subCategoryId: doomed.idSubCategory });
        } else if (doomed?.idCategory) {
          bulkSyncCartByCategoryOrSubcategory({ categoryId: doomed.idCategory });
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasProduct = !!formData.idProduct;
    const hasSub     = !!selectedSubCategoryId;
    const hasCat     = !!selectedCategoryId || !!formData.idCategory;

    const codeProvided = (formData.name || '').trim().length > 0;
    const amountNum = Number(formData.generalCartAmount);
    const amountProvided = Number.isFinite(amountNum) && amountNum > 0; // CHANGED: "saisie" => > 0

    // RÈGLE de validation:
    // si aucune cible (cat, subcat, produit) => code + generalCartAmount OBLIGATOIRES
    if (!hasCat && !hasSub && !hasProduct) {
      if (!codeProvided) {
        alert('Le code est obligatoire lorsque aucune catégorie / sous-catégorie / produit n’est sélectionné.');
        return;
      }
      if (!amountProvided) {
        alert('Le montant Panier (generalCartAmount) est obligatoire et doit être > 0 dans ce cas.');
        return;
      }
    }

    // Stratégie d’envoi:
    // - Si code + generalCartAmount sont saisis => FORCER idCategory/idSubCategory/idProduct à null
    // - Sinon, comportement normal (cat/subcat priorisées, puis produit éventuel)
    let idProductToSend  = hasProduct ? String(formData.idProduct) : null;
    let idCategoryToSend = null;
    let idSubCategoryToSend = null;

    if (codeProvided && amountProvided) {
      idProductToSend = null;
      idCategoryToSend = null;
      idSubCategoryToSend = null;
    } else {
      if (hasSub) {
        idSubCategoryToSend = String(selectedSubCategoryId);
        idCategoryToSend    = null;
      } else {
        idSubCategoryToSend = null;
        idCategoryToSend    = selectedCategoryId || formData.idCategory || null;
      }
    }

    const payload = {
      id: currentId,
      name: formData.name,
      idProduct: idProductToSend,
      idCategory: idCategoryToSend,
      idSubCategory: idSubCategoryToSend,
      purcentage: Number(formData.purcentage) || 0,
      startDate: formData.startDate,
      endDate: formData.endDate,
      isUsed: !!formData.isUsed,
      generalCartAmount: amountProvided ? amountNum : null // NEW
    };

    if (isEditing) {
      await dispatch(updatePromotionCodeRequest(payload));
    } else {
      const { id, ...createPayload } = payload;
      await dispatch(addPromotionCodeRequest(createPayload));
    }

    await dispatch(getPromotionCodesRequest());
    await dispatch(getProductUserRequest());

    // 🔁 MAJ panier après création/màj:
    // - Si PRODUIT ciblé => pas de MAJ (appliquée via Cart)
    // - Si SOUS-CAT ciblée => MAJ items concernés
    // - Si CAT ciblée => MAJ items concernés
    // - Si PANIER GLOBAL (generalCartAmount) => on ne touche pas ici (logique distincte)
    if (!amountProvided && !idProductToSend) {
      if (idSubCategoryToSend) {
        bulkSyncCartByCategoryOrSubcategory({ subCategoryId: idSubCategoryToSend });
      } else if (idCategoryToSend) {
        bulkSyncCartByCategoryOrSubcategory({ categoryId: idCategoryToSend });
      }
    }

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
  const noTargetSelected = !selectedCategoryId && !selectedSubCategoryId && !formData.idProduct; // NEW
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
              <th>Panier</th>
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
                <td className={getRowCategoryName(promo) !== 'NONE' ? 'fw-bold text-primary' : 'fw-bold text-danger'}>{getRowCategoryName(promo)}</td>
                <td className={getRowSubCategoryName(promo) !== 'NONE' ? 'fw-bold text-primary' : 'fw-bold text-danger'}>{getRowSubCategoryName(promo)}</td>
                <td className={promo?.generalCartAmount ? 'fw-bold text-primary' : 'fw-bold text-danger'}>
                  {promo?.generalCartAmount ? Number(promo.generalCartAmount) : 'NONE'}
                </td>
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
                <td colSpan="10" className="text-center">Aucune promotion trouvée.</td>
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
                  required={noTargetSelected} // CHANGED: obligatoire si aucune cible
                />
                {noTargetSelected && (
                  <small className="text-muted">Obligatoire si aucune catégorie / sous-catégorie / produit n’est sélectionné.</small>
                )}
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

              {/* Produit */}
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

              {/* NEW: Montant Panier Global */}
              <div className="mb-3">
                <label>Panier (generalCartAmount)</label>
                <input
                  type="number"
                  name="generalCartAmount"
                  className="form-control"
                  value={formData.generalCartAmount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required={noTargetSelected} // obligatoire si aucune cible
                />
                <small className="text-muted">
                  Saisir un montant &gt; 0 si la promo s’applique au panier entier (aucune catégorie / sous-catégorie / produit sélectionné).
                </small>
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
