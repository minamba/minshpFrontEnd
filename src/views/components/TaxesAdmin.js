import React, { useEffect, useState } from 'react';
import '../../App.css';
import { useDispatch, useSelector } from 'react-redux';
import {
  getTaxeRequest,
  addTaxeRequest,
  updateTaxeRequest,
  deleteTaxeRequest,
} from '../../lib/actions/TaxeActions'; // adapte le chemin si besoin

export const TaxesAdmin = () => {
  const dispatch = useDispatch();
  const taxes = useSelector((s) => s.taxes?.taxes) || [];

  // UI state
  const [showModal, setShowModal]   = useState(false);
  const [isEditing, setIsEditing]   = useState(false);
  const [currentId, setCurrentId]   = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    purcentage: '', // 0..100
    amount: '',     // montant fixe (€, peut être vide)
  });

  // Chargement initial
  useEffect(() => {
    dispatch(getTaxeRequest());
  }, [dispatch]);

  // ESC + bloque le scroll quand modale ouverte
  useEffect(() => {
    if (showModal) document.body.classList.add('no-scroll');
    else document.body.classList.remove('no-scroll');

    const onKey = (e) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
    };
  }, [showModal]);

  // Helpers
  const openCreate = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ name: '', purcentage: '', amount: '' });
    setShowModal(true);
  };

  const openEdit = (tax) => {
    setIsEditing(true);
    setCurrentId(tax.id);
    setFormData({
      name: tax.name ?? '',
      purcentage: tax.purcentage ?? '',
      amount: tax.amount ?? '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette taxe ?')) return;
    await dispatch(deleteTaxeRequest(id));
    await dispatch(getTaxeRequest());
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // parse/normalise
    const purcentage =
      formData.purcentage === '' ? null : Math.max(0, Math.min(100, Number(formData.purcentage)));
    const amount =
      formData.amount === '' ? null : Math.max(0, Number(formData.amount));

    const payload = {
      id: currentId,
      name: formData.name.trim(),
      purcentage, // peut être null
      amount,     // peut être null
    };

    if (isEditing) {
      await dispatch(updateTaxeRequest(payload));
    } else {
      const { id, ...createPayload } = payload;
      await dispatch(addTaxeRequest(createPayload));
    }
    await dispatch(getTaxeRequest());
    setShowModal(false);
  };

  // Tri + filtre
  const filtered = [...taxes]
    .filter((t) =>
      (t.name || '').toLowerCase().includes((searchQuery || '').toLowerCase())
    )
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const fmtAmount = (n) =>
    typeof n === 'number'
      ? n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
      : '—';

  const fmtPercent = (n) =>
    typeof n === 'number'
      ? `${n}%`
      : '—';

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">Gestion des taxes</h1>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Rechercher par nom..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="btn btn-success" onClick={openCreate}>
          Ajouter une taxe
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>Nom</th>
              <th>Pourcentage</th>
              <th>Montant</th>
              <th style={{ width: 160 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((tax) => (
                <tr
                  key={tax.id}
                  onClick={() => openEdit(tax)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{tax.name}</td>
                  <td>{fmtPercent(tax.purcentage)}</td>
                  <td>{fmtAmount(tax.amount)}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(tax);
                      }}
                    >
                      <i className="bi bi-pencil" />
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(tax.id);
                      }}
                    >
                      <i className="bi bi-trash" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center text-muted">
                  Aucune taxe pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODALE */}
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
            aria-labelledby="tax-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="tax-modal-title" className="mb-3">
              {isEditing ? 'Modifier la taxe' : 'Ajouter une taxe'}
            </h2>

            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <label>Nom</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={onChange}
                  required
                  autoFocus
                />
              </div>

              <div className="mb-3">
                <label>Pourcentage (%)</label>
                <input
                  type="number"
                  name="purcentage"
                  className="form-control"
                  value={formData.purcentage}
                  onChange={onChange}
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="Ex : 20"
                />
                <small className="text-muted">
                  Laisse vide si tu utilises un montant fixe.
                </small>
              </div>

              <div className="mb-3">
                <label>Montant (€)</label>
                <input
                  type="number"
                  name="amount"
                  className="form-control"
                  value={formData.amount}
                  onChange={onChange}
                  min="0"
                  step="0.01"
                  placeholder="Ex : 2.50"
                />
                <small className="text-muted">
                  Laisse vide si tu utilises un pourcentage.
                </small>
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
