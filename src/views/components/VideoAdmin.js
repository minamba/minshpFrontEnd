import React, { useState, useEffect, useMemo } from 'react';
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
  const videosFromStore      = useSelector((s) => s.videos.videos) || [];
  const productsFromStore    = useSelector((s) => s.products.products) || [];
  const categoriesFromStore  = useSelector((s) => s.categories?.categories) || [];
  const dispatch = useDispatch();

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(''); // ✅ filtre Catégorie
  const [selectedProductId, setSelectedProductId]   = useState(''); // ✅ filtre Produit

  const [formData, setFormData] = useState({
    file: null,
    description: '',
    idProduct: '',
    title: '',
    position: '',
    display: false,
  });
  const [previewUrl, setPreviewUrl] = useState('');

  const collator = useMemo(() => new Intl.Collator('fr', { sensitivity: 'base' }), []);

  useEffect(() => {
    dispatch(getVideoRequest());
    dispatch(getProductUserRequest());
  }, [dispatch]);

  // fermer avec ESC + bloquer le scroll
  useEffect(() => {
    if (!showModal) {
      document.body.classList.remove('no-scroll');
      return;
    }
    document.body.classList.add('no-scroll');
    const onKey = (e) => e.key === 'Escape' && setShowModal(false);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
    };
  }, [showModal]);

  // cleanup objectURL
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // ------- Helpers -------
  const getProductById = (id) => productsFromStore.find(p => String(p.id) === String(id));
  const getCategoryById = (id) => categoriesFromStore.find(c => String(c.id) === String(id));

  const getProductLabel = (p) => {
    if (!p) return 'Produit inconnu';
    const brand = p.brand ?? '';
    const model = p.model ?? '';
    return `${brand}${brand && model ? ' - ' : ''}${model}`.trim() || 'Produit';
  };

  const getProductName = (id) => getProductLabel(getProductById(id));

  // id catégorie pour un produit (prend idCategory si dispo, sinon match par nom)
  const getCategoryIdForProduct = (p) => {
    if (!p) return null;
    if (p.idCategory != null) return p.idCategory;
    if (p.category) {
      const byName = categoriesFromStore.find(c => c.name === p.category);
      return byName?.id ?? null;
    }
    return null;
  };

  const getCategoryIdForProductId   = (productId) => getCategoryIdForProduct(getProductById(productId));
  const getCategoryNameForProductId = (productId) => {
    const cid = getCategoryIdForProductId(productId);
    const c   = cid ? getCategoryById(cid) : null;
    return c ? c.name : 'Catégorie inconnue';
  };

  // Produits triés (pour filtres et modale)
  const sortedProducts = useMemo(() => {
    return [...productsFromStore].sort((a, b) =>
      collator.compare(getProductLabel(a), getProductLabel(b))
    );
  }, [productsFromStore, collator]);

  // Produits disponibles pour le filtre Produit (dépend du filtre Catégorie)
  const productsForProductFilter = useMemo(() => {
    const pool = selectedCategoryId
      ? sortedProducts.filter(p => String(getCategoryIdForProduct(p)) === String(selectedCategoryId))
      : sortedProducts;
    return pool;
  }, [sortedProducts, selectedCategoryId]);

  // Reset produit si on change la catégorie et qu'il n'appartient plus
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
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
    if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(toMediaUrl(video.url || ''));
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
      await dispatch(postUploadRequest({ ...payloadBase, Id: currentId, TypeUpload: 'UPLOAD' }));
    } else {
      await dispatch(postUploadRequest({ ...payloadBase, TypeUpload: 'ADD' }));
    }
    await dispatch(getVideoRequest());
    setShowModal(false);
  };

  // ------- Tri + filtres des vidéos -------
  const sortedVideos = useMemo(() => {
    // Tri principal par nom de produit
    return [...videosFromStore].sort((a, b) =>
      collator.compare(getProductName(a.idProduct), getProductName(b.idProduct))
    );
  }, [videosFromStore, collator, productsFromStore]);

  const filteredVideos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return sortedVideos.filter((vid) => {
      // Filtre catégorie
      if (selectedCategoryId) {
        const catId = getCategoryIdForProductId(vid.idProduct);
        if (String(catId) !== String(selectedCategoryId)) return false;
      }
      // Filtre produit
      if (selectedProductId && String(vid.idProduct) !== String(selectedProductId)) {
        return false;
      }
      // Filtre texte
      if (!q) return true;
      const url   = String(vid.url || '').toLowerCase();
      const desc  = String(vid.description || '').toLowerCase();
      const title = String(vid.title || '').toLowerCase();
      const pname = String(getProductName(vid.idProduct) || '').toLowerCase();
      return url.includes(q) || desc.includes(q) || title.includes(q) || pname.includes(q);
    });
  }, [sortedVideos, selectedCategoryId, selectedProductId, searchQuery]);

  // Catégories triées pour le filtre
  const sortedCategories = useMemo(() => {
    return [...categoriesFromStore].sort((a, b) =>
      collator.compare(a?.name ?? '', b?.name ?? '')
    );
  }, [categoriesFromStore, collator]);

  return (
    <div className='container py-5'>
      <h1 className="text-center mb-4">Gestion des vidéos</h1>

      <div className="d-flex flex-wrap gap-2 justify-content-between mb-3">
        <div className="d-flex gap-2 flex-grow-1">
          {/* ✅ Filtre Catégorie */}
          <select
            className="form-select"
            style={{ minWidth: 220 }}
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
          >
            <option value="">Toutes les catégories</option>
            {sortedCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* ✅ Filtre Produit (dépend de la Catégorie) */}
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
            placeholder="Rechercher: URL, description, titre, produit…"
            className="form-control"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button className='btn btn-success' onClick={handleAddClick}>
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
              <th>Catégorie</th>
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
                <td>{getCategoryNameForProductId(vid.idProduct)}</td>
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
                    onClick={(e) => { e.stopPropagation(); handleEditClick(vid); }}
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button
                    className='btn btn-sm btn-danger'
                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(vid.id); }}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
            {filteredVideos.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center">Aucune vidéo trouvée.</td>
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
                  {productsForProductFilter.map((product) => (
                    <option key={product.id} value={product.id}>
                      {getProductLabel(product)}
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
                <button type="button" className="btn btn-secondary me-2" onClick={() => setShowModal(false)}>
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
