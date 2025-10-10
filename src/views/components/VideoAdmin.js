import React, { useState, useEffect } from 'react';
import '../../App.css';
import { useSelector, useDispatch } from 'react-redux';
import {
  getVideoRequest,
  deleteVideoRequest
} from '../../lib/actions/VideoActions';
import { getProductUserRequest } from '../../lib/actions/ProductActions';
import { postUploadRequest } from '../../lib/actions/UploadActions';
import { toMediaUrl } from '../../lib/utils/mediaUrl';

export const VideoAdmin = () => {
  const videosFromStore = useSelector((state) => state.videos.videos) || [];
  const productsFromStore = useSelector((state) => state.products.products) || [];
  const dispatch = useDispatch();

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    file: null,
    description: '',
    idProduct: '',
    title: '',
    position: '',
    display: false,
  });
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    dispatch(getVideoRequest());
    dispatch(getProductUserRequest());
  }, [dispatch]);

  // fermer avec ESC + bloquer le scroll du body quand la modale est ouverte
  useEffect(() => {
    if (!showModal) {
      document.body.classList.remove('no-scroll');
      return;
    }
    document.body.classList.add('no-scroll');

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
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ file: null, description: '', idProduct: '', title: '', position: '', display: false });
    setPreviewUrl('');
    setShowModal(true);
  };

  const handleEditClick = (video) => {
    setIsEditing(true);
    setCurrentId(video.id);
    setFormData({
      file: null,
      description: video.description ?? '',
      idProduct: video.idProduct ?? '',
      title: video.title ?? '',
      position: video.position != null ? String(video.position) : '',
      display: Boolean(video.display),
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

    const payloadBase = {
      File: formData.file,
      Type: 'VIDEO',
      Description: formData.description,
      IdProduct: formData.idProduct,
      Position: parseInt(formData.position, 10),
      Title: formData.title,
      Display: formData.display,
    };

    if (isEditing) {
      await dispatch(postUploadRequest({
        ...payloadBase,
        Id: currentId,
        TypeUpload: 'UPLOAD',
      }));
    } else {
      await dispatch(postUploadRequest({
        ...payloadBase,
        TypeUpload: 'ADD',
      }));
    }

    await dispatch(getVideoRequest());
    setShowModal(false);
  };

  const getProductName = (id) => {
    const product = productsFromStore.find(p => p.id === id);
    return product ? product.brand + ' - ' + product.model : 'Produit inconnu';
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
              <th>Titre</th>
              <th>Position</th>
              <th>Afficher</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVideos.map((vid) => (
              <tr key={vid.id} onClick={() => handleEditClick(vid)} style={{ cursor: 'pointer' }}>
                <td>
                  <video width="200" controls>
                    <source src={toMediaUrl(vid.url)} type="video/mp4" />
                    Votre navigateur ne supporte pas la vidéo.
                  </video>
                </td>
                <td>{vid.description}</td>
                <td>{getProductName(vid.idProduct)}</td>
                <td>{vid.title}</td>
                <td>{vid.position}</td>
                <td>
                  {vid.display ? (
                    <span className="badge bg-success">Oui</span>
                  ) : (
                    <span className="badge bg-secondary">Non</span>
                  )}
                </td>
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
                <td colSpan="7" className="text-center">Aucune vidéo trouvée.</td>
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
            aria-labelledby="video-admin-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="video-admin-title" className="mb-3">
              {isEditing ? 'Modifier la vidéo' : 'Ajouter une vidéo'}
            </h2>

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
                <label>Titre</label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label>Position</label>
                <input
                  type="number"
                  name="position"
                  className="form-control"
                  value={formData.position}
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
                      {product.brand + ' - ' + product.model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="displaySwitch"
                  name="display"
                  checked={!!formData.display}
                  onChange={handleInputChange}
                />
                <label className="form-check-label" htmlFor="displaySwitch">
                  Afficher (publiée)
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
