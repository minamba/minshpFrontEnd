import React, { useState, useEffect } from 'react';
import '../../App.css';
import { useSelector, useDispatch } from 'react-redux';
import {
    getImageRequest,
    addImageRequest,
    updateImageRequest,
    deleteImageRequest
} from '../../lib/actions/ImageActions';
import { getProductUserRequest } from '../../lib/actions/ProductActions';
import { postUploadRequest } from '../../lib/actions/UploadActions';

export const ImageAdmin = () => {
    const imagesFromStore = useSelector((state) => state.images.images) || [];
    const productsFromStore = useSelector((state) => state.products.products) || [];
    const dispatch = useDispatch();

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        file: null, // fichier image
        description: '',
        idProduct: '',
        title: ''
    });
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        dispatch(getImageRequest());
        dispatch(getProductUserRequest());
    }, [dispatch]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({
                ...prev,
                file: file
            }));
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleAddClick = () => {
        setIsEditing(false);
        setCurrentId(null);
        setFormData({ file: null, description: '', idProduct: '', title: '' });
        setPreviewUrl('');
        setShowModal(true);
    };

    const handleEditClick = (image) => {
        setIsEditing(true);
        setCurrentId(image.id);
        setFormData({
            file: null, // on attend qu'un nouveau fichier soit choisi
            description: image.description,
            idProduct: image.idProduct,
            title: image.title
        });
        setPreviewUrl(image.url); // prévisualiser l’image existante
        setShowModal(true);
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm('Supprimer cette image ?')) {
            await dispatch(deleteImageRequest(id));
            await dispatch(getImageRequest());
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isEditing) {
            await dispatch(postUploadRequest({Id: currentId, File: formData.file, Type: 'IMAGE', Description: formData.description, IdProduct: formData.idProduct, Title: formData.title, TypeUpload: 'UPLOAD'}));
        } else {
            await dispatch(postUploadRequest({File: formData.file, Type: 'IMAGE', IdProduct: formData.idProduct, Description: formData.description, Title: formData.title, TypeUpload: 'ADD'}));
        }

        await dispatch(getImageRequest());
        setShowModal(false);
    }

    const getProductName = (id) => {
        const product = productsFromStore.find(p => p.id === id);
        return product ? product.name : 'Produit inconnu';
    };

    const sortedImages = [...imagesFromStore].sort((a, b) => {
        const nameA = getProductName(a.idProduct).toLowerCase();
        const nameB = getProductName(b.idProduct).toLowerCase();
        return nameA.localeCompare(nameB);
    });

    const filteredImages = sortedImages.filter((img) => {
        const productName = getProductName(img.idProduct).toLowerCase();
        return (
            img.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
            img.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            productName.includes(searchQuery.toLowerCase())
        );
    });

    return (
        <div className='container py-5'>
            <h1 className="text-center mb-4">Gestion des images</h1>

            <div className="d-flex justify-content-between mb-3">
                <input
                    type="text"
                    placeholder="Rechercher par URL, description ou produit..."
                    className="form-control w-50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className='btn btn-success ms-2' onClick={handleAddClick}>
                    Ajouter une image
                </button>
            </div>

            <div className='table-responsive'>
                <table className='table table-striped table-hover shadow-sm'>
                    <thead className='table-dark'>
                        <tr>
                            <th>Image</th>
                            <th>Description</th>
                            <th>Produit</th>
                            <th>Titre</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredImages.map((img) => (
                            <tr key={img.id} onClick={() => handleEditClick(img)} style={{ cursor: 'pointer' }}>
                                <td>
                                    <img src={img.url} alt="preview" style={{ width: '80px', height: 'auto' }} />
                                </td>
                                <td>{img.description}</td>
                                <td>{getProductName(img.idProduct)}</td>
                                <td>{img.title}</td>
                                <td>
                                    <button
                                        className='btn btn-sm btn-warning me-2'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditClick(img);
                                        }}
                                    >
                                        <i className="bi bi-pencil"></i>
                                    </button>
                                    <button
                                        className='btn btn-sm btn-danger'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteClick(img.id);
                                        }}
                                    >
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredImages.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center">Aucune image trouvée.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-backdrop">
                    <div className="modal-content-custom">
                        <h2 className="mb-3">{isEditing ? 'Modifier l\'image' : 'Ajouter une image'}</h2>
                        <form onSubmit={handleSubmit} encType="multipart/form-data">
                            <div className="mb-3">
                                <label>Fichier image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    name="file"
                                    className="form-control"
                                    onChange={handleFileChange}
                                    required={!isEditing} // rendre requis en ajout, mais pas en modification
                                />
                                {previewUrl && (
                                    <div className="mt-2">
                                        <img src={previewUrl} alt="preview" style={{ width: '100px', height: 'auto' }} />
                                    </div>
                                )}
                            </div>
                            <div className="mb-3">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    className="form-control"
                                    rows="3"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
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
