import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getFeatureCategoryRequest,
  addFeatureCategoryRequest,
  updateFeatureCategoryRequest,
  deleteFeatureCategoryRequest,
} from "../../lib/actions/FeatureCategoryActions"; // <- adapte le chemin si besoin
import "../../App.css";

export const FeatureCategoryAdmin = () => {
  const dispatch = useDispatch();

  // liste depuis le store
  const featureCategories =
    useSelector((s) => s.featureCategories?.featureCategories) || [];

  // UI state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({ name: "" });

  // charger la liste au mount
  useEffect(() => {
    dispatch(getFeatureCategoryRequest());
  }, [dispatch]);

  // helpers UI
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ name: "" });
    setShowModal(true);
  };

  const handleEditClick = (item) => {
    setIsEditing(true);
    setCurrentId(item.id);
    setFormData({ id: item.id, name: item.name });
    setShowModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Supprimer cette catégorie de caractéristiques ?")) return;
    await dispatch(deleteFeatureCategoryRequest(id));
    await dispatch(getFeatureCategoryRequest());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) {
      await dispatch(
        updateFeatureCategoryRequest({ id: currentId, name: formData.name })
      );
    } else {
      await dispatch(addFeatureCategoryRequest({ name: formData.name }));
    }
    await dispatch(getFeatureCategoryRequest());
    setShowModal(false);
  };

  const sorted = [...featureCategories].sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">Gestion des catégories de caractéristiques</h1>

      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-success" onClick={handleAddClick}>
          Ajouter une catégorie de caractéristiques
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>Nom</th>
              <th style={{ width: 160 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((cat) => (
              <tr
                key={cat.id}
                onClick={() => handleEditClick(cat)}
                style={{ cursor: "pointer" }}
              >
                <td>{cat.name}</td>
                <td>
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(cat);
                    }}
                  >
                    <i className="bi bi-pencil" />
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(cat.id);
                    }}
                  >
                    <i className="bi bi-trash" />
                  </button>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={2} className="text-center text-muted">
                  Aucune catégorie pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content-custom">
            <h2 className="mb-3">
              {isEditing
                ? "Modifier la catégorie de caractéristiques"
                : "Ajouter une catégorie de caractéristiques"}
            </h2>
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
                  {isEditing ? "Modifier" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
