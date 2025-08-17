import React, { useState, useEffect } from 'react';
import '../../App.css';
import { useSelector, useDispatch } from 'react-redux';
import {
  getPromotionRequest,
  addPromotionRequest,
  updatePromotionRequest,
  deletePromotionRequest
} from '../../lib/actions/PromotionActions';
import { getProductUserRequest } from '../../lib/actions/ProductActions';
import { updateCartRequest, getCartRequest } from '../../lib/actions/CartActions';

export const PromotionAdmin = () => {
  const promotionsFromStore = useSelector((state) => state.promotions.promotions) || [];
  const productsFromStore   = useSelector((state) => state.products.products) || [];
  // Panier : store puis fallback localStorage
  const cartItems = useSelector((s) => s?.items?.items) ?? JSON.parse(localStorage.getItem('items') || '[]');

  const dispatch = useDispatch();

  const [showModal, setShowModal]       = useState(false);
  const [isEditing, setIsEditing]       = useState(false);
  const [currentId, setCurrentId]       = useState(null);
  const [searchQuery, setSearchQuery]   = useState('');
  const [formData, setFormData] = useState({
    idProduct: '',
    purcentage: 0,
    startDate: '',
    endDate: ''
  });

  // charge données au montage
  useEffect(() => {
    dispatch(getPromotionRequest());
    dispatch(getProductUserRequest());
    dispatch(getCartRequest());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getCartRequest());
  }, [cartItems, dispatch]);

  // ===== Utils dates & prix =====
  const parseDate = (val) => {
    if (!val) return null;
    const d = new Date(val);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  // True si la promo est active (start <= now <= end)
  const isPromoActive = (promo, nowMs = Date.now()) => {
    const start = parseDate(promo?.startDate);
    const end   = parseDate(promo?.endDate);
    // on considère la fin à la fin de la journée
    const endMs = end ? (end.getTime() + 24*60*60*1000 - 1) : null;
    const startsOk = !start || start.getTime() <= nowMs;
    const endsOk   = !end   || nowMs <= endMs;
    return startsOk && endsOk;
  };

  // retourne la première promo ACTIVE d’un produit (tu peux changer le tri si besoin)
  const getActivePromoForProduct = (productId, promos) => {
    const nowMs = Date.now();
    return (promos || [])
      .filter(p => String(p.idProduct) === String(productId))
      .filter(p => isPromoActive(p, nowMs))
      .sort((a, b) => {
        // plus récente d'abord (par startDate si dispo, sinon dateCreation)
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

  // util: écrire prix dans localStorage.items
  const writeCartPriceToLocalStorage = (productId, newPrice) => {
    const ls = JSON.parse(localStorage.getItem('items') || '[]');
    const next = ls.map(it =>
      String(it.id) === String(productId) ? { ...it, price: Number(newPrice) } : it
    );
    localStorage.setItem('items', JSON.stringify(next));
    return next;
  };

  // met à jour (Redux + localStorage) le prix d’un produit dans le panier
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

  // ===== UI =====
  // ESC + bloque le scroll quand la modale est ouverte
  useEffect(() => {
    document.body.classList.toggle('no-scroll', showModal);
    const onKey = (e) => { if (e.key === 'Escape') setShowModal(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
    };
  }, [showModal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ idProduct: '', purcentage: 0, startDate: '', endDate: '' });
    setShowModal(true);
  };

  const handleEditClick = (promo) => {
    setIsEditing(true);
    setCurrentId(promo.id);
    setFormData({
      idProduct: promo?.idProduct ?? '',
      purcentage: promo?.purcentage ?? 0,
      startDate: promo?.startDate ? String(promo.startDate).slice(0, 10) : '',
      endDate:   promo?.endDate   ? String(promo.endDate).slice(0, 10)   : ''
    });
    setShowModal(true);
  };

  const handleDeleteClick = async (id) => {
    // on mémorise le produit impacté
    const doomed = promotionsFromStore.find(p => p.id === id);
    const productId = doomed?.idProduct;

    if (window.confirm('Supprimer cette promotion ?')) {
      await dispatch(deletePromotionRequest(id));

      // recalcul immédiat du prix effectif après suppression
      if (productId) {
        const product = productsFromStore.find(p => String(p.id) === String(productId));
        if (product) {
          const nextPromos = promotionsFromStore.filter(p => p.id !== id);
          const active = getActivePromoForProduct(productId, nextPromos);
          const nextPrice = computePriceWithPromo(product, active); // si plus de promo active => prix TTC
          syncCartPrice(productId, nextPrice);
        }
      }

      await dispatch(getPromotionRequest());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      id: currentId,
      idProduct: formData.idProduct,
      purcentage: Number(formData.purcentage) || 0,
      startDate: formData.startDate,
      endDate: formData.endDate
    };

    if (isEditing) {
      await dispatch(updatePromotionRequest(payload));
    } else {
      const { id, ...createPayload } = payload;
      await dispatch(addPromotionRequest(createPayload));
    }

    // recalcul du prix : si la promo est expirée (end < today) => prix TTC
    const product = productsFromStore.find(p => String(p.id) === String(formData.idProduct));
    if (product) {
      // on part de la liste actuelle, et on remplace/ajoute virtuellement la promo courante
      let projected = [...promotionsFromStore];
      if (isEditing) {
        projected = projected.map(p => p.id === currentId ? { ...p, ...payload } : p);
      } else {
        projected = [{ ...payload, id: 'tmp' }, ...projected];
      }

      const active = getActivePromoForProduct(formData.idProduct, projected);
      const nextPrice = computePriceWithPromo(product, active);
      syncCartPrice(formData.idProduct, nextPrice);
    }

    await dispatch(getPromotionRequest());
    setShowModal(false);
  };

  const getProductName = (id) => {
    const product = productsFromStore.find(p => p.id === id);
    return product ? product.name : 'Produit inconnu';
  };

  // Tri par date de création (récent -> ancien)
  const sortedPromotions = [...promotionsFromStore].sort((a, b) => {
    const dateA = new Date(a?.dateCreation || 0);
    const dateB = new Date(b?.dateCreation || 0);
    return dateB - dateA;
  });

  // Filtrage par nom de produit
  const filteredPromotions = sortedPromotions.filter((promo) => {
    const productName = (getProductName(promo.idProduct) || '').toLowerCase();
    return productName.includes((searchQuery || '').toLowerCase());
  });

  return (
    <div className='container py-5'>
      <h1 className="text-center mb-4">Gestion des promotions</h1>

      <div className="d-flex justify-content-between mb-3">
        <input
          type="text"
          placeholder="Rechercher par produit..."
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
              <th>Pourcentage</th>
              <th>Date début</th>
              <th>Date fin</th>
              <th>Création</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPromotions.map((promo) => (
              <tr key={promo.id} onClick={() => handleEditClick(promo)} style={{ cursor: 'pointer' }}>
                <td>{getProductName(promo.idProduct)}</td>
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
                <td colSpan="6" className="text-center">Aucune promotion trouvée.</td>
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
              <div className="mb-3">
                <label>Produit</label>
                <select
                  name="idProduct"
                  className="form-select"
                  value={formData.idProduct}
                  onChange={handleInputChange}
                  required
                  autoFocus
                >
                  <option value="">Sélectionnez un produit</option>
                  {productsFromStore.map((product) => (
                    <option key={product.id} value={product.id}>
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
