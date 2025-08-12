import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  getCategoryRequest,
  addCategoryRequest,
  updateCategoryRequest,
  deleteCategoryRequest
} from '../../lib/actions/CategoryActions';
import {
  getImageRequest,
  updateImageRequest, // lier l'image à une catégorie
} from '../../lib/actions/ImageActions';
import { getProductUserRequest } from '../../lib/actions/ProductActions'; // <-- ajouté
import '../../App.css';

export const CategoryAdmin = () => {
  const categoriesFromStore = useSelector((state) => state.categories.categories) || [];
  const imagesFromStore    = useSelector((state) => state.images.images) || [];
  const productsFromStore  = useSelector((state) => state.products.products) || []; // <-- ajouté
  const dispatch = useDispatch();

  const [showModal, setShowModal]   = useState(false);
  const [isEditing, setIsEditing]   = useState(false);
  const [currentId, setCurrentId]   = useState(null);
  const [formData, setFormData]     = useState({ name: '' });
  const [idImage, setIdImage]       = useState(''); // image sélectionnée
  const [selectedProductId, setSelectedProductId] = useState(''); // <-- produit sélectionné (édition)

  useEffect(() => {
    dispatch(getCategoryRequest());
    dispatch(getImageRequest());
    dispatch(getProductUserRequest()); // <-- charger aussi les produits
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ name: '' });
    setIdImage('');
    setSelectedProductId(''); // pas de sélection produit en création
    setShowModal(true);
  };

  const handleEditClick = (category) => {
    setIsEditing(true);
    setCurrentId(category.id);
    setFormData({ id: category.id, name: category.name });

    // préremplir l'image déjà liée à cette catégorie (si existante)
    const img = imagesFromStore.find((i) => Number(i.idCategory) === Number(category.id));
    setIdImage(img ? String(img.id) : '');

    // préselectionner un produit :
    // 1) si l'image liée a un idProduct -> choisir ce produit
    // 2) sinon, choisir le premier produit de la catégorie
    const productsInCat = productsFromStore.filter(
      (p) => Number(p.idCategory) === Number(category.id)
    );
    if (img?.idProduct) {
      setSelectedProductId(String(img.idProduct));
    } else if (productsInCat.length > 0) {
      setSelectedProductId(String(productsInCat[0].id));
    } else {
      setSelectedProductId('');
    }

    setShowModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Supprimer cette catégorie ?')) {
      await dispatch(deleteCategoryRequest(id));
      await dispatch(getCategoryRequest());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEditing) {
      await dispatch(updateCategoryRequest({ id: currentId, name: formData.name }));

      // lier l'image choisie à la catégorie (si sélectionnée)
      if (idImage) {
        await dispatch(updateImageRequest({ id: Number(idImage), idCategory: Number(currentId) }));
      }
    } else {
      // créer la catégorie
      await dispatch(addCategoryRequest({ name: formData.name }));
      await dispatch(getCategoryRequest());

      // retrouver l'id du nouvel enregistrement (si l'API ne renvoie pas l'id créé)
      const created = (storeCategories =>
        (storeCategories.find(c => c.name === formData.name) || null)
      )(
        (await new Promise(resolve =>
          setTimeout(() => resolve(categoriesFromStore), 150)
        ))
      );

      const newId = (created && created.id) || (categoriesFromStore.find(c => c.name === formData.name)?.id);

      if (idImage && newId) {
        await dispatch(updateImageRequest({ id: Number(idImage), idCategory: Number(newId) }));
      }
    }

    await dispatch(getImageRequest()); // rafraîchir l’aperçu
    await dispatch(getCategoryRequest());
    setShowModal(false);
  };

  const sortedCategories = useMemo(
    () => [...categoriesFromStore].sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    ),
    [categoriesFromStore]
  );

  const getCategoryImage = (idCategory) => {
    const image = imagesFromStore.find((i) => Number(i.idCategory) === Number(idCategory));
    return image ? image.url : '/Images/placeholder.jpg';
  };

  const getCategoryId = (catName) => {
    const category = categoriesFromStore.find((c) => c.name === catName);
    return category ? category.id : null;
  };

  // --- Produits de la catégorie sélectionnée (édition uniquement)
  const productsInCurrentCategory = useMemo(() => {
    if (!isEditing || !currentId) return [];
    return productsFromStore.filter(
      (p) => Number(getCategoryId(p.category)) === Number(currentId)
    );
  }, [isEditing, currentId, productsFromStore]);

  // --- Images du produit sélectionné (édition)
  const imagesOfSelectedProduct = useMemo(() => {
    if (!isEditing || !selectedProductId) return [];
    return imagesFromStore.filter(
      (img) => Number(img.idProduct) === Number(selectedProductId)
    );
  }, [isEditing, selectedProductId, imagesFromStore]);

  // --- En création : images non liées à une catégorie (si tu veux garder la sélection d'image en création)
  const imagesForCreate = useMemo(() => {
    if (isEditing) return [];
    return imagesFromStore.filter((i) => !i.idCategory);
  }, [isEditing, imagesFromStore]);

  return (
    <div className='container py-5'>
      <h1 className="text-center mb-4">Gestion des catégories</h1>

      <div className="d-flex justify-content-end mb-3">
        <button className='btn btn-success' onClick={handleAddClick}>
          Ajouter une catégorie
        </button>
      </div>

      <div className='table-responsive'>
        <table className='table table-striped table-hover shadow-sm'>
          <thead className='table-dark'>
            <tr>
              <th>Nom</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedCategories.map((cat) => (
              <tr key={cat.id} onClick={() => handleEditClick(cat)} style={{ cursor: 'pointer' }}>
                <td>{cat.name}</td>
                <td>
                  <img src={getCategoryImage(cat.id)} width={100} alt={cat.name} />
                </td>
                <td>
                  <button
                    className='btn btn-sm btn-warning me-2'
                    onClick={(e) => { e.stopPropagation(); handleEditClick(cat); }}
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button
                    className='btn btn-sm btn-danger'
                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(cat.id); }}
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
            <h2 className="mb-3">{isEditing ? 'Modifier la catégorie' : 'Ajouter une catégorie'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label>Nom</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {isEditing ? (
                <>
                  {/* --------- Sélecteur de produits de la catégorie --------- */}
                  <div className="mb-3">
                    <label>Produits de cette catégorie</label>
                    <select
                      className="form-select mt-2"
                      value={selectedProductId}
                      onChange={(e) => {
                        setSelectedProductId(e.target.value);
                        setIdImage(''); // reset l'image si on change de produit
                      }}
                    >
                      {productsInCurrentCategory.length === 0 && (
                        <option value="">Aucun produit dans cette catégorie</option>
                      )}
                      {productsInCurrentCategory.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name || p.title || `Produit #${p.id}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* --------- Grille des images du produit sélectionné --------- */}
                  <div className="mb-3">
                    <label>Images du produit sélectionné</label>
                    <div className="d-flex flex-wrap gap-3 mt-2">
                      {imagesOfSelectedProduct.map(img => (
                        <button
                          type="button"
                          key={img.id}
                          onClick={() => setIdImage(String(img.id))}
                          className={`p-1 border rounded ${String(idImage) === String(img.id) ? 'border-primary' : 'border-200'}`}
                          style={{ width: 120 }}
                          title={img.fileName || img.url}
                        >
                          <img
                            src={img.url}
                            alt={img.fileName || `img-${img.id}`}
                            style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 6 }}
                          />
                          <div className="form-check mt-1">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="idImage"
                              checked={String(idImage) === String(img.id)}
                              onChange={() => setIdImage(String(img.id))}
                            />
                            <label className="form-check-label" style={{ fontSize: 12 }}>
                              #{img.id}
                            </label>
                          </div>
                        </button>
                      ))}
                      {imagesOfSelectedProduct.length === 0 && (
                        <div className="text-muted">Aucune image pour ce produit.</div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                // ----- Création : si tu veux pouvoir choisir une image déjà uploadée mais non liée -----
                <div className="mb-3">
                  <label>Images disponibles (non liées)</label>
                  <div className="d-flex flex-wrap gap-3 mt-2">
                    {imagesForCreate.map(img => (
                      <button
                        type="button"
                        key={img.id}
                        onClick={() => setIdImage(String(img.id))}
                        className={`p-1 border rounded ${String(idImage) === String(img.id) ? 'border-primary' : 'border-200'}`}
                        style={{ width: 120 }}
                        title={img.fileName || img.url}
                      >
                        <img
                          src={img.url}
                          alt={img.fileName || `img-${img.id}`}
                          style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 6 }}
                        />
                        <div className="form-check mt-1">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="idImage"
                            checked={String(idImage) === String(img.id)}
                            onChange={() => setIdImage(String(img.id))}
                          />
                          <label className="form-check-label" style={{ fontSize: 12 }}>
                            #{img.id}
                          </label>
                        </div>
                      </button>
                    ))}
                    {imagesForCreate.length === 0 && (
                      <div className="text-muted">Aucune image disponible.</div>
                    )}
                  </div>
                </div>
              )}

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
