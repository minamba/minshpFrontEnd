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
    const stocksFromStore = useSelector((state) => state.stocks.stocks) || [];
    const productsFromStore = useSelector((state) => state.products.products) || [];
    const dispatch = useDispatch();

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        quantity: 0,
        idProduct: ''
    });

    useEffect(() => {
        dispatch(getStockRequest());
        dispatch(getProductUserRequest());
    }, [dispatch]);

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
            idProduct: stock.idProduct // Assure-toi que ton objet stock contient l’id du produit
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

    return (
        <div className='container py-5'>
            <h1 className="text-center mb-4">Gestion des stocks</h1>

            <div className="d-flex justify-content-end mb-3">
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
                        {stocksFromStore.map((stock) => {
                            const product = productsFromStore.find(p => p.id === stock.idProduct);
                            return (
                                <tr key={stock.id} onClick={() => handleEditClick(stock)} style={{ cursor: 'pointer' }}>
                                    <td>{product ? product.name : 'Produit inconnu'}</td>
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
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-backdrop">
                    <div className="modal-content-custom">
                        <h2 className="mb-3">{isEditing ? 'Modifier le stock' : 'Ajouter un stock'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label>Produit</label>
                                <select
                                    name="idProduct"
                                    className="form-select"
                                    value={formData.idProduct}
                                    onChange={handleInputChange}
                                    required
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
