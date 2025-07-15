import React, { useState } from 'react';
import '../../App.css';


export const CategoryAdmin = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Produit ajouté:', formData);
    setShowModal(false);
    setFormData({ name: '', description: '', price: '', category: '' });
  };

  return (
    <div className='container py-5'>
      <h1 className="text-center mb-4">Gestion des catégories</h1>
      <div className="d-flex justify-content-end mb-3">
        <button className='btn btn-success' onClick={() => setShowModal(true)}>
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
            <tr>
              <td>Catégorie 1</td>
              <td>
                <button className='btn btn-sm btn-warning me-2'>
                    <i className="bi bi-pencil"></i>
                </button>
                <button className='btn btn-sm btn-danger me-2'>
                    <i className="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content-custom">
            <h2 className="mb-3">Ajouter une catégorie</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label>Nom</label>
                <input type="text" name="name" className="form-control" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-secondary me-2" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-dark">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};