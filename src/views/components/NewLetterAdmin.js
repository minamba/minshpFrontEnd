import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

// ⚠️ Adapte le chemin d'import à ton projet
import {
  getNewsletterRequest,
  updateNewsletterRequest,
  deleteNewsletterRequest,
} from "../../lib/actions/NewLetterActions";

/**
 * Version modernisée avec un design plus "admin" :
 * - Carte avec en‑tête, shadow douce, coins arrondis
 * - Table sticky header, alternance de lignes, survols
 * - Boutons avec icônes (SVG inline, aucune lib externe requise)
 * - Modale polie avec focus visible et transitions
 */
export const NewLetterAdmin = () => {
  const dispatch = useDispatch();

  const newLetters = useSelector((s) => s.newsletters?.newsletters) || [];
  const loading = useSelector((s) => s.newsletters?.loading);
  const error = useSelector((s) => s.newsletters?.error);

  // État pour la modale
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // objet newsletter en édition ou null
  const [form, setForm] = useState({ Mail: "", Abonne: false }); // Abonne = boolean

  // Charger la liste au montage
  useEffect(() => {
    dispatch(getNewsletterRequest());
  }, [dispatch]);

  // Helpers d'icônes SVG
  const Icon = {
    Plus: (props) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
    Edit: (props) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
      </svg>
    ),
    Trash: (props) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      </svg>
    ),
    Download: (props) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="M7 10l5 5 5-5" />
        <path d="M12 15V3" />
      </svg>
    ),
  };

  // Ouvrir la modale pour ajout
  const openAddModal = () => {
    setEditing(null);
    setForm({ Mail: "", Abonne: false });
    setIsModalOpen(true);
  };

  // Ouvrir la modale pour édition (tolère différentes clés depuis le store)
  const openEditModal = (row) => {
    const mail = row?.Mail ?? row?.mail ?? "";
    const abonne = row?.Abonne ?? row?.abonne ?? row?.suscribe ?? false;
    setEditing({
      IdNewsletter: row?.IdNewsletter ?? row?.id ?? row?.Id ?? null,
    });
    setForm({ Mail: mail, Abonne: !!abonne });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  // Gestion du formulaire
  const onChangeField = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const isValidEmail = useMemo(() => {
    if (!form.Mail) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.Mail);
  }, [form.Mail]);

  // Soumission (ajout ou modif via updateNewsletterRequest)
  const onSubmit = (e) => {
    e.preventDefault();
    if (!isValidEmail) return;

    const payload = {
      ...(editing?.IdNewsletter ? { IdNewsletter: editing.IdNewsletter, Suscribe: form.Abonne } : {}),
      Mail: form.Mail.trim(),
      Abonne: !!form.Abonne,
    };

    dispatch(updateNewsletterRequest(payload));
    setIsModalOpen(false);
  };

  const onDelete = (row) => {
    const id = row?.IdNewsletter ?? row?.id ?? row?.Id;
    const mail = row?.Mail ?? row?.mail ?? "cet abonné";
    if (!id) return;
    if (window.confirm(`Supprimer l'entrée pour "${mail}" ?`)) {
      dispatch(deleteNewsletterRequest(id));
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <h1 style={styles.title}>Newsletter — Abonnés</h1>
            <p style={styles.subtitle}>Gérez les emails inscrits et leur statut d’abonnement.</p>
          </div>
          <div>
            <button onClick={openAddModal} style={{ ...styles.btn, ...styles.btnPrimary }}>
              <Icon.Plus style={{ marginRight: 8 }} />
              Ajouter un abonné
            </button>
          </div>
        </div>

        {loading && <div style={styles.infoBar}>Chargement…</div>}
        {error && (
          <div style={{ ...styles.infoBar, ...styles.errorBar }}>
            {String(error)}
          </div>
        )}

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={{ ...styles.th, width: "40%" }}>Mail</th>
                <th style={{ ...styles.th, width: 140 }}>Abonné</th>
                <th style={{ ...styles.th, width: 200, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {newLetters?.length ? (
                newLetters.map((row, idx) => {
                  const mail = row?.mail ?? row?.Mail ?? "";
                  const abonne = row?.suscribe ?? row?.Abonne ?? row?.abonne ?? false;

                  return (
                    <tr key={(row.id ?? row.Id ?? mail) + idx} style={styles.tr}>
                      <td style={styles.td}>{mail}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          ...(abonne ? styles.badgeSuccess : styles.badgeMuted),
                        }}>
                          {abonne ? "Oui" : "Non"}
                        </span>
                      </td>
                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 8 }}>
                          <button
                            onClick={() => openEditModal(row)}
                            style={{ ...styles.iconBtn, ...styles.iconBtnEdit }}
                            aria-label={`Modifier ${mail}`}
                            title="Modifier"
                          >
                            <Icon.Edit />
                          </button>
                          <button
                            onClick={() => onDelete(row)}
                            style={{ ...styles.iconBtn, ...styles.iconBtnDelete }}
                            aria-label={`Supprimer ${mail}`}
                            title="Supprimer"
                          >
                            <Icon.Trash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td style={styles.empty} colSpan={4}>
                    Aucun abonné trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div style={styles.backdrop} onClick={closeModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>{editing ? "Modifier un abonné" : "Ajouter un abonné"}</h3>
            <form onSubmit={onSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>Mail</label>
                <input
                  type="email"
                  name="Mail"
                  value={form.Mail}
                  onChange={onChangeField}
                  placeholder="ex: jean.dupont@email.com"
                  style={styles.input}
                  required
                />
                {!isValidEmail && form.Mail?.length > 0 && (
                  <small style={{ color: "#dc2626" }}>Email invalide</small>
                )}
              </div>

              <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                <input id="abo" type="checkbox" name="Abonne" checked={form.Abonne} onChange={onChangeField} />
                <label htmlFor="abo">Abonné</label>
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button type="button" onClick={closeModal} style={{ ...styles.btn, ...styles.btnGhost }}>
                  Annuler
                </button>
                <button type="submit" disabled={!isValidEmail} style={{ ...styles.btn, ...styles.btnPrimary }}>
                  {editing ? "Enregistrer" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// —————————————————————————— Styles —————————————————————————— //
const styles = {
  page: {
    padding: 16,
    background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
    minHeight: "100%",
  },
  card: {
    background: "#ffffff",
    borderRadius: 16,
    boxShadow: "0 10px 30px rgba(2,6,23,0.06)",
    padding: 16,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  headerLeft: { maxWidth: "70%" },
  title: {
    margin: 0,
    fontSize: 22,
    lineHeight: 1.2,
    letterSpacing: 0.3,
    color: "#0f172a",
  },
  subtitle: {
    margin: 0,
    marginTop: 4,
    color: "#475569",
    fontSize: 14,
  },
  infoBar: {
    background: "#eef2ff",
    color: "#3730a3",
    border: "1px solid #e0e7ff",
    padding: "8px 10px",
    borderRadius: 10,
    marginBottom: 10,
  },
  errorBar: {
    background: "#fef2f2",
    color: "#b91c1c",
    borderColor: "#fee2e2",
  },
  tableWrap: {
    overflow: "auto",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
  },
  thead: {
    position: "sticky",
    top: 0,
    zIndex: 1,
    background: "#f8fafc",
  },
  th: {
    textAlign: "left",
    padding: "12px 10px",
    fontWeight: 600,
    fontSize: 13,
    color: "#0f172a",
    borderBottom: "1px solid #e5e7eb",
    background: "#f8fafc",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
  },
  td: {
    padding: "12px 10px",
    fontSize: 14,
    color: "#111827",
    verticalAlign: "middle",
  },
  empty: {
    padding: 24,
    textAlign: "center",
    color: "#64748b",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    border: "1px solid transparent",
  },
  badgeSuccess: {
    background: "#ecfdf5",
    color: "#065f46",
    borderColor: "#a7f3d0",
  },
  badgeMuted: {
    background: "#f8fafc",
    color: "#334155",
    borderColor: "#e2e8f0",
  },
  btn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid transparent",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    transition: "all .15s ease",
  },
  btnPrimary: {
    background: "#10b981",
    color: "white",
    boxShadow: "0 6px 14px rgba(16,185,129,.25)",
  },
  btnGhost: {
    background: "#fff",
    color: "#0f172a",
    border: "1px solid #e5e7eb",
  },
  iconBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 38,
    height: 38,
    borderRadius: 12,
    border: "1px solid transparent",
    cursor: "pointer",
    transition: "all .15s ease",
    background: "#fff",
  },
  iconBtnEdit: {
    color: "#b45309",
    borderColor: "#fcd34d",
    background: "#fffbeb",
  },
  iconBtnDelete: {
    color: "#b91c1c",
    borderColor: "#fecaca",
    background: "#fef2f2",
  },
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(2,6,23,.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 9999,
  },
  modal: {
    width: "min(560px, 92vw)",
    background: "#ffffff",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 20px 60px rgba(2,6,23,.35)",
  },
  label: { display: "block", marginBottom: 6, fontWeight: 600 },
  input: {
    width: "100%",
    padding: 10,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    outline: "none",
    fontSize: 14,
    boxSizing: "border-box",
  },
};
