import React, { useState, useEffect, useMemo } from 'react';
import '../../App.css';
import { useSelector, useDispatch } from 'react-redux';
import {
  getImageRequest,
  addImageRequest,      // (non utilisé ici)
  updateImageRequest,   // (non utilisé ici)
  deleteImageRequest
} from '../../lib/actions/ImageActions';
import { getProductUserRequest } from '../../lib/actions/ProductActions';
import { postUploadRequest } from '../../lib/actions/UploadActions';
import { toMediaUrl } from '../../lib/utils/mediaUrl';

export const ImageAdmin = () => {
  const imagesFromStore     = useSelector((s) => s.images.images) || [];
  const productsFromStore   = useSelector((s) => s.products.products) || [];
  const categoriesFromStore = useSelector((s) => s.categories?.categories) || [];
  const dispatch = useDispatch();

  const [showModal, setShowModal]         = useState(false);
  const [isEditing, setIsEditing]         = useState(false);
  const [currentId, setCurrentId]         = useState(null);
  const [searchQuery, setSearchQuery]     = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(''); // filtre global table
  const [selectedProductId, setSelectedProductId]   = useState(''); // filtre global table

  // Etat du formulaire + prévisualisation
  const [formData, setFormData] = useState({
    file: null,
    description: '',
    idProduct: '',
    title: '',
    position: '',
    display: false,
  });
  const [previewUrl, setPreviewUrl] = useState('');

  // ✅ Nouvel état: filtre catégorie *dans la modale*
  const [modalCategoryId, setModalCategoryId] = useState('');

  const collator = useMemo(() => new Intl.Collator('fr', { sensitivity: 'base' }), []);

  useEffect(() => {
    dispatch(getImageRequest());
    dispatch(getProductUserRequest());
  }, [dispatch]);

  // ESC pour fermer + bloquer le scroll
  useEffect(() => {
    if (showModal) document.body.classList.add('no-scroll');
    else document.body.classList.remove('no-scroll');
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

  const getCategoryIdForProduct = (p) => {
    if (!p) return null;
    if (p.idCategory != null) return p.idCategory;
    if (p.category) {
      const byName = categoriesFromStore.find(c => c.name === p.category);
      return byName?.id ?? null;
    }
    return null;
  };

  const getCategoryIdForProductId = (productId) => {
    const p = getProductById(productId);
    return getCategoryIdForProduct(p);
  };

  const getCategoryNameForProductId = (productId) => {
    const catId = getCategoryIdForProductId(productId);
    const cat   = catId ? getCategoryById(catId) : null;
    return cat ? cat.name : 'Catégorie inconnue';
  };

  // Produits triés (global)
  const sortedProducts = useMemo(() => {
    return [...productsFromStore].sort((a, b) =>
      collator.compare(getProductLabel(a), getProductLabel(b))
    );
  }, [productsFromStore, collator]);

  // Produits filtrés par catégorie (pour le *filtre global* Produit)
  const productsForProductFilter = useMemo(() => {
    const pool = selectedCategoryId
      ? sortedProducts.filter(p => String(getCategoryIdForProduct(p)) === String(selectedCategoryId))
      : sortedProducts;
    return pool;
  }, [sortedProducts, selectedCategoryId]);

  // Si on change la catégorie globale et que le produit global choisi n'appartient plus à cette catégorie -> reset
  useEffect(() => {
    if (!selectedProductId) return;
    if (!selectedCategoryId) return;
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

    // 🔁 reset filtre catégorie de la modale
    setModalCategoryId('');

    if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setShowModal(true);
  };

  const handleEditClick = (image) => {
    setIsEditing(true);
    setCurrentId(image.id);
    setFormData({
      file: null,
      description: image.description ?? '',
      idProduct: image.idProduct ?? '',
      title: image.title ?? '',
      position: image.position ?? '',
      display: Boolean(image.display),
    });

    // Préselection de la catégorie dans la modale selon l'image
    const initCat = getCategoryIdForProductId(image.idProduct);
    setModalCategoryId(initCat ? String(initCat) : '');

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
      await dispatch(postUploadRequest({
        Id: currentId,
        File: formData.file,
        Type: 'IMAGE',
        Description: formData.description,
        IdProduct: formData.idProduct,
        Title: formData.title,
        Position: formData.position,
        Display: formData.display,
        TypeUpload: 'UPLOAD',
      }));
    } else {
      await dispatch(postUploadRequest({
        File: formData.file,
        Type: 'IMAGE',
        IdProduct: formData.idProduct,
        Description: formData.description,
        Title: formData.title,
        Position: formData.position,
        Display: formData.display,
        TypeUpload: 'ADD',
      }));
    }
    await dispatch(getImageRequest());
    setShowModal(false);
  };

  // ------- Tri + filtres du tableau principal -------
  const sortedImages = useMemo(() => {
    return [...imagesFromStore].sort((a, b) =>
      collator.compare(getProductName(a.idProduct), getProductName(b.idProduct))
    );
  }, [imagesFromStore, collator, productsFromStore]);

  const filteredImages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return sortedImages.filter((img) => {
      if (selectedCategoryId) {
        const catId = getCategoryIdForProductId(img.idProduct);
        if (String(catId) !== String(selectedCategoryId)) return false;
      }
      if (selectedProductId && String(img.idProduct) !== String(selectedProductId)) {
        return false;
      }
      if (!q) return true;
      const url   = String(img.url || '').toLowerCase();
      const desc  = String(img.description || '').toLowerCase();
      const title = String(img.title || '').toLowerCase();
      const pname = String(getProductName(img.idProduct) || '').toLowerCase();
      return url.includes(q) || desc.includes(q) || title.includes(q) || pname.includes(q);
    });
  }, [sortedImages, selectedCategoryId, selectedProductId, searchQuery]);

  // Catégories triées (global + modale)
  const sortedCategories = useMemo(() => {
    return [...categoriesFromStore].sort((a, b) =>
      collator.compare(a?.name ?? '', b?.name ?? '')
    );
  }, [categoriesFromStore, collator]);

  // ✅ Produits filtrés *dans la modale* + tri alphabétique FR
  const modalProducts = useMemo(() => {
    const byCategory = modalCategoryId
      ? sortedProducts.filter(p => String(getCategoryIdForProduct(p)) === String(modalCategoryId))
      : sortedProducts;

    return [...byCategory].sort((a, b) =>
      collator.compare(getProductLabel(a), getProductLabel(b))
    );
  }, [sortedProducts, modalCategoryId, collator]);

  // Si changement de catégorie *dans la modale* rend le produit invalide -> reset idProduct
  useEffect(() => {
    if (!formData.idProduct) return;
    if (!modalCategoryId) return;
    const prod = getProductById(formData.idProduct);
    const prodCatId = getCategoryIdForProduct(prod);
    if (String(prodCatId) !== String(modalCategoryId)) {
      setFormData((prev) => ({ ...prev, idProduct: '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalCategoryId]);

  return (
    <div className='container py-5'>
      <h1 className="text-center mb-4">Gestion des images</h1>

      <div className="d-flex flex-wrap gap-2 justify-content-between mb-3">
        <div className="d-flex gap-2 flex-grow-1">
          {/* Filtre Catégorie (global tableau) */}
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

          {/* Filtre Produit (global tableau) */}
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
              <th>Catégorie</th>
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
                <td>{getCategoryNameForProductId(img.idProduct)}</td>
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
                    onClick={(e) => { e.stopPropagation(); handleEditClick(img); }}
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button
                    className='btn btn-sm btn-danger'
                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(img.id); }}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
            {filteredImages.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center">Aucune image trouvée.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="admin-modal-backdrop" role="presentation" onClick={() => setShowModal(false)}>
          <div className="admin-modal-panel" role="dialog" aria-modal="true" aria-labelledby="image-modal-title" onClick={(e) => e.stopPropagation()}>
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
                    <img src={toMediaUrl(previewUrl)} alt="preview" style={{ width: '120px', height: 'auto', borderRadius: 6 }} />
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

              {/* ✅ Sélecteur Catégorie dans la modale (filtre la liste des produits) */}
              <div className="mb-3">
                <label>Catégorie</label>
                <select
                  className="form-select"
                  value={modalCategoryId}
                  onChange={(e) => setModalCategoryId(e.target.value)}
                >
                  <option value="">Toutes les catégories</option>
                  {sortedCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* ✅ Sélecteur Produit (tri alphabétique, filtré par catégorie de la modale) */}
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
                  {modalProducts.map((product) => (
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
