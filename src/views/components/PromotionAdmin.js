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

export const PromotionAdmin = () => {
    const promotionsFromStore = useSelector((state) => state.promotions.promotions) || [];
    const productsFromStore = useSelector((state) => state.products.products) || [];
    const dispatch = useDispatch();

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        idProduct: '',
        purcentage: 0,
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        dispatch(getPromotionRequest());
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
        setFormData({ idProduct: '', purcentage: 0, startDate: '', endDate: '' });
        setShowModal(true);
    };

    const handleEditClick = (promo) => {
        setIsEditing(true);
        setCurrentId(promo.id);
        setFormData({
            idProduct: promo.idProduct,
            purcentage: promo.purcentage,
            startDate: promo.startDate.slice(0, 10), // yyyy-mm-dd
            endDate: promo.endDate.slice(0, 10)
        });
        setShowModal(true);
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm('Supprimer cette promotion ?')) {
            await dispatch(deletePromotionRequest(id));
            await dispatch(getPromotionRequest());
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isEditing) {
            await dispatch(updatePromotionRequest({
                id: currentId,
                idProduct: formData.idProduct,
                purcentage: formData.purcentage,
                startDate: formData.startDate,
                endDate: formData.endDate
            }));
        } else {
            await dispatch(addPromotionRequest({
                idProduct: formData.idProduct,
                purcentage: formData.purcentage,
                startDate: formData.startDate,
                endDate: formData.endDate
            }));
        }
        await dispatch(getPromotionRequest());
        setShowModal(false);
    };

    const getProductName = (id) => {
        const product = productsFromStore.find(p => p.id === id);
        return product ? product.name : 'Produit inconnu';
    };

    // Tri par date de création (du plus récent au plus ancien)
    const sortedPromotions = [...promotionsFromStore].sort((a, b) => {
        const dateA = new Date(a.dateCreation);
        const dateB = new Date(b.dateCreation);
        return dateB - dateA;
    });

    // Filtrage par nom produit
    const filteredPromotions = sortedPromotions.filter((promo) => {
        const productName = getProductName(promo.idProduct).toLowerCase();
        return productName.includes(searchQuery.toLowerCase());
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
                                <td className='text-success fw-bold'>{new Date(promo.startDate).toLocaleDateString()}</td>
                                <td className='text-danger fw-bold'>{new Date(promo.endDate).toLocaleDateString()}</td>
                                <td>{new Date(promo.dateCreation).toLocaleDateString()}</td>
                                <td>
                                    <button
                                        className='btn btn-sm btn-warning me-2'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditClick(promo);
                                        }}
                                    >
                                        <i className="bi bi-pencil"></i>
                                    </button>
                                    <button
                                        className='btn btn-sm btn-danger'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteClick(promo.id);
                                        }}
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
                <div className="modal-backdrop">
                    <div className="modal-content-custom">
                        <h2 className="mb-3">{isEditing ? 'Modifier la promotion' : 'Ajouter une promotion'}</h2>
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
                                <label>Pourcentage (%)</label>
                                <input
                                    type="number"
                                    name="purcentage"
                                    className="form-control"
                                    value={formData.purcentage}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="100"
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
