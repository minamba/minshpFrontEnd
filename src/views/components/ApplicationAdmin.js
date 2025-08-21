import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getApplicationRequest,
  addApplicationRequest,
  updateApplicationRequest,
  deleteApplicationRequest
} from '../../lib/actions/ApplicationActions';
import '../../App.css';

export const ApplicationAdmin = () => {
  const applicationsFromStore = useSelector((s) => s.applications?.applications) || [];
  const dispatch = useDispatch();

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    displayNewProductNumber: 0,
    startDate: '',
    endDate: ''
  });

  // Helpers
  const toInputDate = (val) => {
    if (!val) return '';
    // essai ISO → yyyy-MM-dd sinon tronque
    const d = new Date(val);
    return isNaN(d) ? String(val).slice(0, 10) : d.toISOString().slice(0, 10);
  };

  const isValidRange = (start, end) => {
    if (!start || !end) return true;
    return new Date(end) >= new Date(start);
  };

  // Chargement initial
  useEffect(() => {
    dispatch(getApplicationRequest());
  }, [dispatch]);

  // Bloque le scroll + ESC
  useEffect(() => {
    document.body.classList.toggle('no-scroll', showModal);
    const onKey = (e) => { if (e.key === 'Escape') setShowModal(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
    };
  }, [showModal]);

  const sortedApplications = useMemo(
    () =>
      [...applicationsFromStore].sort((a, b) => {
        const da = new Date(a?.startDate || 0).getTime();
        const db = new Date(b?.startDate || 0).getTime();
        return db - da; // plus récentes d'abord
      }),
    [applicationsFromStore]
  );

  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      displayNewProductNumber: 0,
      startDate: '',
      endDate: ''
    });
    setShowModal(true);
  };

  const handleEditClick = (app) => {
    setIsEditing(true);
    setCurrentId(app.id);
    setFormData({
      id: app.id,
      displayNewProductNumber: Number(app.displayNewProductNumber ?? 0),
      startDate: toInputDate(app.startDate),
      endDate: toInputDate(app.endDate)
    });
    setShowModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Supprimer cette application ?')) {
      await dispatch(deleteApplicationRequest(id));
      await dispatch(getApplicationRequest());
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'displayNewProductNumber') {
      // garde un entier >= 0
      const n = Math.max(0, parseInt(value || '0', 10));
      setFormData((prev) => ({ ...prev, [name]: n }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidRange(formData.startDate, formData.endDate)) {
      alert('La date de fin doit être postérieure ou égale à la date de début.');
      return;
    }

    const payload = {
      displayNewProductNumber: Number(formData.displayNewProductNumber ?? 0),
      startDate: formData.startDate || null,
      endDate: formData.endDate || null
    };

    if (isEditing) {
      await dispatch(updateApplicationRequest({ id: currentId, ...payload }));
    } else {
      await dispatch(addApplicationRequest(payload));
    }

    await dispatch(getApplicationRequest());
    setShowModal(false);
  };

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">Gestion des applications</h1>

      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-success" onClick={handleAddClick}>
          Ajouter une application
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>Nb nouveaux produits à afficher</th>
              <th>Date début</th>
              <th>Date fin</th>
              <th style={{ width: 140 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedApplications.map((app) => (
              <tr
                key={app.id}
                onClick={() => handleEditClick(app)}
                style={{ cursor: 'pointer' }}
              >
                <td>{app.displayNewProductNumber ?? '—'}</td>
                <td className="text-muted">{app.startDate || '—'}</td>
                <td className="text-muted">{app.endDate || '—'}</td>
                <td>
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={(e) => { e.stopPropagation(); handleEditClick(app); }}
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(app.id); }}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
            {sortedApplications.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-muted py-4">
                  Aucune application.
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
            aria-labelledby="application-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="application-modal-title" className="mb-3">
              {isEditing ? 'Modifier l’application' : 'Ajouter une application'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label>Nb de produits à afficher</label>
                <input
                  type="number"
                  name="displayNewProductNumber"
                  min={0}
                  className="form-control"
                  value={formData.displayNewProductNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label>Date début</label>
                <input
                  type="date"
                  name="startDate"
                  className="form-control"
                  value={formData.startDate}
                  onChange={handleChange}
                  
                />
              </div>

              <div className="mb-3">
                <label>Date fin</label>
                <input
                  type="date"
                  name="endDate"
                  className="form-control"
                  value={formData.endDate}
                  min={formData.startDate || undefined}
                  onChange={handleChange}
                  
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
