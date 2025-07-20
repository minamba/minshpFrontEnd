import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  getCategoryRequest,
  addCategoryRequest,
  updateCategoryRequest,
  deleteCategoryRequest
} from '../../lib/actions/CategoryActions';

export const CategoryAdmin = () => {
  const categoriesFromStore = useSelector((state) => state.categories.categories) || [];
  const dispatch = useDispatch();

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: ''
  });

  useEffect(() => {
    dispatch(getCategoryRequest());
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ name: '' });
    setShowModal(true);
  };

  const handleEditClick = (category) => {
    setIsEditing(true);
    setCurrentId(category.id);
    setFormData({
      id: category.id,
      name: category.name
    });
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
    } else {
      await dispatch(addCategoryRequest({ name: formData.name }));
    }
    await dispatch(getCategoryRequest());
    setShowModal(false);
  };

  const sortedCategories = [...categoriesFromStore].sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    return nameA.localeCompare(nameB);
  });

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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedCategories.map((cat) => (
              <tr key={cat.id} onClick={() => handleEditClick(cat)} style={{ cursor: 'pointer' }}>
                <td>{cat.name}</td>
                <td>
                  <button
                    className='btn btn-sm btn-warning me-2'
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(cat);
                    }}
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button
                    className='btn btn-sm btn-danger'
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(cat.id);
                    }}
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
