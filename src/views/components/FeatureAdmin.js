import React, { useState, useEffect, useMemo } from 'react';
import '../../App.css';
import { useSelector, useDispatch } from 'react-redux';
import {
  getFeatureRequest,
  addFeatureRequest,
  updateFeatureRequest,
  deleteFeatureRequest
} from '../../lib/actions/FeatureActions';
import { getCategoryRequest } from '../../lib/actions/CategoryActions';
import { getFeatureCategoryRequest } from '../../lib/actions/FeatureCategoryActions';

export const FeatureAdmin = () => {
  const featuresFromStore = useSelector((state) => state.features.features) || [];
  const categoriesFromStore = useSelector((state) => state.categories.categories) || [];
  const featureCategoriesFromStore = useSelector((state) => state.featureCategories.featureCategories) || [];
  const dispatch = useDispatch();

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // ✅ Nouveaux filtres
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [searchDescription, setSearchDescription] = useState('');

  const [formData, setFormData] = useState({
    description: '',
    idCategory: '',
    idFeatureCategory: ''
  });

  useEffect(() => {
    dispatch(getFeatureRequest());
    dispatch(getCategoryRequest());
    dispatch(getFeatureCategoryRequest());
  }, [dispatch]);

  // Fermer avec ESC + bloquer le scroll quand la modale est ouverte
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ description: '', idCategory: '', idFeatureCategory: '' });
    setShowModal(true);
  };

  const handleEditClick = (feature) => {
    setIsEditing(true);
    setCurrentId(feature.id);
    setFormData({
      id: feature.id,
      description: feature.description ?? '',
      idCategory: feature.idCategory ?? '',
      idFeatureCategory: feature.idFeatureCategory ?? ''
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
    const payload = {
      id: currentId,
      description: formData.description || null,
      idCategory: formData.idCategory || null,
      idFeatureCategory: formData.idFeatureCategory || null,
    };

    if (isEditing) {
      await dispatch(updateFeatureRequest(payload));
    } else {
      const { id, ...createPayload } = payload;
      await dispatch(addFeatureRequest(createPayload));
    }

    await dispatch(getFeatureRequest());
    setShowModal(false);
  };

  const getCategoryName = (id) => {
    const category = categoriesFromStore.find((c) => String(c.id) === String(id));
    return category ? category.name : 'Catégorie inconnue';
  };

  const getFeatureCategoryName = (id) => {
    const featureCategory = featureCategoriesFromStore.find((fc) => String(fc.id) === String(id));
    return featureCategory ? featureCategory.name : 'Catégorie de caractéristiques inconnue';
  };

  // Normalisation pour recherche (sans accents / insensible à la casse)
  const normalize = (s) =>
    (s ?? '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  // ✅ Liste calculée avec filtres + tri
  const sortedAndFilteredFeatures = useMemo(() => {
    const q = normalize(searchDescription);

    return [...featuresFromStore]
      .map((feature) => ({
        ...feature,
        categoryName: getCategoryName(feature.idCategory)
      }))
      .filter((feature) => {
        // Filtre catégorie (select)
        if (selectedCategoryId) {
          if (String(feature.idCategory) !== String(selectedCategoryId)) return false;
        }
        // Filtre description (saisie)
        if (q && !normalize(feature.description).includes(q)) return false;

        return true;
      })
      // Tri principal : Catégorie puis Description
      .sort((a, b) => {
        const catCmp = (a.categoryName || '').localeCompare(b.categoryName || '');
        if (catCmp !== 0) return catCmp;
        return (a.description || '').localeCompare(b.description || '');
      });
  }, [featuresFromStore, selectedCategoryId, searchDescription]);

  return (
    <div className='container py-5'>
      <h1 className="text-center mb-4">Gestion des caractéristiques</h1>

      {/* ✅ Barre de filtres (remplace l'ancien champ de recherche) */}
      <div className="d-flex justify-content-between align-items-end flex-wrap gap-2 mb-3">
        <div className="flex-grow-1" style={{ minWidth: 240 }}>
          <label className="form-label">Filtrer par catégorie</label>
          <select
            className="form-select"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
          >
            <option value="">Toutes les catégories</option>
            {categoriesFromStore.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-grow-1" style={{ minWidth: 260 }}>
          <label className="form-label">Rechercher une caractéristique</label>
          <input
            type="text"
            className="form-control"
            placeholder="Ex : Résolution, Mémoire, Connectivité…"
            value={searchDescription}
            onChange={(e) => setSearchDescription(e.target.value)}
          />
        </div>

        <div className="ms-auto">
          <button className='btn btn-success' onClick={handleAddClick}>
            Ajouter une caractéristique
          </button>
        </div>
      </div>

      <div className='table-responsive'>
        <table className='table table-striped table-hover shadow-sm'>
          <thead className='table-dark'>
            <tr>
              <th>Description</th>
              <th>Catégorie</th>
              <th>Catégorie de caractéristiques</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredFeatures.length > 0 ? (
              sortedAndFilteredFeatures.map((feature) => (
                <tr
                  key={feature.id}
                  onClick={() => handleEditClick(feature)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{feature.description}</td>
                  <td>{feature.categoryName}</td>
                  <td>{getFeatureCategoryName(feature.idFeatureCategory)}</td>
                  <td>
                    <button
                      className='btn btn-sm btn-warning me-2'
                      onClick={(e) => { e.stopPropagation(); handleEditClick(feature); }}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className='btn btn-sm btn-danger'
                      onClick={(e) => { e.stopPropagation(); handleDeleteClick(feature.id); }}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">Aucune caractéristique trouvée.</td>
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
            aria-labelledby="feature-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="feature-modal-title" className="mb-3">
              {isEditing ? 'Modifier la caractéristique' : 'Ajouter une caractéristique'}
            </h2>

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
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label>Catégorie de caractéristiques</label>
                <select
                  name="idFeatureCategory"
                  className="form-select"
                  value={formData.idFeatureCategory}
                  onChange={handleInputChange}
                >
                  <option value="">Sélectionnez une catégorie de caractéristiques</option>
                  {featureCategoriesFromStore.map((fc) => (
                    <option key={fc.id} value={fc.id}>{fc.name}</option>
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
