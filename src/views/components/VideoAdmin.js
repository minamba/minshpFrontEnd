import React, { useState, useEffect } from 'react';
import '../../App.css';
import { useSelector, useDispatch } from 'react-redux';
import {
    getVideoRequest,
    deleteVideoRequest
} from '../../lib/actions/VideoActions';
import { getProductUserRequest } from '../../lib/actions/ProductActions';
import { postUploadRequest } from '../../lib/actions/UploadActions';

export const VideoAdmin = () => {
    const videosFromStore = useSelector((state) => state.videos.videos) || [];
    const productsFromStore = useSelector((state) => state.products.products) || [];
    const dispatch = useDispatch();

    console.log("videosFromStore", videosFromStore);

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        file: null,
        description: '',
        idProduct: ''
    });
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        dispatch(getVideoRequest());
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
        setFormData({ file: null, description: '', idProduct: '' });
        setPreviewUrl('');
        setShowModal(true);
    };

    const handleEditClick = (video) => {
        setIsEditing(true);
        setCurrentId(video.id);
        setFormData({
            file: null,
            description: video.description,
            idProduct: video.idProduct
        });
        setPreviewUrl(video.url);
        setShowModal(true);
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm('Supprimer cette vidéo ?')) {
            await dispatch(deleteVideoRequest(id));
            await dispatch(getVideoRequest());
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isEditing) {
            await dispatch(postUploadRequest({Id: currentId, File: formData.file, Type: 'VIDEO', Description: formData.description, IdProduct: formData.idProduct, TypeUpload: 'UPLOAD'}));
        } else {
            await dispatch(postUploadRequest({File: formData.file, Type: 'VIDEO', IdProduct: formData.idProduct, Description: formData.description, TypeUpload: 'ADD'}));
        }

        await dispatch(getVideoRequest());
        setShowModal(false);
    }

    const getProductName = (id) => {
        const product = productsFromStore.find(p => p.id === id);
        return product ? product.name : 'Produit inconnu';
    };

    const sortedVideos = [...videosFromStore].sort((a, b) => {
        const nameA = getProductName(a.idProduct).toLowerCase();
        const nameB = getProductName(b.idProduct).toLowerCase();
        return nameA.localeCompare(nameB);
    });

    const filteredVideos = sortedVideos.filter((vid) => {
        const productName = getProductName(vid.idProduct);
        const safeProductName = productName ? productName.toLowerCase() : '';
        return (
            (vid.url || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (vid.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            safeProductName.includes(searchQuery.toLowerCase())
        );
    });

    return (
        <div className='container py-5'>
            <h1 className="text-center mb-4">Gestion des vidéos</h1>

            <div className="d-flex justify-content-between mb-3">
                <input
                    type="text"
                    placeholder="Rechercher par URL, description ou produit..."
                    className="form-control w-50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className='btn btn-success ms-2' onClick={handleAddClick}>
                    Ajouter une vidéo
                </button>
            </div>

            <div className='table-responsive'>
                <table className='table table-striped table-hover shadow-sm'>
                    <thead className='table-dark'>
                        <tr>
                            <th>Vidéo</th>
                            <th>Description</th>
                            <th>Produit</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVideos.map((vid) => (
                            <tr key={vid.id} onClick={() => handleEditClick(vid)} style={{ cursor: 'pointer' }}>
                                <td>
                                    <video width="120" controls>
                                        <source src={vid.url} type="video/mp4" />
                                        Votre navigateur ne supporte pas la vidéo.
                                    </video>
                                </td>
                                <td>{vid.description}</td>
                                <td>{getProductName(vid.idProduct)}</td>
                                <td>
                                    <button
                                        className='btn btn-sm btn-warning me-2'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditClick(vid);
                                        }}
                                    >
                                        <i className="bi bi-pencil"></i>
                                    </button>
                                    <button
                                        className='btn btn-sm btn-danger'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteClick(vid.id);
                                        }}
                                    >
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredVideos.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center">Aucune vidéo trouvée.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-backdrop">
                    <div className="modal-content-custom">
                        <h2 className="mb-3">{isEditing ? 'Modifier la vidéo' : 'Ajouter une vidéo'}</h2>
                        <form onSubmit={handleSubmit} encType="multipart/form-data">
                            <div className="mb-3">
                                <label>Fichier vidéo</label>
                                <input
                                    type="file"
                                    accept="video/*"
                                    name="file"
                                    className="form-control"
                                    onChange={handleFileChange}
                                    required={!isEditing}
                                />
                                {previewUrl && (
                                    <div className="mt-2">
                                        <video width="200" controls>
                                            <source src={previewUrl} type="video/mp4" />
                                            Votre navigateur ne supporte pas la vidéo.
                                        </video>
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
