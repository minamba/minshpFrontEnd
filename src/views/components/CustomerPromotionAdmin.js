import React, { useEffect, useMemo, useState } from "react";
import "../../App.css";
import { useSelector, useDispatch } from "react-redux";
import {
  getCustomerPromotionCodeRequest,
  addCustomerPromotionCodeRequest,
  updateCustomerPromotionCodeRequest,
  deleteCustomerPromotionCodeRequest,
} from "../../lib/actions/CustomerPromotionCodeActions";

// ---- Helpers ----
const getCustomerId = (c) => c?.id ?? c?.Id ?? c?.customerId ?? c?.IdCustomer;
const getPromoId = (p) => p?.id ?? p?.Id ?? p?.promotionCodeId ?? p?.IdPromotionCode;
const getCustomerEmail = (c) => c?.email ?? c?.Email ?? "";
const getPromoName = (p) => p?.name ?? p?.code ?? p?.Code ?? p?.Name ?? "";
const getCustomerNumber = (c) =>
  String(
    c?.clientNumber ??
      c?.ClientNumber ??
      c?.customerNumber ??
      c?.CustomerNumber ??
      c?.numeroClient ??
      getCustomerId(c) ??
      ""
  );

export const CustomerPromotionAdmin = () => {
  const dispatch = useDispatch();

  // ===== Store =====
  const customerPromotions = useSelector(
    (s) => s.customerPromotionCodes?.customerPromotionCodes ?? []
  );
  const customersFromStore = useSelector((s) => s.customers?.customers ?? []);
  const promotionCodesFromStore = useSelector(
    (s) => s.promotionCodes?.promotionCodes ?? []
  );

  // ===== Chargement initial =====
  useEffect(() => {
    dispatch(getCustomerPromotionCodeRequest());
  }, [dispatch]);

  // ===== Lookups =====
  const customersById = useMemo(() => {
    const m = new Map();
    for (const c of customersFromStore) {
      const id = getCustomerId(c);
      if (id != null) m.set(String(id), c);
    }
    return m;
  }, [customersFromStore]);

  const promoCodesById = useMemo(() => {
    const m = new Map();
    for (const p of promotionCodesFromStore) {
      const id = getPromoId(p);
      if (id != null) m.set(String(id), p);
    }
    return m;
  }, [promotionCodesFromStore]);

  // ===== UI state =====
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [searchCustomer, setSearchCustomer] = useState("");
  const [formData, setFormData] = useState({
    customerId: "",
    promotionCodeId: "",
    consumed: false,
  });

  // Bloque scroll + ESC pour la modale
  useEffect(() => {
    if (showModal) document.body.classList.add("no-scroll");
    else document.body.classList.remove("no-scroll");
    const onKey = (e) => e.key === "Escape" && setShowModal(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("no-scroll");
    };
  }, [showModal]);

  // ===== Tableau =====
  const rows = useMemo(() => {
    return (customerPromotions || [])
      .map((cp) => {
        const id = cp?.id;
        // NB: tes clés côté API semblent être idCutomer / idPromotion
        const custId = cp?.idCutomer ?? cp?.customerId ?? cp?.IdCustomer;
        const promoId = cp?.idPromotion ?? cp?.promotionCodeId ?? cp?.IdPromotionCode;

        const customer = customersById.get(String(custId));
        const promo = promoCodesById.get(String(promoId));

        const customerNumber = getCustomerNumber(customer);
        const customerEmail = getCustomerEmail(customer);
        const promoName = getPromoName(promo);

        const consumed = (cp?.isUsed ?? false) === true;

        return {
          id,
          customerId: custId,
          customerNumber,
          customerEmail,
          promotionCodeId: promoId,
          promotionName: promoName,
          consumed,
          _raw: cp,
        };
      })
      .sort((a, b) =>
        String(a.customerNumber).localeCompare(String(b.customerNumber))
      );
  }, [customerPromotions, customersById, promoCodesById]);

  // ===== Actions =====
  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ customerId: "", promotionCodeId: "", consumed: false });
    setSearchCustomer("");
    setShowModal(true);
  };

  const handleEditClick = (row) => {
    setIsEditing(true);
    setCurrentId(row.id);
    setFormData({
      customerId: row.customerId ? String(row.customerId) : "",
      promotionCodeId: row.promotionCodeId ? String(row.promotionCodeId) : "",
      consumed: !!row.consumed,
    });
    setSearchCustomer("");
    setShowModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Supprimer cette association client/code promo ?")) {
      await dispatch(deleteCustomerPromotionCodeRequest(id));
      await dispatch(getCustomerPromotionCodeRequest());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      Id: isEditing ? currentId : undefined,
      IdCutomer: Number(formData.customerId),
      IdPromotion: Number(formData.promotionCodeId),
      IsUsed: !!formData.consumed,
    };
    if (isEditing) {
      await dispatch(updateCustomerPromotionCodeRequest(payload));
    } else {
      await dispatch(addCustomerPromotionCodeRequest(payload));
    }
    await dispatch(getCustomerPromotionCodeRequest());
    setShowModal(false);
  };

  // ===== Liste de clients filtrée (par N°Client OU email) =====
  const filteredCustomers = useMemo(() => {
    const q = (searchCustomer || "").trim().toLowerCase();
    if (!q) return customersFromStore;
    return customersFromStore.filter((c) => {
      const number = getCustomerNumber(c).toLowerCase();
      const email = getCustomerEmail(c).toLowerCase();
      return number.includes(q) || email.includes(q);
    });
  }, [customersFromStore, searchCustomer]);

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">Gestion de l’utilisation des codes promos</h1>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div />
        <button className="btn btn-success" onClick={handleAddClick}>
          Ajouter une association
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>N°Client</th>
              <th>Mail</th>
              <th>Code promo</th>
              <th>Consommé</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => handleEditClick(r)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{r.customerNumber}</td>
                  <td>{r.customerEmail}</td>
                  <td>{r.promotionName || r.promotionCodeId}</td>
                  <td className={r.consumed ? "text-success fw-bold" : "text-secondary"}>
                    {r.consumed ? "Oui" : "Non"}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(r);
                      }}
                    >
                      <i className="bi bi-pencil" />
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(r.id);
                      }}
                    >
                      <i className="bi bi-trash" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  Aucune association trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===== Modale Ajout/Édition ===== */}
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
            aria-labelledby="cp-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="cp-modal-title" className="mb-3">
              {isEditing ? "Modifier l’association" : "Ajouter une association"}
            </h2>

            <form onSubmit={handleSubmit}>
              {/* Recherche client */}
              <div className="mb-3">
                <label>Rechercher un client (N° ou mail)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="tapez un N°Client ou un mail"
                  value={searchCustomer}
                  onChange={(e) => setSearchCustomer(e.target.value)}
                />
              </div>

              {/* Liste clients */}
              <div className="mb-3">
                <label>Client (N°Client)</label>
                <select
                  className="form-select"
                  value={formData.customerId}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, customerId: e.target.value }))
                  }
                  required
                >
                  <option value="">Sélectionnez un client</option>
                  {filteredCustomers.map((c) => {
                    const id = getCustomerId(c);
                    const number = getCustomerNumber(c);
                    const email = getCustomerEmail(c);
                    return (
                      <option key={id} value={id}>
                        {number} — {email}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Liste codes promo */}
              <div className="mb-3">
                <label>Code promo</label>
                <select
                  className="form-select"
                  value={formData.promotionCodeId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      promotionCodeId: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Sélectionnez un code promo</option>
                  {promotionCodesFromStore.map((p) => {
                    const id = getPromoId(p);
                    const name = getPromoName(p);
                    return (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Consommé ? */}
              <div className="form-check mb-3">
                <input
                  id="chk-consumed"
                  type="checkbox"
                  className="form-check-input"
                  checked={formData.consumed}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      consumed: e.target.checked,
                    }))
                  }
                />
                <label className="form-check-label" htmlFor="chk-consumed">
                  Consommé
                </label>
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
