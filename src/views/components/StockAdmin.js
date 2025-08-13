import React, { useState, useEffect } from 'react';
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
  const stocksFromStore   = useSelector((state) => state.stocks.stocks) || [];
  const productsFromStore = useSelector((state) => state.products.products) || [];
  const dispatch = useDispatch();

  const [showModal, setShowModal]     = useState(false);
  const [isEditing, setIsEditing]     = useState(false);
  const [currentId, setCurrentId]     = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    quantity: 0,
    idProduct: ''
  });

  useEffect(() => {
    dispatch(getStockRequest());
    dispatch(getProductUserRequest());
  }, [dispatch]);

  // ESC + bloque le scroll quand la modale est ouverte (isolé des autres modales)
  useEffect(() => {
    if (showModal) document.body.classList.add('no-scroll');
    else document.body.classList.remove('no-scroll');

    const onKey = (e) => {
      if (e.key === 'Escape') setShowModal(false);
    };
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
    setFormData({ quantity: 0, idProduct: '' });
    setShowModal(true);
  };

  const handleEditClick = (stock) => {
    setIsEditing(true);
    setCurrentId(stock.id);
    setFormData({
      id: stock.id,
      quantity: stock.quantity,
      idProduct: stock.idProduct
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
        quantity: formData.quantity,
        idProduct: formData.idProduct
      }));
    } else {
      await dispatch(addStockRequest({
        quantity: formData.quantity,
        idProduct: formData.idProduct
      }));
    }
    await dispatch(getStockRequest());
    setShowModal(false);
  };

  // Tri + filtre par nom produit
  const stocksWithProductNames = stocksFromStore
    .map((stock) => ({
      ...stock,
      productName: productsFromStore.find(p => p.id === stock.idProduct)?.name || 'Produit inconnu'
    }))
    .filter((stock) =>
      (stock.productName || '').toLowerCase().includes((searchQuery || '').toLowerCase())
    )
    .sort((a, b) => a.productName.localeCompare(b.productName));

  return (
    <div className='container py-5'>
      <h1 className="text-center mb-4">Gestion des stocks</h1>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Rechercher par nom de produit..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className='btn btn-success' onClick={handleAddClick}>
          Ajouter un stock
        </button>
      </div>

      <div className='table-responsive'>
        <table className='table table-striped table-hover shadow-sm'>
          <thead className='table-dark'>
            <tr>
              <th>Produit</th>
              <th>Quantité</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stocksWithProductNames.length > 0 ? (
              stocksWithProductNames.map((stock) => (
                <tr key={stock.id} onClick={() => handleEditClick(stock)} style={{ cursor: 'pointer' }}>
                  <td>{stock.productName}</td>
                  <td>{stock.quantity}</td>
                  <td>
                    <button
                      className='btn btn-sm btn-warning me-2'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(stock);
                      }}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className='btn btn-sm btn-danger'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(stock.id);
                      }}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center">Aucun stock trouvé.</td>
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
                  {productsFromStore.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
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
