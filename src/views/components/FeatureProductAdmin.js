import React, { useState, useEffect } from 'react';
import '../../App.css';
import { useSelector, useDispatch } from 'react-redux';
import {
    getFeatureProductRequest,
    addFeatureProductRequest,
    updateFeatureProductRequest,
    deleteFeatureProductRequest
} from '../../lib/actions/FeatureProductActions';
import { getProductUserRequest } from '../../lib/actions/ProductActions';
import { getFeatureRequest } from '../../lib/actions/FeatureActions';

export const FeatureProductAdmin = () => {
    const featureProductsFromStore = useSelector((state) => state.featureProducts.featureProducts) || [];
    const productsFromStore = useSelector((state) => state.products.products) || [];
    const featuresFromStore = useSelector((state) => state.features.features) || [];
    const categoriesFromStore = useSelector((state) => state.categories.categories) || [];
    const [searchQuery, setSearchQuery] = useState('');
    const dispatch = useDispatch();


    console.log( "productsFromStore:",productsFromStore);


    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        idProduct: '',
        idFeature: ''
    });

    useEffect(() => {
        dispatch(getFeatureProductRequest());
        dispatch(getProductUserRequest());
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
        setFormData({ idProduct: '', idFeature: '' });
        setShowModal(true);
    };

    const handleEditClick = (fp) => {
        setIsEditing(true);
        setCurrentId(fp.id);
        setFormData({
            idProduct: fp.idProduct,
            idFeature: fp.idFeature
        });
        setShowModal(true);
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm('Supprimer cette association ?')) {
            await dispatch(deleteFeatureProductRequest(id));
            await dispatch(getFeatureProductRequest());
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isEditing) {
            await dispatch(updateFeatureProductRequest({
                id: currentId,
                idProduct: formData.idProduct,
                idFeature: formData.idFeature
            }));
        } else {
            await dispatch(addFeatureProductRequest({
                idProduct: formData.idProduct,
                id_feature: formData.idFeature
            }));
        }
        await dispatch(getFeatureProductRequest());
        setShowModal(false);
    };

    const getProductName = (id) => {
        const product = productsFromStore.find((p) => p.id === id);
        return product ? product.name : 'Produit inconnu';
    };

    const getFeatureDescription = (id) => {
        const feature = featuresFromStore.find((f) => f.id === id);
        return feature ? feature.description : 'Feature inconnue';
    };


    const getCategoryName = (id) => {
        const feature = featuresFromStore.find((f) => f.id === id);
        if (!feature) return 'Feature inconnue';
        
        const category = categoriesFromStore.find((c) => c.id === feature.idCategory);
        return category ? category.name : 'Catégorie inconnue';
    };

    // Ajoute une fonction pour récupérer la catégorie du produit sélectionné
    const getSelectedProductCategoryId = () => {
        const selectedProduct = productsFromStore.find(p => String(p.id) === String(formData.idProduct));
        if (!selectedProduct) return null;
    
        // Assure-toi qu'il y a bien un champ 'category' ou 'idCategory' dans le produit
        const category = categoriesFromStore?.find(c => c.name === selectedProduct.category || c.id === selectedProduct.idCategory);
        return category ? category.id : null;
    };

        // Filtre dynamique des features selon la catégorie du produit sélectionné
        const filteredFeatures = () => {
            const selectedCategoryId = getSelectedProductCategoryId();
            if (!selectedCategoryId) return [];
            return featuresFromStore.filter(f => f.idCategory === selectedCategoryId);
        };


        const sortedFeatureProducts = [...featureProductsFromStore].sort((a, b) => {
            const nameA = getProductName(a.idProduct).toLowerCase();
            const nameB = getProductName(b.idProduct).toLowerCase();
            return nameA.localeCompare(nameB);
        });

        const filteredAndSortedFeatureProducts = sortedFeatureProducts.filter((fp) => {
            const productName = getProductName(fp.idProduct).toLowerCase();
            const featureDesc = getFeatureDescription(fp.idFeature).toLowerCase();
            const categoryName = getCategoryName(fp.idFeature).toLowerCase();
            const query = searchQuery.toLowerCase();
            return (
                productName.includes(query) ||
                featureDesc.includes(query) ||
                categoryName.includes(query)
            );
        });

    return (
        <div className='container py-5'>
            <h1 className="text-center mb-4">Gestion des caractéristiques produits</h1>

            <div className="d-flex justify-content-end mb-3">
                <button className='btn btn-success' onClick={handleAddClick}>
                    Ajouter une association
                </button>
            </div>

            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Rechercher par produit, catégorie ou caractéristique..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className='table-responsive'>
                <table className='table table-striped table-hover shadow-sm'>
                    <thead className='table-dark'>
                        <tr>
                            <th>Produit</th>
                            <th>Caractéristique</th>
                            <th>Catégorie</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedFeatureProducts.map((fp) => (
                            <tr key={fp.id} onClick={() => handleEditClick(fp)} style={{ cursor: 'pointer' }}>
                                <td>{getProductName(fp.idProduct)}</td>
                                <td>{getFeatureDescription(fp.idFeature)}</td>
                                <td>{getCategoryName(fp.idFeature)}</td>
                                <td>
                                    <button
                                        className='btn btn-sm btn-warning me-2'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditClick(fp);
                                        }}
                                    >
                                        <i className="bi bi-pencil"></i>
                                    </button>
                                    <button
                                        className='btn btn-sm btn-danger'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteClick(fp.id);
                                        }}
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
                <div className="modal-backdrop">
                    <div className="modal-content-custom">
                        <h2 className="mb-3">{isEditing ? 'Modifier l\'association' : 'Ajouter une association'}</h2>
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
                                <label>Caractéristique</label>
                                <select
                                    name="idFeature"
                                    className="form-select"
                                    value={formData.idFeature}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Sélectionnez une caractéristique</option>
                                    {filteredFeatures().map((feature) => (
                                        <option key={feature.id} value={feature.id}>
                                            {feature.description}
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
