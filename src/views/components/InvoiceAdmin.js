// src/views/components/InvoiceAdmin.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../App.css";

import {
  getInvoiceRequest,
  addInvoiceRequest,
  updateInvoiceRequest,
  deleteInvoiceRequest,
} from "../../lib/actions/InvoiceActions";

import { getOrderRequest } from "../../lib/actions/OrderActions";
import { getCustomerRequest } from "../../lib/actions/CustomerActions";
import { downloadInvoiceRequest } from "../../lib/actions/OrderActions";

/* ===== Helpers robustes d'ID/labels ===== */
const getId = (x) =>
  x?.id ?? x?.Id ?? x?.invoiceId ?? x?.orderId ?? x?.customerId ?? null;

const getInvoiceNumber = (i) =>
  i?.invoiceNo ?? i?.invoiceNumber ?? i?.number ?? i?.reference ?? `#${getId(i)}`;

const getInvoicePdfUrl = (i) =>
  i?.pdfUrl ?? i?.fileUrl ?? i?.url ?? (getId(i) ? `/api/invoices/${getId(i)}/pdf` : null);

const getCustomerId = (c) =>
  c?.id ?? c?.Id ?? c?.customerId ?? c?.CustomerId ?? c?.idCustomer ?? null;

const getOrderId = (o) =>
  o?.id ?? o?.Id ?? o?.orderId ?? o?.OrderId ?? null;

const getOrderNumber = (o) =>
  o?.orderNo ?? o?.orderNumber ?? o?.number ?? o?.reference ?? `#${getOrderId(o)}`;

const norm = (s) => String(s ?? "").trim().toLowerCase();

