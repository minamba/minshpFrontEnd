// src/views/components/ApplicationAdmin.jsx
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

  const emptyForm = {
    displayNewProductNumber: 0,
    startDate: '',
    endDate: '',
    // ↓↓↓ nouveaux champs ↓↓↓
    defaultDropOffMondialRelay: '',
    defaultDropOffChronoPost: '',
    defaultDropOffUps: '',
    defaultDropLaposte: '',
    societyName: '',
    societyAddress: '',
    societyZipCode: '',
    societyCity: '',
  };
  const [formData, setFormData] = useState(emptyForm);

  // Helpers
  const toInputDate = (val) => {
    if (!val) return '';
    const d = new Date(val);
    return isNaN(d) ? String(val).slice(0, 10) : d.toISOString().slice(0, 10);
  };

  const isValidRange = (start, end) => {
    if (!start || !end) return true;
    return new Date(end) >= new Date(start);
  };

  // Chargement initial
  useEffect(() => { dispatch(getApplicationRequest()); }, [dispatch]);

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
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleEditClick = (app) => {
    setIsEditing(true);
    setCurrentId(app.id);

    setFormData({
      displayNewProductNumber: Number(app.displayNewProductNumber ?? 0),
      startDate: toInputDate(app.startDate),
      endDate: toInputDate(app.endDate),

      defaultDropOffMondialRelay: app.defaultDropOffMondialRelay ?? '',
      defaultDropOffChronoPost:  app.defaultDropOffChronoPost ?? '',
      defaultDropOffUps:         app.defaultDropOffUps ?? '',
      defaultDropLaposte:        app.defaultDropLaposte ?? '',

      societyName:    app.societyName ?? '',
      societyAddress: app.societyAddress ?? '',
      societyZipCode: app.societyZipCode ?? '',
      societyCity:    app.societyCity ?? '',
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

    // Payload complet avec les nouveaux champs
    const payload = {
      displayNewProductNumber: Number(formData.displayNewProductNumber ?? 0),
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,

      defaultDropOffMondialRelay: formData.defaultDropOffMondialRelay || null,
      defaultDropOffChronoPost:  formData.defaultDropOffChronoPost || null,
      defaultDropOffUps:         formData.defaultDropOffUps || null,
      defaultDropLaposte:        formData.defaultDropLaposte || null,

      societyName:    formData.societyName || null,
      societyAddress: formData.societyAddress || null,
      societyZipCode: formData.societyZipCode || null,
      societyCity:    formData.societyCity || null,
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
              <th>Nb produits à afficher</th>
              <th>Date début</th>
              <th>Date fin</th>
              <th>DropOff_mondialRelay</th>
              <th>DropOff_chronoPost</th>
              <th>DropOff_ups</th>
              <th>DropOff_laposte</th>
              <th>SocietyName</th>
              <th>SocietyAddress</th>
              <th>SocietyZipCode</th>
              <th>SocietyCity</th>
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

                <td>{app.defaultDropOffMondialRelay ?? '—'}</td>
                <td>{app.defaultDropOffChronoPost ?? '—'}</td>
                <td>{app.defaultDropOffUps ?? '—'}</td>
                <td>{app.defaultDropLaposte ?? '—'}</td>

                <td>{app.societyName ?? '—'}</td>
                <td>{app.societyAddress ?? '—'}</td>
                <td>{app.societyZipCode ?? '—'}</td>
                <td>{app.societyCity ?? '—'}</td>

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
                <td colSpan={12} className="text-center text-muted py-4">
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
            style={{ maxWidth: 920 }}
          >
            <h2 id="application-modal-title" className="mb-3">
              {isEditing ? 'Modifier l’application' : 'Ajouter une application'}
            </h2>

            <form onSubmit={handleSubmit}>
              {/* Ligne 1 : nombre + dates */}
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Nb de produits à afficher</label>
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
                <div className="col-md-4">
                  <label className="form-label">Date début</label>
                  <input
                    type="date"
                    name="startDate"
                    className="form-control"
                    value={formData.startDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Date fin</label>
                  <input
                    type="date"
                    name="endDate"
                    className="form-control"
                    value={formData.endDate}
                    min={formData.startDate || undefined}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <hr className="my-3" />

              {/* Ligne 2 : DropOffs */}
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">DropOff Mondial Relay</label>
                  <input
                    name="defaultDropOffMondialRelay"
                    className="form-control"
                    placeholder="Ex: CODE_MR"
                    value={formData.defaultDropOffMondialRelay}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">DropOff Chronopost</label>
                  <input
                    name="defaultDropOffChronoPost"
                    className="form-control"
                    placeholder="Ex: CODE_CHRP"
                    value={formData.defaultDropOffChronoPost}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">DropOff UPS</label>
                  <input
                    name="defaultDropOffUps"
                    className="form-control"
                    placeholder="Ex: CODE_UPS"
                    value={formData.defaultDropOffUps}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">DropOff La Poste</label>
                  <input
                    name="defaultDropLaposte"
                    className="form-control"
                    placeholder="Ex: CODE_LAPOSTE"
                    value={formData.defaultDropLaposte}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <hr className="my-3" />

              {/* Ligne 3 : Société */}
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Nom de la société</label>
                  <input
                    name="societyName"
                    className="form-control"
                    value={formData.societyName}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Adresse de la société</label>
                  <input
                    name="societyAddress"
                    className="form-control"
                    value={formData.societyAddress}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Code postal</label>
                  <input
                    name="societyZipCode"
                    className="form-control"
                    value={formData.societyZipCode}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-8">
                  <label className="form-label">Ville</label>
                  <input
                    name="societyCity"
                    className="form-control"
                    value={formData.societyCity}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end mt-3">
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
