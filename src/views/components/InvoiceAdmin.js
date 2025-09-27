// src/views/components/InvoiceAdmin.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../App.css";

import {
  addInvoiceRequest,
  updateInvoiceRequest,
  deleteInvoiceRequest,
  getInvoicePagedUserRequest,
} from "../../lib/actions/InvoiceActions";
import { downloadInvoiceRequest, getOrderRequest } from "../../lib/actions/OrderActions";
import { getCustomerRequest } from "../../lib/actions/CustomerActions";

/* ---------- Helpers ---------- */
const getId = (x) =>
  x?.id ?? x?.Id ?? x?.invoiceId ?? x?.InvoiceId ?? x?.orderId ?? x?.OrderId ?? x?.customerId ?? x?.CustomerId ?? null;

const getCustomerId = (c) => c?.id ?? c?.Id ?? c?.customerId ?? c?.CustomerId ?? c?.idCustomer ?? null;
const getOrderId = (o) => o?.id ?? o?.Id ?? o?.orderId ?? o?.OrderId ?? null;

const getOrderNumber = (o) =>
  o?.orderNumber ?? o?.orderNo ?? o?.number ?? o?.reference ?? (getOrderId(o) != null ? `#${getOrderId(o)}` : "—");

const getInvoiceNumberRaw = (i) =>
  i?.invoiceNumber ?? i?.InvoiceNumber ?? i?.invoiceNo ?? i?.InvoiceNo ?? i?.number ?? i?.Number ?? "";

const getInvoiceNumber = (i) => {
  const v = getInvoiceNumberRaw(i);
  return v && String(v).trim() !== "" ? String(v) : `#${getId(i)}`;
};

