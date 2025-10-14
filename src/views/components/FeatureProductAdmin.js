import React, { useState, useEffect, useMemo } from 'react';
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
  // ------- Stores -------
  const featureProductsFromStore   = useSelector((s) => s.featureProducts?.featureProducts) || [];
  const productsFromStore          = useSelector((s) => s.products?.products) || [];
  const featuresFromStore          = useSelector((s) => s.features?.features) || [];
  const categoriesFromStore        = useSelector((s) => s.categories?.categories) || [];
  const featureCategoriesFromStore = useSelector((s) => s.featureCategories?.featureCategories) || [];

  const dispatch = useDispatch();

  // ------- UI State -------
  const [showModal, setShowModal]   = useState(false);
  const [isEditing, setIsEditing]   = useState(false);
  const [currentId, setCurrentId]   = useState(null);
  const [formData, setFormData]     = useState({ idProduct: '', idFeature: '' });

  // Filtres
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedProductId, setSelectedProductId]   = useState('');

  // Recherche par "feature"
  const [searchFeature, setSearchFeature] = useState('');

  useEffect(() => {
    dispatch(getFeatureProductRequest());
    dispatch(getProductUserRequest());
    dispatch(getFeatureRequest());
  }, [dispatch]);

  // Scroll + ESC modale
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

  // ------- Helpers -------
  const getProductById = (id) => productsFromStore.find(p => String(p.id) === String(id));
  const getCategoryById = (id) => categoriesFromStore.find(c => String(c.id) === String(id));
  const getFeatureById  = (id) => featuresFromStore.find(f => String(f.id) === String(id));

  const getProductName = (id) => {
    const p = getProductById(id);
    return p ? `${p.brand ?? ''} - ${p.model ?? ''}`.trim() : 'Produit inconnu';
  };

  const getProductCategoryId = (productId) => {
    const p = getProductById(productId);
    if (!p) return null;
    const byId = p.idCategory != null ? getCategoryById(p.idCategory) : null;
    if (byId) return byId.id;
    const byName = categoriesFromStore.find(c => c.name === p.category);
    return byName ? byName.id : null;
  };

  const getProductCategoryName = (productId) => {
    const catId = getProductCategoryId(productId);
    const cat   = catId ? getCategoryById(catId) : null;
    return cat ? cat.name : 'Catégorie inconnue';
  };

  const getFeatureDescription = (featureId) => {
    const f = getFeatureById(featureId);
    return f ? f.description : 'Caractéristique inconnue';
  };

  const getFeatureCategoryName = (featureId) => {
    const f  = getFeatureById(featureId);
    if (!f) return 'inconnue';
    const fc = featureCategoriesFromStore.find(x => String(x.id) === String(f.idFeatureCategory));
    return fc ? fc.name : 'inconnue';
  };

  const normalize = (str) =>
    (str ?? '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  // ------- Filtres des listes en haut -------
  const filteredProductsOptions = useMemo(() => {
    if (!selectedCategoryId) return productsFromStore;
    return productsFromStore.filter(p => {
      const catId = getProductCategoryId(p.id);
      return String(catId) === String(selectedCategoryId);
    });
  }, [productsFromStore, selectedCategoryId]);

  // ------- Filtrage du tableau -------
  const filteredFeatureProducts = useMemo(() => {
    let rows = featureProductsFromStore;

    if (selectedCategoryId) {
      rows = rows.filter(fp => {
        const catId = getProductCategoryId(fp.idProduct);
        return String(catId) === String(selectedCategoryId);
      });
    }

    if (selectedProductId) {
      rows = rows.filter(fp => String(fp.idProduct) === String(selectedProductId));
    }

    if (searchFeature.trim() !== '') {
      const q = normalize(searchFeature);
      rows = rows.filter(fp => normalize(getFeatureDescription(fp.idFeature)).includes(q));
    }

    return rows;
  }, [featureProductsFromStore, selectedCategoryId, selectedProductId, searchFeature]);

  // ------- TRI DU TABLEAU : Catégorie (produit) -> Caractéristique (alpha FR) -> Produit (tiebreaker) -------
  const sortedRows = useMemo(() => {
    const collator = new Intl.Collator('fr', { sensitivity: 'base' });
    return [...filteredFeatureProducts].sort((a, b) => {
      const catA = getProductCategoryName(a.idProduct) ?? '';
      const catB = getProductCategoryName(b.idProduct) ?? '';
      const catCmp = collator.compare(catA, catB);
      if (catCmp !== 0) return catCmp;

      const featA = getFeatureDescription(a.idFeature) ?? '';
      const featB = getFeatureDescription(b.idFeature) ?? '';
      const featCmp = collator.compare(featA, featB);
      if (featCmp !== 0) return featCmp;

      // Tiebreaker sur le nom du produit
      const prodA = getProductName(a.idProduct) ?? '';
      const prodB = getProductName(b.idProduct) ?? '';
      return collator.compare(prodA, prodB);
    });
  }, [filteredFeatureProducts]);

  // ------- Caractéristiques proposées dans la modale (selon catégorie du produit) -------
  const featuresForSelectedProduct = useMemo(() => {
    if (!formData.idProduct) return [];
    const catId = getProductCategoryId(formData.idProduct);
    if (!catId) return [];
    return featuresFromStore.filter(f => String(f.idCategory) === String(catId));
  }, [formData.idProduct, featuresFromStore]);

  // Tri alphabétique (FR) dans la modale
  const sortedFeaturesForSelectedProduct = useMemo(() => {
    const collator = new Intl.Collator('fr', { sensitivity: 'base' });
    return [...featuresForSelectedProduct].sort((a, b) =>
      collator.compare(a?.description ?? '', b?.description ?? '')
    );
  }, [featuresForSelectedProduct]);

  // ------- Handlers -------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      idProduct: String(fp.idProduct ?? ''),
      idFeature: String(fp.idFeature ?? '')
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
        idFeature: formData.idFeature
      }));
    }
    await dispatch(getFeatureProductRequest());
    setShowModal(false);
  };

  // ------- Render -------
  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">Gestion des caractéristiques produits</h1>

      <div className="d-flex justify-content-between align-items-end flex-wrap gap-2 mb-3">
        <div className="flex-grow-1" style={{ minWidth: 240 }}>
          <label className="form-label">Catégorie (produit)</label>
          <select
            className="form-select"
            value={selectedCategoryId}
            onChange={(e) => {
              const newCatId = e.target.value;
              setSelectedCategoryId(newCatId);
              if (newCatId && selectedProductId) {
                const prodCatId = getProductCategoryId(selectedProductId);
                if (String(prodCatId) !== String(newCatId)) {
                  setSelectedProductId('');
                }
              }
            }}
          >
            <option value="">Toutes les catégories</option>
            {categoriesFromStore.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-grow-1" style={{ minWidth: 240 }}>
          <label className="form-label">Produit</label>
          <select
            className="form-select"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            <option value="">Tous les produits</option>
            {filteredProductsOptions.map(p => (
              <option key={p.id} value={p.id}>{getProductName(p.id)}</option>
            ))}
          </select>
        </div>

        <div className="flex-grow-1" style={{ minWidth: 260 }}>
          <label className="form-label">Rechercher une caractéristique</label>
          <input
            type="text"
            className="form-control"
            placeholder="Ex: Résolution, Mémoire, Connectivité…"
            value={searchFeature}
            onChange={(e) => setSearchFeature(e.target.value)}
          />
        </div>

        <div className="ms-auto">
          <button className="btn btn-success" onClick={handleAddClick}>
            Ajouter une association
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>Catégorie (produit)</th>
              <th>Produit</th>
              <th>Caractéristique</th>
              <th>Catégorie de caractéristique</th>
              <th style={{ width: 140 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map(fp => (
              <tr
                key={fp.id}
                onClick={() => handleEditClick(fp)}
                style={{ cursor: 'pointer' }}
              >
                <td>{getProductCategoryName(fp.idProduct)}</td>
                <td>{getProductName(fp.idProduct)}</td>
                <td>{getFeatureDescription(fp.idFeature)}</td>
                <td>{getFeatureCategoryName(fp.idFeature)}</td>
                <td>
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={(e) => { e.stopPropagation(); handleEditClick(fp); }}
                  >
                    <i className="bi bi-pencil" />
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(fp.id); }}
                  >
                    <i className="bi bi-trash" />
                  </button>
                </td>
              </tr>
            ))}
            {sortedRows.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-muted">
                  Aucune association trouvée.
                </td>
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
            aria-labelledby="fp-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="fp-modal-title" className="mb-3">
              {isEditing ? "Modifier l'association" : "Ajouter une association"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Produit</label>
                <select
                  name="idProduct"
                  className="form-select"
                  value={formData.idProduct}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, idProduct: e.target.value, idFeature: '' }));
                  }}
                  required
                  autoFocus
                >
                  <option value="">Sélectionnez un produit</option>
                  {productsFromStore.map((product) => (
                    <option key={product.id} value={product.id}>
                      {getProductName(product.id)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Caractéristique</label>
                <select
                  name="idFeature"
                  className="form-select"
                  value={formData.idFeature}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.idProduct}
                >
                  <option value="">
                    {formData.idProduct ? 'Sélectionnez une caractéristique' : 'Choisissez d’abord un produit'}
                  </option>

                  {sortedFeaturesForSelectedProduct.map((feature) => (
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
