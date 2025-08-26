// src/views/components/DeliveryAddressAdmin.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../../App.css";

// 🔁 Adapte ces imports à tes noms d’actions
import {
  getDeliveryAddressRequest,
  addDeliveryAddressRequest,
  updateDeliveryAddressRequest,
  deleteDeliveryAddressRequest,
} from "../../lib/actions/DeliveryAddressActions";
import { getCustomerRequest } from "../../lib/actions/CustomerActions";

// 🌍 Pays (FR)
import countriesLib from "i18n-iso-countries";
import frLocale from "i18n-iso-countries/langs/fr.json";
countriesLib.registerLocale(frLocale);
const LOCALE = "fr";

// helpers pays
const countryNames = countriesLib.getNames(LOCALE, { select: "official" });
const countryOptions = Object.entries(countryNames)
  .map(([code, label]) => ({ code, label }))
  .sort((a, b) => a.label.localeCompare(b.label, "fr"));

const nameToCode = (name) => {
  if (!name) return undefined;
  const code = countriesLib.getAlpha2Code(String(name).trim(), LOCALE);
  return code || undefined;
};
const codeToName = (code) => {
  if (!code) return undefined;
  return countriesLib.getName(String(code).toUpperCase(), LOCALE) || undefined;
};

export const DeliveryAddressAdmin = () => {
  const dispatch = useDispatch();

  // ===== Slices =====
  const deliverySlice  = useSelector((s) => s?.deliveryAddresses);
  const customersSlice = useSelector((s) => s?.customers);

  // Normalisation → tableaux
  const addresses = useMemo(() => {
    if (Array.isArray(deliverySlice)) return deliverySlice;
    if (Array.isArray(deliverySlice?.deliveryAddresses))
      return deliverySlice.deliveryAddresses;
    return [];
  }, [deliverySlice]);

  const customers = useMemo(() => {
    const raw = customersSlice?.customers ?? customersSlice ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [customersSlice]);

  // ===== Effects =====
  useEffect(() => {
    dispatch(getDeliveryAddressRequest());
    dispatch(getCustomerRequest());
  }, [dispatch]);

  // ===== Helpers =====
  const findCustomerEmail = (id) => {
    const c =
      customers.find((x) => String(x.id) === String(id)) ||
      customers.find((x) => String(x.customerId) === String(id));
    return c?.email ?? c?.mail ?? "—";
  };

  const toForm = (a) => {
    const rawCountry =
      (a?.country ?? a?.pays) || "France"; // valeur lisible par défaut
    const iso =
      a?.countryIso ??
      a?.isoCode ??
      (nameToCode(rawCountry) || "FR");

    return {
      id: a?.id ?? a?.deliveryAddressId ?? a?.Id ?? null,
      firstName: a?.firstName ?? a?.FirstName ?? "",
      lastName: a?.lastName ?? a?.LastName ?? "",
      address: a?.address ?? a?.addressLine ?? a?.line1 ?? "",
      complementaryAddress:
        a?.complementaryAddress ?? a?.line2 ?? "",
      zip: a?.postalCode ?? a?.zip ?? a?.zipCode ?? "",
      city: a?.city ?? a?.ville ?? "",
      // on stocke le **nom** (pour l’UI), pas le code
      country: codeToName(iso) || rawCountry,
      customerId:
        a?.idCustomer ??
        a?.customerId ??
        a?.customer?.id ??
        a?.customerIdCustomer ??
        null,
      favorite: a?.favorite ?? false,
    };
  };

  // ===== UI state =====
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("add"); // 'add' | 'edit' | 'delete'
  const [form, setForm] = useState({
    id: null,
    firstName: "",
    lastName: "",
    address: "",
    complementaryAddress: "",
    zip: "",
    city: "",
    country: "France",
    customerId: null,
    favorite: false,
  });

  // recherche client (email / tel)
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

  // ===== Handlers =====
  const openAdd = () => {
    setMode("add");
    setForm({
      id: null,
      firstName: "",
      lastName: "",
      address: "",
      complementaryAddress: "",
      zip: "",
      city: "",
      country: "France",
      customerId: null,
      favorite: false,
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

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const iso = nameToCode(form.country) || "FR";
    const payload = {
      Id: form.id ?? undefined,
      FirstName: form.firstName,
      LastName: form.lastName,
      Address: form.address,
      complementaryAddress: form.complementaryAddress,
      PostalCode: form.zip,
      City: form.city,
      Country: form.country, // nom lisible
      CountryIso: iso,       // si ton API accepte un code ISO (facultatif)
      IdCustomer: form.customerId,
      favorite: form.favorite,
    };

    if (mode === "add") {
      await dispatch(addDeliveryAddressRequest(payload));
    } else if (mode === "edit") {
      await dispatch(updateDeliveryAddressRequest(payload));
    } else if (mode === "delete" && form.id != null) {
      await dispatch(deleteDeliveryAddressRequest(form.id));
    }

    await dispatch(getDeliveryAddressRequest());
    closeModal();
  };

  // Présentation des lignes
  const fmtRow = (a) => {
    const rawCountry = (a?.country ?? a?.pays) || "France";
    const iso =
      a?.countryIso ??
      a?.isoCode ??
      (nameToCode(rawCountry) || "FR");
    return {
      id: a?.id ?? a?.deliveryAddressId ?? a?.Id ?? "—",
      firstName: a?.firstName ?? a?.FirstName ?? "",
      lastName: a?.lastName ?? a?.LastName ?? "",
      address: a?.address ?? a?.addressLine ?? a?.line1 ?? "",
      complementaryAddress: a?.complementaryAddress ?? "",
      zip: a?.postalCode ?? a?.zip ?? a?.zipCode ?? "",
      city: a?.city ?? a?.ville ?? "",
      country: codeToName(iso) || rawCountry,
      customerId:
        a?.idCustomer ??
        a?.customerId ??
        a?.customer?.id ??
        a?.customerIdCustomer ??
        null,
        favorite: a?.favorite ?? false,
    };
  };

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Adresses de livraison</h2>
        <button className="btn btn-success mt-5" onClick={openAdd}>
          Ajouter une adresse
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>Id</th>
              <th> Nom</th>
              <th> Prénom</th>
              <th>Adresse</th>
              <th>Adresse comp.</th>
              <th>Code postal</th>
              <th>Ville</th>
              <th>Pays</th>
              <th>Client (email)</th>
              <th>Préférée</th>
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
                    <td>{row.firstName}</td>
                    <td>{row.lastName}</td>
                    <td>{row.address}</td>
                    <td>{row.complementaryAddress}</td>
                    <td>{row.zip}</td>
                    <td>{row.city}</td>
                    <td>{row.country}</td>
                    <td>{findCustomerEmail(row.customerId)}</td>
                    <td>{row.favorite === true ? "Oui" : "Non"}</td>
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
            aria-labelledby="delivery-modal-title"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 720 }}
          >
            <h3 id="delivery-modal-title" className="mb-3">
              {mode === "add"
                ? "Ajouter une adresse de livraison"
                : mode === "edit"
                ? "Modifier l’adresse de livraison"
                : "Supprimer l’adresse de livraison"}
            </h3>

            <form onSubmit={onSubmit}>
              <div className="row g-3">
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
                        {c.email ?? c.mail} {c.phone ? `• ${c.phone}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Prénom</label>
                  <input
                    type="text"
                    className="form-control"
                    name="firstName"
                    value={form.firstName}
                    onChange={onChange}
                    required
                    disabled={mode === "delete"}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Nom</label>
                  <input
                    type="text"
                    className="form-control"
                    name="lastName"
                    value={form.lastName}
                    onChange={onChange}
                    required
                    disabled={mode === "delete"}
                  />
                </div>

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
                  <select
                    className="form-select"
                    name="country"
                    value={form.country || ""}
                    onChange={onChange}
                    required
                    disabled={mode === "delete"}
                  >
                    <option value="">— Choisir un pays —</option>
                    {countryOptions.map((opt) => (
                      <option key={opt.code} value={opt.label}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
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
