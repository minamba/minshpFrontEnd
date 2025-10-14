import React, { useState, useEffect, useMemo } from 'react';
import '../../App.css';
import { useSelector, useDispatch } from 'react-redux';
import {
  getStockRequest,
  addStockRequest,
  updateStockRequest,
  deleteStockRequest
} from '../../lib/actions/StockActions';
import { getProductUserRequest } from '../../lib/actions/ProductActions';

export const StockAdmin = () => {
  const stocksFromStore     = useSelector((s) => s.stocks.stocks) || [];
  const productsFromStore   = useSelector((s) => s.products.products) || [];
  const categoriesFromStore = useSelector((s) => s.categories?.categories) || [];
  const dispatch = useDispatch();

  const [showModal, setShowModal]         = useState(false);
  const [isEditing, setIsEditing]         = useState(false);
  const [currentId, setCurrentId]         = useState(null);

  const [searchQuery, setSearchQuery]     = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(''); // ✅ filtre Catégorie
  const [selectedProductId, setSelectedProductId]   = useState(''); // ✅ filtre Produit

  const [formData, setFormData] = useState({
    quantity: 0,
    idProduct: ''
  });

  const collator = useMemo(() => new Intl.Collator('fr', { sensitivity: 'base' }), []);

  useEffect(() => {
    dispatch(getStockRequest());
    dispatch(getProductUserRequest());
  }, [dispatch]);

  // ESC + bloque le scroll quand la modale est ouverte
  useEffect(() => {
    if (showModal) document.body.classList.add('no-scroll');
    else document.body.classList.remove('no-scroll');

    const onKey = (e) => e.key === 'Escape' && setShowModal(false);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
    };
  }, [showModal]);

  // ------- Helpers -------
  const getCategoryById = (id) => categoriesFromStore.find(c => String(c.id) === String(id));
  const getProductById  = (id) => productsFromStore.find(p => String(p.id) === String(id));

  const getProductLabel = (p) => {
    if (!p) return 'Produit inconnu';
    const brand = p.brand ?? '';
    const model = p.model ?? '';
    return `${brand}${brand && model ? ' - ' : ''}${model}`.trim() || 'Produit';
  };

  const getProductName = (id) => getProductLabel(getProductById(id));

  // Catégorie d’un produit (prend idCategory si présent, sinon tente par nom)
  const getCategoryIdForProduct = (p) => {
    if (!p) return null;
    if (p.idCategory != null) return p.idCategory;
    if (p.category) {
      const byName = categoriesFromStore.find(c => c.name === p.category);
      return byName?.id ?? null;
    }
    return null;
  };
  const getCategoryIdForProductId   = (pid) => getCategoryIdForProduct(getProductById(pid));
  const getCategoryNameForProductId = (pid) => {
    const cid = getCategoryIdForProductId(pid);
    const c   = cid ? getCategoryById(cid) : null;
    return c ? c.name : 'Catégorie inconnue';
  };

  // ------- Tri des listes pour les filtres -------
  const sortedCategories = useMemo(() => {
    return [...categoriesFromStore].sort((a, b) =>
      collator.compare(a?.name ?? '', b?.name ?? '')
    );
  }, [categoriesFromStore, collator]);

  const sortedProducts = useMemo(() => {
    return [...productsFromStore].sort((a, b) =>
      collator.compare(getProductLabel(a), getProductLabel(b))
    );
  }, [productsFromStore, collator]);

  // Produits proposés dans les sélecteurs (filtrés par catégorie si sélectionnée)
  const productsForProductFilter = useMemo(() => {
    return selectedCategoryId
      ? sortedProducts.filter(p => String(getCategoryIdForProduct(p)) === String(selectedCategoryId))
      : sortedProducts;
  }, [sortedProducts, selectedCategoryId]);

  // Si on change la catégorie et que le produit choisi n’appartient plus, on réinitialise
  useEffect(() => {
    if (!selectedProductId || !selectedCategoryId) return;
    const prod = getProductById(selectedProductId);
    const prodCatId = getCategoryIdForProduct(prod);
    if (String(prodCatId) !== String(selectedCategoryId)) {
      setSelectedProductId('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }));
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ quantity: 0, idProduct: '' });
    setShowModal(true);
  };

  const handleEditClick = (stock) => {
    setIsEditing(true);
    setCurrentId(stock.id);
    setFormData({
      quantity: Number(stock.quantity) ?? 0,
      idProduct: stock.idProduct ?? ''
    });
    setShowModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Supprimer ce stock ?')) {
      await dispatch(deleteStockRequest(id));
      await dispatch(getStockRequest());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) {
      await dispatch(updateStockRequest({
        id: currentId,
        quantity: Number(formData.quantity),
        idProduct: formData.idProduct
      }));
    } else {
      await dispatch(addStockRequest({
        quantity: Number(formData.quantity),
        idProduct: formData.idProduct
      }));
    }
    await dispatch(getStockRequest());
    setShowModal(false);
  };

  // ------- Tri + filtres + recherche -------
  const sortedStocks = useMemo(() => {
    // Tri principal par nom de produit (ordre alphabétique FR)
    return [...stocksFromStore].sort((a, b) =>
      collator.compare(getProductName(a.idProduct), getProductName(b.idProduct))
    );
  }, [stocksFromStore, productsFromStore, collator]);

  const filteredStocks = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();

    return sortedStocks.filter((stock) => {
      // Filtre catégorie
      if (selectedCategoryId) {
        const catId = getCategoryIdForProductId(stock.idProduct);
        if (String(catId) !== String(selectedCategoryId)) return false;
      }
      // Filtre produit
      if (selectedProductId && String(stock.idProduct) !== String(selectedProductId)) {
        return false;
      }
      // Recherche texte (sur nom produit)
      if (!q) return true;
      const pname = (getProductName(stock.idProduct) || '').toLowerCase();
      return pname.includes(q);
    });
  }, [sortedStocks, selectedCategoryId, selectedProductId, searchQuery]);

  return (
    <div className='container py-5'>
      <h1 className="text-center mb-4">Gestion des stocks</h1>

      <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
        <div className="d-flex gap-2 flex-grow-1">
          {/* ✅ Filtre Catégorie */}
          <select
            className="form-select"
            style={{ minWidth: 220 }}
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
          >
            <option value="">Toutes les catégories</option>
            {sortedCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* ✅ Filtre Produit (dépend de la catégorie) */}
          <select
            className="form-select"
            style={{ minWidth: 260 }}
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            <option value="">Tous les produits</option>
            {productsForProductFilter.map((p) => (
              <option key={p.id} value={p.id}>{getProductLabel(p)}</option>
            ))}
          </select>

          {/* Recherche texte */}
          <input
            type="text"
            className="form-control"
            placeholder="Rechercher par nom de produit…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button className='btn btn-success' onClick={handleAddClick}>
          Ajouter un stock
        </button>
      </div>

      <div className='table-responsive'>
        <table className='table table-striped table-hover shadow-sm'>
          <thead className='table-dark'>
            <tr>
              <th>Produit</th>
              <th>Catégorie</th>
              <th>Quantité</th>
              <th style={{ width: 140 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.length > 0 ? (
              filteredStocks.map((stock) => (
                <tr key={stock.id} onClick={() => handleEditClick(stock)} style={{ cursor: 'pointer' }}>
                  <td>{getProductName(stock.idProduct)}</td>
                  <td>{getCategoryNameForProductId(stock.idProduct)}</td>
                  <td className={
                    stock.quantity < 1  ? 'text-danger fw-bold' :
                    stock.quantity < 20 ? 'text-secondary fw-bold' :
                    stock.quantity < 30 ? 'text-primary fw-bold' :
                                          'text-success fw-bold'
                  }>
                    {stock.quantity}
                  </td>
                  <td>
                    <button
                      className='btn btn-sm btn-warning me-2'
                      onClick={(e) => { e.stopPropagation(); handleEditClick(stock); }}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className='btn btn-sm btn-danger'
                      onClick={(e) => { e.stopPropagation(); handleDeleteClick(stock.id); }}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">Aucun stock trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="admin-modal-backdrop" role="presentation" onClick={() => setShowModal(false)}>
          <div
            className="admin-modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="stock-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="stock-modal-title" className="mb-3">
              {isEditing ? 'Modifier le stock' : 'Ajouter un stock'}
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
                  {productsForProductFilter.map((product) => (
                    <option key={product.id} value={product.id}>
                      {getProductLabel(product)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label>Quantité</label>
                <input
                  type="number"
                  name="quantity"
                  className="form-control"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                  min="0"
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