/* ===== Composant ===== */
export const InvoiceAdmin = () => {
  const dispatch = useDispatch();

  // Store
  const invoices = useSelector((s) => s?.invoices?.invoices) || [];
  const customers = useSelector((s) => s?.customers?.customers) || [];
  const orders = useSelector((s) => s?.orders?.orders) || [];

  // Chargements initiaux
  useEffect(() => {
    dispatch(getInvoiceRequest?.());
    dispatch(getCustomerRequest?.());
    dispatch(getOrderRequest?.());
  }, [dispatch]);

  // Maps
  const customersById = useMemo(() => {
    const m = new Map();
    for (const c of customers) {
      const id = getCustomerId(c);
      if (id != null) m.set(String(id), c);
    }
    return m;
  }, [customers]);

  const ordersById = useMemo(() => {
    const m = new Map();
    for (const o of orders) {
      const id = getOrderId(o);
      if (id != null) m.set(String(id), o);
    }
    return m;
  }, [orders]);

  // Tri récent → ancien si date dispo
  const rows = useMemo(() => {
    const sorted = [...invoices].sort((a, b) => {
      const da = new Date(a?.date || a?.createdAt || 0).getTime();
      const db = new Date(b?.date || b?.createdAt || 0).getTime();
      return db - da;
    });
    return sorted.map((inv) => {
      const cid =
        inv?.idCustomer ?? inv?.customerId ?? inv?.CustomerId ?? inv?.customer?.id ?? null;
      const oid =
        inv?.idOrder ?? inv?.orderId ?? inv?.OrderId ?? inv?.order?.id ?? null;

      const cust = cid != null ? customersById.get(String(cid)) : undefined;
      const ord  = oid != null ? ordersById.get(String(oid)) : undefined;

      return {
        _raw: inv,
        id: getId(inv),
        invoiceNumber: inv.invoiceNumber,
        customerId: cid ?? "—",
        orderId: oid ?? "—",
        orderNo: ord ? getOrderNumber(ord) : (inv?.orderNumber || "—"),
        pdfUrl: getInvoicePdfUrl(inv),
      };
    });
  }, [invoices, customersById, ordersById]);

  /* ===== Modal état ===== */
  const [modal, setModal] = useState({ open: false, mode: "add", invoice: null });
  const openAdd  = () => setModal({ open: true, mode: "add", invoice: null });
  const openEdit = (i) => setModal({ open: true, mode: "edit", invoice: i });
  const close    = () => setModal((m) => ({ ...m, open: false }));

  /* ===== Formulaire ===== */
  const [searchCust, setSearchCust] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState(""); // string
  const [selectedOrderId, setSelectedOrderId] = useState("");       // string
  const [invoiceNo, setInvoiceNo] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");

  // Pré-remplissage (edit) / reset (add)
  useEffect(() => {
    if (!modal.open) return;

    if (modal.mode === "add") {
      setSearchCust("");
      setSelectedCustomerId("");
      setSelectedOrderId("");
      setInvoiceNo("");
      setPdfUrl("");
      return;
    }

    // Édition
    const inv = modal.invoice;
    const cid =
      inv?.idCustomer ?? inv?.customerId ?? inv?.CustomerId ?? inv?.customer?.id ?? "";
    const oid =
      inv?.idOrder ?? inv?.orderId ?? inv?.OrderId ?? inv?.order?.id ?? "";

    setSearchCust("");
    setSelectedCustomerId(String(cid || ""));
    setSelectedOrderId(String(oid || ""));
    setInvoiceNo(getInvoiceNumber(inv).toString().replace(/^#/, ""));
    setPdfUrl(getInvoicePdfUrl(inv) || "");
  }, [modal.open, modal.mode, modal.invoice]);

  // Clients filtrés (recherche sur email / tel / nom / id)
  const filteredCustomers = useMemo(() => {
    const q = norm(searchCust);
    if (!q) return customers.slice(0, 50);
    return customers.filter((c) => {
      const idStr = String(getCustomerId(c));
      const mail = norm(c?.email ?? c?.mail);
      const tel  = norm(c?.phone ?? c?.tel ?? c?.phoneNumber);
      const name = norm([c?.firstName, c?.lastName, c?.fullName].filter(Boolean).join(" "));
      return (
        idStr.includes(q) || mail.includes(q) || tel.includes(q) || name.includes(q)
      );
    });
  }, [customers, searchCust]);

  // Commandes liées au client sélectionné
  const ordersForCustomer = useMemo(() => {
    if (!selectedCustomerId) return [];
    return orders
      .filter(
        (o) =>
          String(
            o?.idCustomer ?? o?.customerId ?? o?.CustomerId ?? o?.customer?.id ?? ""
          ) === String(selectedCustomerId)
      )
      .slice(0, 300);
  }, [orders, selectedCustomerId]);

  /* ===== Soumission ===== */
  const submitAdd = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedOrderId) {
      alert("Sélectionnez un client et une commande.");
      return;
    }

    await dispatch(
      addInvoiceRequest({
        CustomerId: Number(selectedCustomerId),
        OrderId: Number(selectedOrderId),
        InvoiceNumber: invoiceNo || undefined,
        PdfUrl: pdfUrl || undefined,
      })
    );

    await dispatch(getInvoiceRequest?.());
    close();
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    const inv = modal.invoice;
    const invId = getId(inv);
    if (!invId) return;

    await dispatch(
      updateInvoiceRequest({
        Id: invId,
        InvoiceId: invId,
        CustomerId: selectedCustomerId ? Number(selectedCustomerId) : undefined,
        OrderId: selectedOrderId ? Number(selectedOrderId) : undefined,
        InvoiceNumber: invoiceNo || undefined,
        PdfUrl: pdfUrl || undefined,
      })
    );

    await dispatch(getInvoiceRequest?.());
    close();
  };

  const handleDelete = async (inv) => {
    const label = getInvoiceNumber(inv);
    if (!window.confirm(`Supprimer la facture ${label} ?`)) return;

    await dispatch(deleteInvoiceRequest(getId(inv)));
    await dispatch(getInvoiceRequest?.());
  };

  const getCustomerNumber = (cid) => {
    const cust = customers.find((c) => c.id === cid);
    return cust ? cust.clientNumber : "—";
  };

  /* ===== UI ===== */
  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Factures</h2>
        <button className="btn btn-success mt-5" onClick={openAdd}>
          Ajouter une facture
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>N° facture</th>
              <th>N° client</th>
              <th>N° commande</th>
              <th>Télécharger la facture</th>
              <th style={{ width: 180 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center">Aucune facture.</td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.invoiceNumber}</td>
                  <td>{getCustomerNumber(r.customerId)}</td>
                  <td>{r.orderNo ?? r.orderId ?? "—"}</td>
                  <td>
                    {r.pdfUrl ? (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => dispatch(downloadInvoiceRequest(r.orderId))}
                      >
                        <i className="bi bi-download" /> Télécharger
                      </button>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-warning"
                      title="Modifier"
                      onClick={() => openEdit(r._raw)}
                    >
                      <i className="bi bi-pencil" />
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      title="Supprimer"
                      onClick={() => handleDelete(r._raw)}
                    >
                      <i className="bi bi-trash" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ===== Modal Add/Edit ===== */}
      {modal.open && (
        <div
          className="admin-modal-backdrop"
          role="presentation"
          onClick={close}
        >
          <div
            className="admin-modal-panel"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 820 }}
          >
            <h3 className="mb-3">
              {modal.mode === "add" ? "Ajouter une facture" : "Modifier la facture"}
            </h3>

            <form onSubmit={modal.mode === "add" ? submitAdd : submitEdit}>
              {/* Client avec recherche */}
              <div className="mb-3">
                <label className="form-label">Client (recherche sur email / nom / id)</label>
                <input
                  className="form-control mb-2"
                  placeholder="Rechercher un client…"
                  value={searchCust}
                  onChange={(e) => setSearchCust(e.target.value)}
                />
                <select
                  className="form-select"
                  value={selectedCustomerId}
                  onChange={(e) => {
                    setSelectedCustomerId(e.target.value);
                    // reset la commande si le client change
                    setSelectedOrderId("");
                  }}
                  required
                >
                  <option value="">— Sélectionner —</option>
                  {filteredCustomers.map((c) => {
                    const cid = String(getCustomerId(c));
                    const label =
                      [cid, (c?.email ?? c?.mail) || "", (c?.firstName || "") + " " + (c?.lastName || "")]
                        .filter(Boolean)
                        .join(" — ");
                    return (
                      <option key={cid} value={cid}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Commandes liées au client */}
              <div className="mb-3">
                <label className="form-label">Commande (liée au client)</label>
                <select
                  className="form-select"
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  required
                  disabled={!selectedCustomerId}
                >
                  <option value="">{selectedCustomerId ? "— Sélectionner —" : "Choisissez d’abord un client"}</option>
                  {ordersForCustomer.map((o) => {
                    const oid = String(getOrderId(o));
                    const label = `${getOrderNumber(o)} (id: ${oid})`;
                    return (
                      <option key={oid} value={oid}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Numéro de facture */}
              <div className="mb-3">
                <label className="form-label">N° facture</label>
                <input
                  className="form-control"
                  placeholder="Ex : 2025-000123"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                />
              </div>

              {/* URL du PDF (optionnel) */}
              <div className="mb-3">
                <label className="form-label">Lien du PDF (optionnel)</label>
                <input
                  className="form-control"
                  placeholder="https://…/invoice.pdf"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                />
              </div>

              <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-secondary me-2" onClick={close}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-dark">
                  {modal.mode === "add" ? "Ajouter" : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
