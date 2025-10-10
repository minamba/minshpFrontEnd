import React, { useState, useEffect } from 'react';
import '../../App.css';
import { useSelector, useDispatch } from 'react-redux';
import {
  getImageRequest,
  addImageRequest,      // (pas utilisé ici mais gardé si besoin)
  updateImageRequest,   // (idem)
  deleteImageRequest
} from '../../lib/actions/ImageActions';
import { getProductUserRequest } from '../../lib/actions/ProductActions';
import { postUploadRequest } from '../../lib/actions/UploadActions';
import { toMediaUrl } from '../../lib/utils/mediaUrl';

export const ImageAdmin = () => {
  const imagesFromStore   = useSelector((state) => state.images.images) || [];
  const productsFromStore = useSelector((state) => state.products.products) || [];
  const dispatch = useDispatch();

  const [showModal, setShowModal]     = useState(false);
  const [isEditing, setIsEditing]     = useState(false);
  const [currentId, setCurrentId]     = useState(null);
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
    dispatch(getImageRequest());
    dispatch(getProductUserRequest());
  }, [dispatch]);

  // ESC pour fermer + bloquer le scroll quand ouvert
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

  // évite fuites mémoire si on génère des objectURL
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // release ancien blob si nécessaire
    if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);

    setFormData((prev) => ({ ...prev, file }));
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ file: null, description: '', idProduct: '', title: '', position: '', display: false });
    if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setShowModal(true);
  };

  const handleEditClick = (image) => {
    setIsEditing(true);
    setCurrentId(image.id);
    setFormData({
      file: null, // on laissera l'utilisateur remplacer s'il veut
      description: image.description ?? '',
      idProduct: image.idProduct ?? '',
      title: image.title ?? '',
      position: image.position ?? '',
      display: Boolean(image.display),
    });
    if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(image.url || '');
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
      await dispatch(
        postUploadRequest({
          Id: currentId,
          File: formData.file,
          Type: 'IMAGE',
          Description: formData.description,
          IdProduct: formData.idProduct,
          Title: formData.title,
          Position: formData.position,
          Display: formData.display,
          TypeUpload: 'UPLOAD',
        })
      );
    } else {
      await dispatch(
        postUploadRequest({
          File: formData.file,
          Type: 'IMAGE',
          IdProduct: formData.idProduct,
          Description: formData.description,
          Title: formData.title,
          Position: formData.position,
          Display: formData.display,
          TypeUpload: 'ADD',
        })
      );
    }

    await dispatch(getImageRequest());
    setShowModal(false);
  };

  const getProductName = (id) => {
    const product = productsFromStore.find((p) => p.id === id);
    return product ? product.brand + ' - ' + product.model : 'Produit inconnu';
  };

  const sortedImages = [...imagesFromStore].sort((a, b) => {
    const nameA = getProductName(a.idProduct).toLowerCase();
    const nameB = getProductName(b.idProduct).toLowerCase();
    return nameA.localeCompare(nameB);
  });

  const filteredImages = sortedImages.filter((img) => {
    const url   = String(img.url || '').toLowerCase();
    const desc  = String(img.description || '').toLowerCase();
    const pname = String(getProductName(img.idProduct) || '').toLowerCase();
    const q     = searchQuery.toLowerCase();
    return url.includes(q) || desc.includes(q) || pname.includes(q);
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
              <th>Position</th>
              <th>Afficher</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredImages.map((img) => (
              <tr key={img.id} onClick={() => handleEditClick(img)} style={{ cursor: 'pointer' }}>
                <td>
                  <img src={toMediaUrl(img.url)} alt="preview" style={{ width: '80px', height: 'auto' }} />
                </td>
                <td>{img.description}</td>
                <td>{getProductName(img.idProduct)}</td>
                <td>{img.title}</td>
                <td>{img.position}</td>
                <td>
                  {img.display ? (
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
                <td colSpan="7" className="text-center">Aucune image trouvée.</td>
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
            aria-labelledby="image-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="image-modal-title" className="mb-3">
              {isEditing ? "Modifier l'image" : "Ajouter une image"}
            </h2>

            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="mb-3">
                <label>Fichier image</label>
                <input
                  type="file"
                  accept="image/*"
                  name="file"
                  className="form-control"
                  onChange={handleFileChange}
                  required={!isEditing}
                  autoFocus
                />
                {previewUrl && (
                  <div className="mt-2">
                    <img src={previewUrl} alt="preview" style={{ width: '120px', height: 'auto', borderRadius: 6 }} />
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
                  type="text"
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
