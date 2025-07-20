import React, { useState, useEffect } from 'react';
import '../../App.css';
import { useSelector, useDispatch } from 'react-redux';
import {
    getFeatureRequest,
    addFeatureRequest,
    updateFeatureRequest,
    deleteFeatureRequest
} from '../../lib/actions/FeatureActions';

export const FeatureAdmin = () => {
    const featuresFromStore = useSelector((state) => state.features.features) || [];
    const categoriesFromStore = useSelector((state) => state.categories.categories) || [];
    const dispatch = useDispatch();

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        description: '',
        idCategory: ''
    });

    useEffect(() => {
        dispatch(getFeatureRequest());
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
        setFormData({ description: '', idCategory: '' });
        setShowModal(true);
    };

    const handleEditClick = (feature) => {
        setIsEditing(true);
        setCurrentId(feature.id);
        setFormData({
            id: feature.id,
            description: feature.description,
            idCategory: feature.idCategory || ''
        });
        setShowModal(true);
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm('Supprimer cette caractéristique ?')) {
            await dispatch(deleteFeatureRequest(id));
            await dispatch(getFeatureRequest());
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isEditing) {
            await dispatch(updateFeatureRequest({
                id: currentId,
                description: formData.description,
                idCategory: formData.idCategory
            }));
        } else {
            await dispatch(addFeatureRequest({
                description: formData.description,
                idCategory: formData.idCategory
            }));
        }
        await dispatch(getFeatureRequest());
        setShowModal(false);
    };

    const getCategoryName = (id) => {
        const category = categoriesFromStore.find((c) => c.id === id);
        return category ? category.name : 'Catégorie inconnue';
    };

    const sortedAndFilteredFeatures = [...featuresFromStore]
        .map((feature) => ({
            ...feature,
            categoryName: getCategoryName(feature.idCategory)
        }))
        .filter((feature) =>
            feature.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => a.categoryName.localeCompare(b.categoryName));

    return (
        <div className='container py-5'>
            <h1 className="text-center mb-4">Gestion des caractéristiques</h1>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <input
                    type="text"
                    className="form-control w-50"
                    placeholder="Rechercher par catégorie..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className='btn btn-success' onClick={handleAddClick}>
                    Ajouter une caractéristique
                </button>
            </div>

            <div className='table-responsive'>
                <table className='table table-striped table-hover shadow-sm'>
                    <thead className='table-dark'>
                        <tr>
                            <th>Description</th>
                            <th>Catégorie</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAndFilteredFeatures.length > 0 ? (
                            sortedAndFilteredFeatures.map((feature) => (
                                <tr key={feature.id} onClick={() => handleEditClick(feature)} style={{ cursor: 'pointer' }}>
                                    <td>{feature.description}</td>
                                    <td>{feature.categoryName}</td>
                                    <td>
                                        <button
                                            className='btn btn-sm btn-warning me-2'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditClick(feature);
                                            }}
                                        >
                                            <i className="bi bi-pencil"></i>
                                        </button>
                                        <button
                                            className='btn btn-sm btn-danger'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteClick(feature.id);
                                            }}
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="text-center">Aucune caractéristique trouvée.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-backdrop">
                    <div className="modal-content-custom">
                        <h2 className="mb-3">{isEditing ? 'Modifier la caractéristique' : 'Ajouter une caractéristique'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    className="form-control"
                                    rows="4"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label>Catégorie</label>
                                <select
                                    name="idCategory"
                                    className="form-select"
                                    value={formData.idCategory}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Sélectionnez une catégorie</option>
                                    {categoriesFromStore.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
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