export const InvoiceAdmin = () => {
  const dispatch = useDispatch();

  /* ---------- Store ---------- */
  const customers = useSelector((s) => s?.customers?.customers) || [];
  const ordersState = useSelector((s) => s?.orders) || {};
  const allOrders = Array.isArray(ordersState.orders) ? ordersState.orders : [];

  const invSlice = useSelector((s) => s?.invoices) || {};
  const items = Array.isArray(invSlice.items) ? invSlice.items : [];
  const totalCount = Number(invSlice.totalCount ?? 0);
  const loading = !!invSlice.loading;

  /* ---------- Maps ---------- */
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
    for (const o of allOrders) {
      const id = getOrderId(o);
      if (id != null) m.set(String(id), o);
    }
    return m;
  }, [allOrders]);

  /* ---------- UI ---------- */
  const [page, setPage] = useState(invSlice.page || 1);
  const [pageSize, setPageSize] = useState(invSlice.pageSize || 10);
  const [sort, setSort] = useState("CreationDate:desc");

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1); // on repart page 1 quand on change la recherche
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  // Charger dépendances (clients + toutes les commandes) une fois
  useEffect(() => {
    dispatch(getCustomerRequest?.());
    dispatch(getOrderRequest()); // pour reconstruire orderNo si l'API facture ne le renvoie pas
  }, [dispatch]);

  // Appel API paginé — on envoie la recherche au BACK (Filter.InvoiceNumber)
  const lastSigRef = useRef("");
  useEffect(() => {
    const filter = debounced ? { InvoiceNumber: debounced } : undefined;
    const payload = { page, pageSize, sort, filter };
    const sig = JSON.stringify(payload);
    if (lastSigRef.current !== sig) {
      lastSigRef.current = sig;
      dispatch(getInvoicePagedUserRequest(payload));
    }
  }, [dispatch, page, pageSize, sort, debounced]);

  /* ---------- Rows ---------- */
  const rows = useMemo(() => {
    return (items || []).map((inv) => {
      const cid =
        inv?.idCustomer ?? inv?.customerId ?? inv?.CustomerId ?? inv?.customer?.id ?? inv?.Customer?.Id ?? null;
      const oid =
        inv?.idOrder ?? inv?.orderId ?? inv?.OrderId ?? inv?.order?.id ?? inv?.Order?.Id ?? null;

      const ord = oid != null ? ordersById.get(String(oid)) : undefined;
      const orderNo = ord ? getOrderNumber(ord) : inv?.orderNumber ?? inv?.OrderNumber ?? (oid ? `#${oid}` : "—");

      const customerNo =
        customersById.get(String(cid))?.clientNumber ??
        customersById.get(String(cid))?.ClientNumber ??
        customersById.get(String(cid))?.clientNo ??
        "—";

      return {
        _raw: inv,
        id: getId(inv),
        invoiceNumber: getInvoiceNumber(inv),
        customerId: cid,
        customerNo,
        orderId: oid,
        orderNo,
      };
    });
  }, [items, ordersById, customersById]);

  /* ---------- Pagination UI ---------- */
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageSize));
  const startIdx = totalCount ? (page - 1) * pageSize + 1 : (page - 1) * pageSize + 1;
  const endIdx = totalCount ? Math.min(totalCount, page * pageSize) : (page - 1) * pageSize + rows.length;

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const win = 5;
    let start = Math.max(1, page - Math.floor(win / 2));
    let end = Math.min(totalPages, start + win - 1);
    if (end - start + 1 < win) start = Math.max(1, end - win + 1);
    const pages = [];
    for (let p = start; p <= end; p++) pages.push(p);

    return (
      <nav className="orders-pagination mt-3" aria-label="Pagination factures">
        <button className="pg-btn" disabled={page <= 1 || loading} onClick={() => setPage((x) => Math.max(1, x - 1))}>
          ← Précédente
        </button>
        {pages.map((p) => (
          <button
            key={p}
            className={`pg-btn ${p === page ? "is-active" : ""}`}
            disabled={loading}
            onClick={() => setPage(p)}
          >
            {p}
          </button>
        ))}
        <button
          className="pg-btn"
          disabled={page >= totalPages || loading}
          onClick={() => setPage((x) => Math.min(totalPages, x + 1))}
        >
          Suivante →
        </button>
      </nav>
    );
  };

  /* ---------- Modal add/edit ---------- */
  const [modal, setModal] = useState({ open: false, mode: "add", invoice: null });
  const openAdd = () => setModal({ open: true, mode: "add", invoice: null });
  const openEdit = (invRaw) => setModal({ open: true, mode: "edit", invoice: invRaw });
  const close = () => setModal((m) => ({ ...m, open: false }));

  const [searchCust, setSearchCust] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");

  useEffect(() => {
    if (!modal.open) return;
    if (modal.mode === "add") {
      setSearchCust(""); setSelectedCustomerId(""); setSelectedOrderId("");
      setInvoiceNo(""); setPdfUrl(""); return;
    }
    const inv = modal.invoice;
    const cid =
      inv?.idCustomer ?? inv?.customerId ?? inv?.CustomerId ?? inv?.customer?.id ?? inv?.Customer?.Id ?? "";
    const oid = inv?.idOrder ?? inv?.orderId ?? inv?.OrderId ?? inv?.order?.id ?? inv?.Order?.Id ?? "";
    setSearchCust("");
    setSelectedCustomerId(String(cid || ""));
    setSelectedOrderId(String(oid || ""));
    setInvoiceNo(String(getInvoiceNumberRaw(inv) ?? "")); // pas de '#'
    setPdfUrl(inv?.pdfUrl ?? inv?.fileUrl ?? inv?.url ?? "");
  }, [modal.open, modal.mode, modal.invoice]);

  const filteredCustomers = useMemo(() => {
    const q = (searchCust || "").toLowerCase();
    if (!q) return customers.slice(0, 50);
    return customers.filter((c) => {
      const idStr = String(getCustomerId(c) ?? "");
      const mail = (c?.email ?? c?.mail ?? "").toLowerCase();
      const tel = (c?.phone ?? c?.tel ?? c?.phoneNumber ?? "").toLowerCase();
      const name = [c?.firstName, c?.lastName, c?.fullName].filter(Boolean).join(" ").toLowerCase();
      const clientNo = String(c?.clientNumber ?? c?.ClientNumber ?? "").toLowerCase();
      return idStr.includes(q) || mail.includes(q) || tel.includes(q) || name.includes(q) || clientNo.includes(q);
    });
  }, [customers, searchCust]);

  const ordersForCustomer = useMemo(() => {
    if (!selectedCustomerId) return [];
    return (allOrders || [])
      .filter(
        (o) =>
          String(
            o?.idCustomer ?? o?.customerId ?? o?.CustomerId ?? o?.customer?.id ?? o?.Customer?.Id ?? ""
          ) === String(selectedCustomerId)
      )
      .slice(0, 500);
  }, [allOrders, selectedCustomerId]);

  // Après mutation → re-fetch la même page avec la même recherche (back)
  const refetchPage = () => {
    const filter = debounced ? { InvoiceNumber: debounced } : undefined;
    dispatch(getInvoicePagedUserRequest({ page, pageSize, sort, filter }));
  };

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
    refetchPage();
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
    refetchPage();
    close();
  };

  const handleDelete = async (inv) => {
    const id = getId(inv);
    if (!id) return;
    if (!window.confirm(`Supprimer la facture ${getInvoiceNumber(inv)} ?`)) return;
    await dispatch(deleteInvoiceRequest({ Id: id, HardDelete: false }));
    refetchPage();
  };

  const handleDeleteHard = async (inv) => {
    const id = getId(inv);
    if (!id) return;
    if (!window.confirm(`Supprimer la facture de manière hard (physique) ${getInvoiceNumber(inv)} ?`)) return;
    await dispatch(deleteInvoiceRequest({ Id: id, HardDelete: true }));
    refetchPage();
  };

  /* ---------- Render ---------- */
  return (
    <div className="container py-3">
      {/* Toolbar */}
      <div className="d-flex justify-content-between align-items-center mb-3 gap-2 flex-wrap">
        <h2 className="m-0">Factures</h2>
      </div>

      <div className="d-flex align-items-center gap-2 flex-wrap">
          <input
            className="form-control"
            style={{ minWidth: 280 }}
            placeholder="Rechercher par n° de facture (back)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          
          <button className="btn btn-success mb-3 mt-3" onClick={openAdd}>
            Ajouter une facture
          </button>
        </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-striped table-hover shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>N° facture</th>
              <th>N° client</th>
              <th>N° commande</th>
              <th>Télécharger la facture</th>
              <th style={{ width: 220 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center">Chargement…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={5} className="text-center">Aucune facture.</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.invoiceNumber}</td>
                  <td>{r.customerNo ?? "—"}</td>
                  <td>{r.orderNo ?? "—"}</td>
                  <td>
                    {r.orderId ? (
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
                  <td className="d-flex flex-wrap gap-2">
                    <button className="btn btn-sm btn-warning" title="Modifier" onClick={() => openEdit(r._raw)}>
                      <i className="bi bi-pencil" />
                    </button>
                    <button className="btn btn-sm btn-danger" title="Supprimer (soft)" onClick={() => handleDelete(r._raw)}>
                      <i className="bi bi-trash" />
                    </button>
                    <button className="btn btn-sm btn-secondary" title="Supprimer (hard)" onClick={() => handleDeleteHard(r._raw)}>
                      <i className="bi bi-trash" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {renderPagination()}

      <div className="d-flex align-items-center gap-3 mt-2">
        <span className="ms-auto">
          {startIdx}–{endIdx} {totalCount ? `sur ${totalCount}` : ""}
        </span>
        <select
          className="form-select"
          style={{ width: 110 }}
          value={pageSize}
          onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
        >
          {[5, 10, 20, 50].map((n) => (
            <option key={n} value={n}>{n} / page</option>
          ))}
        </select>
      </div>

      {/* Modal Add / Edit */}
      {modal.open && (
        <div className="admin-modal-backdrop" role="presentation" onClick={close}>
          <div className="admin-modal-panel" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 820 }}>
            <h3 className="mb-3">{modal.mode === "add" ? "Ajouter une facture" : "Modifier la facture"}</h3>

            <form onSubmit={modal.mode === "add" ? submitAdd : submitEdit}>
              <div className="mb-3">
                <label className="form-label">Client (recherche sur email / nom / n° client / id)</label>
                <input
                  className="form-control mb-2"
                  placeholder="Rechercher un client…"
                  value={searchCust}
                  onChange={(e) => setSearchCust(e.target.value)}
                />
                <select
                  className="form-select"
                  value={selectedCustomerId}
                  onChange={(e) => { setSelectedCustomerId(e.target.value); setSelectedOrderId(""); }}
                  required
                >
                  <option value="">— Sélectionner —</option>
                  {filteredCustomers.map((c) => {
                    const cid = String(getCustomerId(c));
                    const label = [
                      c?.clientNumber ?? c?.ClientNumber ?? null,
                      c?.email ?? c?.mail ?? null,
                      [c?.firstName, c?.lastName].filter(Boolean).join(" ").trim() || null,
                    ].filter(Boolean).join(" — ");
                    return <option key={cid} value={cid}>{label}</option>;
                  })}
                </select>
              </div>

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
                    return <option key={oid} value={oid}>{label}</option>;
                  })}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">N° facture</label>
                <input
                  className="form-control"
                  placeholder="Ex : FA00000123"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                />
              </div>

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
                <button type="button" className="btn btn-secondary me-2" onClick={close}>Annuler</button>
                <button type="submit" className="btn btn-dark">{modal.mode === "add" ? "Ajouter" : "Enregistrer"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
