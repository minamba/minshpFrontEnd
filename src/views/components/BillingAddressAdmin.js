// src/views/components/BillingAddressAdmin.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../../App.css";

// Actions (adapte les chemins si besoin)
import {
  getBillingAddressRequest,
  addBillingAddressRequest,
  updateBillingAddressRequest,
  deleteBillingAddressRequest,
} from "../../lib/actions/BillingAddressActions";
import { getCustomerRequest } from "../../lib/actions/CustomerActions";

// ====== Pays (liste complète en FR) ======
import countries from "i18n-iso-countries";
import fr from "i18n-iso-countries/langs/fr.json";
countries.registerLocale(fr);

// Utilitaires pays
const allCountries = Object.entries(
  countries.getNames("fr", { select: "official" })
)
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name, "fr"));

const codeToName = (code) =>
  countries.getName(String(code || "").toUpperCase(), "fr") || "";

const nameToCode = (name) =>
  countries.getAlpha2Code((name || "").trim(), "fr") || "";

// ===================== Composant =====================
export const BillingAddressAdmin = () => {
  const dispatch = useDispatch();

  // Selectors (un hook par slice, jamais conditionnel)
  const billingAddressesSlice = useSelector((s) => s?.billingAddresses);
  const customersSlice = useSelector((s) => s?.customers);

  // Normalisation → tableaux
  const addresses = useMemo(() => {
    if (Array.isArray(billingAddressesSlice)) return billingAddressesSlice;
    if (Array.isArray(billingAddressesSlice?.billingAddresses))
      return billingAddressesSlice.billingAddresses;
    return [];
  }, [billingAddressesSlice]);

  const customers = useMemo(() => {
    const raw = customersSlice?.customers ?? customersSlice ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [customersSlice]);

  // Chargements initiaux
  useEffect(() => {
    dispatch(getBillingAddressRequest());
    dispatch(getCustomerRequest());
  }, [dispatch]);

  // Helpers
  const findCustomerEmail = (id) => {
    const c =
      customers.find((x) => String(x.id) === String(id)) ||
      customers.find((x) => String(x.customerId) === String(id));
    return c?.email ?? c?.mail ?? "—";
  };

  // Transforme un enregistrement API → form state
  const toForm = (a) => {
    const rawCountry = (a?.country ?? a?.pays) || "France (métropolitaine)";
    const rawCode = a?.countryIso ?? (nameToCode(rawCountry) || "FR");

    return {
      id: a?.id ?? a?.billingAddressId ?? a?.Id ?? null,
      address: a?.address ?? a?.addressLine ?? a?.line1 ?? "",
      complementaryAddress:
        a?.complementaryAddress ?? a?.line2 ?? a?.address2 ?? "",
      zip: a?.postalCode ?? a?.zip ?? a?.zipCode ?? "",
      city: a?.city ?? a?.ville ?? "",
      countryCode: String(rawCode).toUpperCase(), // ISO-2
      customerId:
        a?.idCustomer ??
        a?.customerId ??
        a?.customer?.id ??
        a?.customerIdCustomer ??
        null,
    };
  };

  // UI state
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("add"); // 'add' | 'edit' | 'delete'
  const [form, setForm] = useState({
    id: null,
    address: "",
    complementaryAddress: "",
    zip: "",
    city: "",
    countryCode: "FR", // ISO-2
    customerId: null,
  });

  // Recherche client (email / tel)
  const [customerQuery, setCustomerQuery] = useState("");
  const filteredCustomers = useMemo(() => {
    const q = customerQuery.trim().toLowerCase();
    if (!q) return customers.slice(0, 30);
    return customers.filter((c) => {
      const mail = (c?.email ?? c?.mail ?? "").toLowerCase();
      const tel =
        (c?.phone ?? c?.phoneNumber ?? c?.tel ?? "")
          .toString()
          .toLowerCase();
      return mail.includes(q) || tel.includes(q);
    });
  }, [customerQuery, customers]);

  // Openers
  const openAdd = () => {
    setMode("add");
    setForm({
      id: null,
      address: "",
      complementaryAddress: "",
      zip: "",
      city: "",
      countryCode: "FR",
      customerId: null,
    });
    setCustomerQuery("");
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setMode("edit");
    setForm(toForm(row));
    setCustomerQuery("");
    setModalOpen(true);
  };

  const openDelete = (row) => {
    setMode("delete");
    setForm(toForm(row));
    setCustomerQuery("");
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  // Form handlers
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // On envoie le code ISO + le libellé FR (pratique si l'API veut le texte)
    const countryName = codeToName(form.countryCode) || "";

    const payload = {
      Id: form.id ?? undefined,
      Address: form.address,
      complementaryAddress: form.complementaryAddress,
      PostalCode: form.zip,
      City: form.city,
      CountryCode: form.countryCode, // ISO-2
      Country: countryName,          // libellé FR
      IdCustomer: form.customerId,
    };

    if (mode === "add") {
      await dispatch(addBillingAddressRequest(payload));
    } else if (mode === "edit") {
      await dispatch(updateBillingAddressRequest(payload));
    } else if (mode === "delete" && form.id != null) {
      await dispatch(deleteBillingAddressRequest(form.id));
    }

    await dispatch(getBillingAddressRequest());
    closeModal();
  };

  // Ligne pour affichage tableau
  const fmtRow = (a) => {
    const formRow = toForm(a);
    return {
      id: formRow.id,
      address: formRow.address,
      complementaryAddress: formRow.complementaryAddress,
      zip: formRow.zip,
      city: formRow.city,
      countryName: codeToName(formRow.countryCode) || "—",
      customerId: formRow.customerId,
    };
  };

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Adresses de facturation</h2>
        <button className="btn btn-success mt-5" onClick={openAdd}>
          Ajouter une adresse
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>Id</th>
              <th>Adresse</th>
              <th>Adresse comp.</th>
              <th>Code postal</th>
              <th>Ville</th>
              <th>Pays</th>
              <th>Client (email)</th>
              <th style={{ width: 140 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {addresses.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center">
                  Aucune adresse.
                </td>
              </tr>
            ) : (
              addresses.map((a) => {
                const row = fmtRow(a);
                return (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.address}</td>
                    <td>{row.complementaryAddress}</td>
                    <td>{row.zip}</td>
                    <td>{row.city}</td>
                    <td>{row.countryName}</td>
                    <td>{findCustomerEmail(row.customerId)}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-warning"
                          title="Modifier"
                          onClick={() => openEdit(a)}
                        >
                          <i className="bi bi-pencil" />
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          title="Supprimer"
                          onClick={() => openDelete(a)}
                        >
                          <i className="bi bi-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ===== Modal Add / Edit / Delete ===== */}
      {modalOpen && (
        <div
          className="admin-modal-backdrop"
          role="presentation"
          onClick={closeModal}
        >
          <div
            className="admin-modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="billing-modal-title"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 720 }}
          >
            <h3 id="billing-modal-title" className="mb-3">
              {mode === "add"
                ? "Ajouter une adresse de facturation"
                : mode === "edit"
                ? "Modifier l’adresse de facturation"
                : "Supprimer l’adresse de facturation"}
            </h3>

            <form onSubmit={onSubmit}>
              <div className="row g-3">
                {/* Recherche client */}
                <div className="col-12">
                  <label className="form-label">Client (recherche)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Rechercher par email ou n° de téléphone"
                    value={customerQuery}
                    onChange={(e) => setCustomerQuery(e.target.value)}
                    disabled={mode === "delete"}
                  />
                </div>

                {/* Sélection client */}
                <div className="col-12">
                  <label className="form-label">Sélectionner un client</label>
                  <select
                    className="form-select"
                    name="customerId"
                    value={form.customerId ?? ""}
                    onChange={onChange}
                    required
                    disabled={mode === "delete"}
                  >
                    <option value="">— Choisir —</option>
                    {filteredCustomers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.email ?? c.mail}
                        {c.phone ? ` • ${c.phone}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Adresse */}
                <div className="col-12">
                  <label className="form-label">Adresse</label>
                  <input
                    type="text"
                    className="form-control"
                    name="address"
                    value={form.address}
                    onChange={onChange}
                    required
                    disabled={mode === "delete"}
                  />
                </div>

                {/* Complément */}
                <div className="col-12">
                  <label className="form-label">Complément d’adresse</label>
                  <input
                    type="text"
                    className="form-control"
                    name="complementaryAddress"
                    value={form.complementaryAddress}
                    onChange={onChange}
                    disabled={mode === "delete"}
                  />
                </div>

                {/* CP / Ville / Pays */}
                <div className="col-sm-4">
                  <label className="form-label">Code postal</label>
                  <input
                    type="text"
                    className="form-control"
                    name="zip"
                    value={form.zip}
                    onChange={onChange}
                    required
                    disabled={mode === "delete"}
                  />
                </div>

                <div className="col-sm-4">
                  <label className="form-label">Ville</label>
                  <input
                    type="text"
                    className="form-control"
                    name="city"
                    value={form.city}
                    onChange={onChange}
                    required
                    disabled={mode === "delete"}
                  />
                </div>

                <div className="col-sm-4">
                  <label className="form-label">Pays</label>
                  {mode === "delete" ? (
                    <input
                      type="text"
                      className="form-control"
                      value={codeToName(form.countryCode) || ""}
                      disabled
                      readOnly
                    />
                  ) : (
                    <select
                      className="form-select"
                      name="countryCode"
                      value={form.countryCode}
                      onChange={onChange}
                      required
                    >
                      {allCountries.map(({ code, name }) => (
                        <option key={code} value={code}>
                          {name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="d-flex justify-content-end mt-3">
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={closeModal}
                >
                  Annuler
                </button>

                {mode === "delete" ? (
                  <button type="submit" className="btn btn-danger">
                    Supprimer
                  </button>
                ) : (
                  <button type="submit" className="btn btn-dark">
                    {mode === "add" ? "Ajouter" : "Modifier"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
