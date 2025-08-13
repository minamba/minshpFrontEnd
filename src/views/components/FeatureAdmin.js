import React, { useState, useEffect } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');
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
    const category = categoriesFromStore.find((c) => c.id === id);
    return category ? category.name : 'Catégorie inconnue';
  };

  const getFeatureCategoryName = (id) => {
    const featureCategory = featureCategoriesFromStore.find((fc) => fc.id === id);
    return featureCategory ? featureCategory.name : 'Catégorie de caractéristiques inconnue';
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
