// src/views/components/OrderAdmin.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import "../../App.css";

import {
  getOrderRequest,               // full list (pour waitForNewOrderId)
  addOrderRequest,
  updateOrderRequest,
  deleteOrderRequest,
  getOrderPagedUserRequest,      // ✅ pagination serveur
} from "../../lib/actions/OrderActions";

import {
  getOrderCustomerProductRequest,
  addOrderCustomerProductRequest,
  deleteOrderCustomerProductRequest,
  updateOrderCustomerProductRequest,
} from "../../lib/actions/OrderCustomerProductActions";
import { getCustomerRequest } from "../../lib/actions/CustomerActions";
import { getProductUserRequest } from "../../lib/actions/ProductActions";

/* ───────── Helpers ───────── */
const getId = (x) => x?.id ?? x?.Id ?? x?.orderId ?? x?.productId ?? x?.orderProductId ?? null;
const getCustomerId = (c) => c?.id ?? c?.Id ?? c?.customerId ?? c?.CustomerId ?? c?.idCustomer ?? null;
const getOrderIdFromOP = (op) => op?.idOrder ?? op?.orderId ?? op?.IdOrder ?? op?.OrderId ?? null;
const getProductIdFromOP = (op) => op?.idProduct ?? op?.productId ?? op?.IdProduct ?? op?.ProductId ?? null;
const getOcpId = (op) =>
  op?.id ?? op?.Id ?? op?.orderProductId ?? op?.orderCustomerProductId ?? op?.IdOrderCustomerProduct ?? null;

const normStr = (v) => (v == null ? "" : String(v));
const safeLower = (s) => normStr(s).toLowerCase();
const clamp = (n, min = 1, max = 999) => Math.max(min, Math.min(max, n || 1));
const fmtMoney = (n) => new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR"}).format(Number(n||0));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const toNum = (v) => (typeof v === "number" ? v : parseFloat(v));
const parseDate = (val) => { if (!val) return null; const d = new Date(val); return Number.isNaN(d.getTime()) ? null : d; };

const getActiveProductPromoPrice = (p) => {
  const priceRef = Number(toNum(p?.priceTtc ?? p?.price)) || 0;
  const promo = p?.promotions?.[0];
  if (!promo) return null;
  const pct = Number(promo?.purcentage) || 0; if (pct <= 0) return null;
  const start = parseDate(promo?.startDate); const end = parseDate(promo?.endDate); const now = new Date();
  const endOfDay = end ? new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23,59,59,999) : null;
  if (start && start > now) return null; if (endOfDay && endOfDay < now) return null;
  const promotedVal = Number(toNum(p?.priceTtcPromoted)); if (Number.isFinite(promotedVal)) return promotedVal;
  return +(priceRef * (1 - pct / 100)).toFixed(2);
};
const unitPrice = (p) => {
  const sub = Number(toNum(p?.priceTtcSubCategoryCodePromoted)); if (Number.isFinite(sub)) return sub;
  const cat = Number(toNum(p?.priceTtcCategoryCodePromoted));   if (Number.isFinite(cat)) return cat;
  const prodPromo = getActiveProductPromoPrice(p); if (prodPromo != null) return prodPromo;
  return Number(toNum(p?.priceTtc ?? p?.price)) || 0;
};

export const OrderAdmin = () => {
  const dispatch = useDispatch();
  const store = useStore();

  /* Store */
  const products      = useSelector((s) => s?.products?.products) || [];
  const orderProducts = useSelector((s) => s?.orderProducts?.orderProducts) || [];
  const customers     = useSelector((s) => s?.customers?.customers) || [];
  const invoices      = useSelector((s) => s?.invoices?.invoices) || [];

  // Slice paginé
  const orderSlice    = useSelector((s) => s?.orders) || {};
  const items         = Array.isArray(orderSlice.items) ? orderSlice.items : [];
  const totalCount    = Number(orderSlice.totalCount ?? 0);
  const loading       = !!orderSlice.loading;

  // Liste complète (utile au polling après création)
  const ordersAll     = useSelector((s) => s?.orders?.orders) || [];

  /* Chargements init */
  useEffect(() => {
    dispatch(getOrderRequest?.());
    dispatch(getOrderCustomerProductRequest?.());
    dispatch(getCustomerRequest?.());
    dispatch(getProductUserRequest?.());
  }, [dispatch]);

  /* Pagination + recherche */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 350);
    return () => clearTimeout(id);
  }, [searchTerm]);

  useEffect(() => {
    dispatch(getOrderPagedUserRequest({
      page, pageSize, sort: "CreationDate:desc", search: debouncedSearch || undefined
    }));
  }, [dispatch, page, pageSize, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  /* Maps */
  const productsById = useMemo(() => {
    const map = new Map();
    for (const p of products) { const pid = getId(p); if (pid != null) map.set(String(pid), p); }
    return map;
  }, [products]);

  const customersById = useMemo(() => {
    const map = new Map();
    for (const c of customers) { const cid = getCustomerId(c); if (cid != null) map.set(String(cid), c); }
    return map;
  }, [customers]);

  const opByOrder = useMemo(() => {
    const map = new Map();
    for (const op of orderProducts) {
      const oid = String(getOrderIdFromOP(op));
      if (!map.has(oid)) map.set(oid, []);
      map.get(oid).push(op);
    }
    return map;
  }, [orderProducts]);

  const computeTotal = (order) => {
    const oid = String(getId(order));
    const lines = opByOrder.get(oid) || [];
    return lines.reduce((sum, l) => {
      const pid = String(getProductIdFromOP(l));
      const prod = productsById.get(pid);
      const qty = Number(l?.quantity ?? l?.qty ?? 1);
      const linePrice = l?.price ?? l?.priceTtc ?? prod?.priceTtc ?? prod?.price ?? 0;
      return sum + Number(linePrice) * qty;
    }, 0);
  };

  const labelForProduct = (p) => {
    const brand = p?.brand || "";
    const model = p?.model || "";
    const base = [brand, model].filter(Boolean).join(" ");
    return base || p?.name || p?.title || `#${getId(p)}`;
  };

  const productsListForOrder = (order) => {
    const oid = String(getId(order));
    const lines = opByOrder.get(oid) || [];
    return lines
      .map((l) => productsById.get(String(getProductIdFromOP(l))))
      .filter(Boolean)
      .map(labelForProduct);
  };

  /* ───────── Modal (états) ───────── */
  const [modal, setModal] = useState({ open: false, mode: "add", order: null });
  const openAdd = () => setModal({ open: true, mode: "add", order: null });
  const openEdit = (o) => setModal({ open: true, mode: "edit", order: o });
  const close    = () => setModal((m) => ({ ...m, open: false }));

  const [searchCust, setSearchCust] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [payMethod, setPayMethod] = useState("Carte");
  const [status, setStatus] = useState("En attente");
  const [cat, setCat] = useState("Toutes les catégories");
  const [searchProd, setSearchProd] = useState("");
  const [trackingLink, setTrackingLink] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState(null);

  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [quantities, setQuantities] = useState(new Map());

  useEffect(() => {
    if (!modal.open) return;
    if (modal.mode === "add") {
      setSearchCust(""); setSelectedCustomer(""); setPayMethod("Carte"); setStatus("En attente");
      setCat("Toutes les catégories"); setSearchProd(""); setSelectedProducts(new Set()); setQuantities(new Map());
      setTrackingLink(""); setTrackingNumber("");
    } else if (modal.mode === "edit" && modal.order) {
      const oid = String(getId(modal.order));
      const lines = opByOrder.get(oid) || [];
      setSelectedCustomer(String(modal.order?.idCustomer ?? modal.order?.customerId ?? modal.order?.CustomerId ?? modal.order?.customer?.id ?? ""));
      setPayMethod(modal.order?.payment ?? modal.order?.paymentMethod ?? "Carte");
      setStatus(modal.order?.status ?? modal.order?.orderStatus ?? "En cours");
      setCat("Toutes les catégories"); setSearchProd("");
      setTrackingLink(modal.order?.trackingLink ?? modal.order?.TrackingLink ?? "");
      setTrackingNumber(modal.order?.trackingNumber ?? modal.order?.TrackingNumber ?? "");
      const ids = new Set(); const qmap = new Map();
      for (const l of lines) { const pid = String(getProductIdFromOP(l)); if (!pid) continue; ids.add(pid); qmap.set(pid, clamp(Number(l?.quantity ?? l?.qty ?? 1))); }
      setSelectedProducts(ids); setQuantities(qmap);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal.open, modal.mode, modal.order]);

  const filteredCustomers = useMemo(() => {
    const q = safeLower(searchCust);
    if (!q) return customers.slice(0, 30);
    return customers.filter((c) => {
      const mail = safeLower(c?.email ?? c?.mail);
      const tel  = safeLower(c?.phone ?? c?.tel ?? c?.phoneNumber);
      const name = safeLower([c?.firstName, c?.lastName, c?.fullName].filter(Boolean).join(" "));
      return mail.includes(q) || tel.includes(q) || name.includes(q);
    });
  }, [customers, searchCust]);

  const filteredProducts = useMemo(() => {
    const q = safeLower(searchProd);
    const all = products.filter((p) => {
      if (cat !== "Toutes les catégories") {
        const c = p?.category || p?.categoryName || p?.Category || p?.category?.name || "";
        if (c !== cat) return false;
      }
      return true;
    });
    if (!q) return all.slice(0, 200);
    return all.filter((p) => safeLower([p?.brand, p?.model, p?.name, p?.title].join(" ")).includes(q));
  }, [products, cat, searchProd]);

  const toggleProduct = async (pid) => {
    const id = String(pid);
    const willSelect = !selectedProducts.has(id);

    if (modal.mode === "edit" && modal.order) {
      const orderId = modal.order?.id ?? modal.order?.Id ?? modal.order?.orderId ?? getId(modal.order);
      const customerId =
        modal.order?.idCustomer ?? modal.order?.customerId ?? modal.order?.CustomerId ?? modal.order?.customer?.id ?? null;

      if (willSelect) {
        const qty = quantities.get(id) ?? 1;
        await dispatch(addOrderCustomerProductRequest({ OrderId: orderId, CustomerId: customerId, ProductId: pid, Quantity: qty, IdOrder: orderId, IdProduct: pid }));
        await dispatch(getOrderCustomerProductRequest?.());
        setSelectedProducts((s) => new Set(s).add(id));
        setQuantities((m) => { const n = new Map(m); if (!n.has(id)) n.set(id, 1); return n; });
      } else {
        await dispatch(deleteOrderCustomerProductRequest({ OrderId: orderId, CustomerId: customerId, ProductId: pid }));
        await dispatch(getOrderCustomerProductRequest?.());
        setSelectedProducts((s) => { const n = new Set(s); n.delete(id); return n; });
        setQuantities((m) => { const n = new Map(m); n.delete(id); return n; });
      }
      return;
    }

    setSelectedProducts((prev) => { const n = new Set(prev); if (willSelect) n.add(id); else n.delete(id); return n; });
    setQuantities((m) => { const n = new Map(m); if (willSelect && !n.has(id)) n.set(id, 1); if (!willSelect) n.delete(id); return n; });
  };

  const changeQty = async (pid, next) => {
    const id = String(pid);
    const qty = clamp(parseInt(next, 10));
    setQuantities((m) => { const n = new Map(m); n.set(id, qty); return n; });

    if (!selectedProducts.has(id) && modal.mode === "add") setSelectedProducts((s) => new Set(s).add(id));

    if (modal.mode === "edit" && modal.order) {
      const orderId = modal.order?.id ?? modal.order?.Id ?? modal.order?.orderId ?? getId(modal.order);
      const customerId =
        modal.order?.idCustomer ?? modal.order?.customerId ?? modal.order?.CustomerId ?? modal.order?.customer?.id ?? null;

      const lines = opByOrder.get(String(orderId)) || [];
      const line  = lines.find((l) => String(getProductIdFromOP(l)) === id);
      const ocpId = getOcpId(line);

      if (!ocpId) {
        await dispatch(addOrderCustomerProductRequest({ IdOrder: orderId, IdProduct: pid, Quantity: qty }));
        await dispatch(getOrderCustomerProductRequest?.());
        setSelectedProducts((s) => new Set(s).add(id));
        return;
      }

      await dispatch(updateOrderCustomerProductRequest({
        orderId, OrderId: orderId, customerId, CustomerId: customerId,
        productId: pid, ProductID: pid, quantity: qty, Quantity: qty,
        orderCustomerProductId: ocpId, OrderCustomerProductId: ocpId, IdOrderCustomerProduct: ocpId,
      }));
      await dispatch(getOrderCustomerProductRequest?.());
    }
  };

  const calcModalAmount = () => {
    let sum = 0;
    for (const pid of Array.from(selectedProducts)) {
      const p = productsById.get(String(pid));
      const qty = clamp(quantities.get(String(pid)) ?? 1);
      sum += unitPrice(p) * qty;
    }
    return Number(sum.toFixed(2));
  };

  const waitForNewOrderId = async (customerId, beforeIdsSet, { attempts = 20, delay = 200 } = {}) => {
    for (let i = 0; i < attempts; i++) {
      await dispatch(getOrderRequest?.());
      await sleep(delay);
      const state = store.getState();
      const allOrders = state?.orders?.orders || [];
      const afterForCustomer = allOrders.filter((o) => {
        const cid = o?.idCustomer ?? o?.customerId ?? o?.CustomerId ?? o?.customer?.id ?? null;
        return String(cid ?? "") === String(customerId ?? "");
      });
      const currentIds = afterForCustomer.map((o) => getId(o)).filter(Boolean).map(String);
      const newOne = currentIds.find((id) => !beforeIdsSet.has(String(id)));
      if (newOne) return newOne;
    }
    return null;
  };

  const submitAdd = async (e) => {
    e.preventDefault();
    const chosen = new Set(selectedProducts);
    if (chosen.size === 0) for (const [pid, q] of quantities.entries()) if (Number(q) > 0) chosen.add(String(pid));
    if (!selectedCustomer || chosen.size === 0) { alert("Sélectionnez un client et au moins un produit."); return; }

    const beforeForCustomer = ordersAll.filter((o) => {
      const cid = o?.idCustomer ?? o?.customerId ?? o?.CustomerId ?? o?.customer?.id ?? null;
      return String(cid ?? "") === String(selectedCustomer);
    });
    const beforeIdsSet = new Set(beforeForCustomer.map((o) => String(getId(o))).filter(Boolean));

    const amount = Array.from(chosen).reduce((sum, pid) => {
      const p = productsById.get(String(pid));
      const qty = clamp(quantities.get(String(pid)) ?? 1);
      return sum + unitPrice(p) * qty;
    }, 0);

    await dispatch(addOrderRequest({ CustomerId: Number(selectedCustomer), PaymentMethod: payMethod, Status: status, Amount: Number(amount.toFixed(2)) }));

    const newOrderId = await waitForNewOrderId(Number(selectedCustomer), beforeIdsSet, { attempts: 25, delay: 200 });
    if (!newOrderId) { alert("Commande créée mais ID non détecté. Rafraîchis et réessaie."); return; }

    for (const pid of Array.from(chosen)) {
      const qty = clamp(quantities.get(String(pid)) ?? 1);
      await dispatch(addOrderCustomerProductRequest({ OrderId: Number(newOrderId), CustomerId: Number(selectedCustomer), ProductId: Number(pid), Quantity: qty, IdOrder: Number(newOrderId), IdProduct: Number(pid) }));
    }

    await Promise.all([
      dispatch(getOrderRequest?.()),
      dispatch(getOrderCustomerProductRequest?.()),
      dispatch(getOrderPagedUserRequest({ page, pageSize, sort: "CreationDate:desc", search: debouncedSearch || undefined })),
    ]);
    close();
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!modal.order) return;
    const orderId = modal.order?.id ?? modal.order?.Id ?? modal.order?.orderId ?? getId(modal.order);
    const customerId =
      modal.order?.idCustomer ?? modal.order?.customerId ?? modal.order?.CustomerId ?? modal.order?.customer?.id ?? null;
    const amount = calcModalAmount();

    await dispatch(updateOrderRequest({
      OrderId: orderId, CustomerId: customerId, Status: status, PaymentMethod: payMethod, Amount: amount,
      TrackingLink: trackingLink, trackingLink: trackingLink,
      TrackingNumber: trackingNumber, trackingNumber: trackingNumber,
      Id: orderId, Payment: payMethod, Total: amount,
    }));

    await Promise.all([
      dispatch(getOrderRequest?.()),
      dispatch(getOrderPagedUserRequest({ page, pageSize, sort: "CreationDate:desc", search: debouncedSearch || undefined })),
    ]);
    close();
  };

  const handleDelete = async (order) => {
    if (!order) return;
    const label = order?.orderNo ?? order?.orderNumber ?? `#${getId(order)}`;
    if (!window.confirm(`Supprimer la commande ${label} ?`)) return;

    await dispatch(deleteOrderRequest(getId(order)));
    await Promise.all([
      dispatch(getOrderRequest?.()),
      dispatch(getOrderCustomerProductRequest?.()),
      dispatch(getOrderPagedUserRequest({ page, pageSize, sort: "CreationDate:desc", search: debouncedSearch || undefined })),
    ]);
  };

  const getInvoiceNumber = (id) => {
    const invoice = invoices.find((i) => i?.orderId === Number(id));
    return invoice?.invoiceNumber ?? "—";
  };

  const rows = useMemo(() => {
    return [...items].map((o) => {
      const oid = String(getId(o));
      const cidFromOrder = o?.idCustomer ?? o?.customerId ?? o?.CustomerId ?? getCustomerId(o?.customer);
      const customerFromMap = cidFromOrder != null ? customersById.get(String(cidFromOrder)) : undefined;
      const email = o?.customer?.email ?? customerFromMap?.email ?? o?.customerEmail ?? o?.email ?? "—";
      const num = o?.orderNo ?? o?.orderNumber ?? o?.number ?? o?.reference ?? `#${oid}`;
      const pay = o?.payment ?? o?.paymentMethod ?? "—";
      const st  = o?.status ?? o?.orderStatus ?? "—";
      const total = computeTotal(o);
      const prods = productsListForOrder(o);
      const date  = o?.date ? new Date(o.date).toLocaleDateString() : "—";
      const amount = o?.amount;
      const trackingNumber = o?.trackingNumber ?? "—";
      const trackingLink = o?.trackingLink ?? "—";
      const carrier = o?.carrier ?? "—";
      const serviceCode = o?.serviceCode ?? "—";
      const boxtalShipmentId = o?.boxtalShipmentId ?? "—";
      return { _raw: o, oid, email, num, pay, st, total, prods, date, amount, trackingNumber, trackingLink, carrier, serviceCode, boxtalShipmentId };
    });
  }, [items, customersById, computeTotal, productsListForOrder]);

  const normUrl = (u) => {
    if (!u) return null; const s = String(u).trim(); if (!s) return null;
    return /^https?:\/\//i.test(s) ? s : `https://${s}`;
  };

  /* ===== Pagination Buttons ===== */
  const Pagination = () => {
    if (totalPages <= 1) return null;

    // fenêtre glissante
    const windowSize = 5;
    let start = Math.max(1, page - Math.floor(windowSize / 2));
    let end = Math.min(totalPages, start + windowSize - 1);
    if (end - start + 1 < windowSize) start = Math.max(1, end - windowSize + 1);

    const pages = [];
    for (let p = start; p <= end; p++) pages.push(p);

    return (
      <div className="d-flex align-items-center gap-2 flex-wrap">
        <button
          className="btn btn-outline-secondary"
          disabled={page <= 1 || loading}
          onClick={() => setPage((x) => Math.max(1, x - 1))}
        >
          ← Précédent
        </button>

        {pages.map((p) => (
          <button
            key={p}
            className={`btn ${p === page ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => setPage(p)}
            disabled={loading}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        ))}

        <button
          className="btn btn-outline-secondary"
          disabled={page >= totalPages || loading}
          onClick={() => setPage((x) => Math.min(totalPages, x + 1))}
        >
          Suivant →
        </button>
      </div>
    );
  };

  const startIdx = totalCount ? (page - 1) * pageSize + 1 : 0;
  const endIdx   = totalCount ? Math.min(totalCount, page * pageSize) : items.length;

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Commandes</h2>
        <button className="btn btn-success mt-5" onClick={openAdd}>Ajouter une commande</button>
      </div>

      {/* Recherche + pageSize */}
      <div className="d-flex gap-2 mb-2">
        <input
          className="form-control"
          placeholder="Rechercher (email, n° commande, statut, etc.)"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
        />
        <select
          className="form-select"
          style={{ width: 120 }}
          value={pageSize}
          onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
        >
          {[10, 20, 50].map((n) => <option key={n} value={n}>{n} / page</option>)}
        </select>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>Client (email)</th>
              <th>Id interne</th>
              <th>N° commande</th>
              <th>N° de suivi</th>
              <th>N° Facture</th>
              <th>Paiement</th>
              <th>Statut</th>
              <th>Montant</th>
              <th>Date</th>
              <th>Produits</th>
              <th>Transporteur</th>
              <th>Ref commande Boxtal</th>
              <th style={{ width: 180 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={11} className="text-center">Chargement…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={11} className="text-center">Aucune commande.</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.oid}>
                  <td>{r.email}</td>
                  <td>{r.oid}</td>
                  <td>{r.num}</td>
                  <td>
                    {(() => {
                      const href = normUrl(r.trackingLink);
                      if (!href) return "—";
                      const label = (r.trackingNumber && String(r.trackingNumber).trim()) || "Suivre";
                      return <a href={href} target="_blank" rel="noopener noreferrer">{label}</a>;
                    })()}
                  </td>
                  <td>{getInvoiceNumber(r.oid)}</td>
                  <td>{r.pay}</td>
                  <td>{r.st}</td>
                  <td className="text-success fw-bold">{fmtMoney(r.amount)}</td>
                  <td>{r.date}</td>
                  <td style={{ whiteSpace: "pre-wrap" }}>{r.prods.length ? r.prods.join(", ") : "—"}</td>
                  <td>{r.carrier + " : " + r.serviceCode}</td>
                  <td>{r.boxtalShipmentId}</td>
                  <td className="d-flex gap-2">
                    <button className="btn btn-sm btn-warning" onClick={() => openEdit(r._raw)} title="Modifier">
                      <i className="bi bi-pencil" />
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(r._raw)} title="Supprimer">
                      <i className="bi bi-trash" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination + compteur */}
      <div className="d-flex align-items-center justify-content-between mt-2 flex-wrap gap-2">
        <div className="text-muted">
          {totalCount ? `${startIdx}–${endIdx} sur ${totalCount}` : `${items.length} éléments`}
        </div>
        <Pagination />
      </div>

      {/* ===== Modale ===== */}
      {modal.open && (
        <div className="admin-modal-backdrop" role="presentation" onClick={close}>
          <div
            className="admin-modal-panel"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 980 }}
          >
            <h3 className="mb-3">{modal.mode === "add" ? "Ajouter une commande" : "Modifier la commande"}</h3>

            {modal.mode === "add" ? (
              /* ======== FORMULAIRE D'AJOUT ======== */
              <form onSubmit={submitAdd} className="d-flex flex-column gap-3">
                {/* Ligne 1 : Client + Paiement/Statut */}
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Rechercher un client</label>
                    <input
                      className="form-control"
                      placeholder="email, nom, téléphone…"
                      value={searchCust}
                      onChange={(e) => setSearchCust(e.target.value)}
                    />
                    <div className="mt-2" style={{ maxHeight: 220, overflow: "auto", border: "1px solid #e5e5e5", borderRadius: 6 }}>
                      <ul className="list-group list-group-flush">
                        {filteredCustomers.map((c) => {
                          const cid = getCustomerId(c);
                          const label = [c?.firstName, c?.lastName].filter(Boolean).join(" ") || c?.fullName || c?.email || cid;
                          return (
                            <li
                              key={cid}
                              className={`list-group-item d-flex justify-content-between align-items-center ${String(selectedCustomer) === String(cid) ? "active" : ""}`}
                              style={{ cursor: "pointer" }}
                              onClick={() => setSelectedCustomer(String(cid))}
                            >
                              <span>
                                <strong>{label}</strong>
                                <div className="small text-muted">{c?.email} {c?.phone ? `• ${c.phone}` : ""}</div>
                              </span>
                              {String(selectedCustomer) === String(cid) && <i className="bi bi-check2-circle" />}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="row g-3">
                      <div className="col-sm-6">
                        <label className="form-label">Paiement</label>
                        <select className="form-select" value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                          {["Carte", "PayPal", "Virement", "Espèces"].map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label">Statut</label>
                        <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                          {["En attente", "En cours", "Envoyé préparé", "Expédié", "Annulé"].map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label">Catégorie</label>
                        <select className="form-select" value={cat} onChange={(e) => setCat(e.target.value)}>
                          <option>Toutes les catégories</option>
                          {[...new Set((products || []).map(p => p?.category?.name || p?.category || p?.categoryName).filter(Boolean))].map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ligne 2 : Produits */}
                <div className="row g-3">
                  <div className="col-md-7">
                    <label className="form-label">Rechercher un produit</label>
                    <input
                      className="form-control"
                      placeholder="marque, modèle, nom…"
                      value={searchProd}
                      onChange={(e) => setSearchProd(e.target.value)}
                    />

                    <div className="mt-2" style={{ maxHeight: 340, overflow: "auto", border: "1px solid #e5e5e5", borderRadius: 6 }}>
                      <table className="table table-sm align-middle mb-0">
                        <thead>
                          <tr>
                            <th style={{ width: 40 }}></th>
                            <th>Produit</th>
                            <th style={{ width: 120 }}>Prix</th>
                            <th style={{ width: 110 }}>Qté</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.map((p) => {
                            const pid = String(getId(p));
                            const checked = selectedProducts.has(pid);
                            const qty = quantities.get(pid) ?? 1;
                            return (
                              <tr key={pid} className={checked ? "table-success" : undefined}>
                                <td>
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={checked}
                                    onChange={() => toggleProduct(pid)}
                                  />
                                </td>
                                <td>{labelForProduct(p)}</td>
                                <td>{fmtMoney(unitPrice(p))}</td>
                                <td>
                                  <input
                                    type="number"
                                    min={1}
                                    className="form-control form-control-sm"
                                    value={qty}
                                    onChange={(e) => changeQty(pid, e.target.value)}
                                    onFocus={(e) => e.target.select()}
                                  />
                                </td>
                              </tr>
                            );
                          })}
                          {filteredProducts.length === 0 && (
                            <tr><td colSpan={4} className="text-center text-muted py-4">Aucun produit</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Résumé commande */}
                  <div className="col-md-5">
                    <div className="card h-100">
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title">Résumé</h5>
                        <div className="flex-grow-1">
                          {[...selectedProducts].map((pid) => {
                            const p = productsById.get(String(pid));
                            if (!p) return null;
                            const q = quantities.get(String(pid)) ?? 1;
                            return (
                              <div key={pid} className="d-flex justify-content-between small border-bottom py-1">
                                <div className="text-truncate" title={labelForProduct(p)}>{labelForProduct(p)} × {q}</div>
                                <div>{fmtMoney(unitPrice(p) * q)}</div>
                              </div>
                            );
                          })}
                          {selectedProducts.size === 0 && (
                            <div className="text-muted small">Aucun produit sélectionné.</div>
                          )}
                        </div>

                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <strong>Total</strong>
                          <strong className="text-success">{fmtMoney(calcModalAmount())}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-light" onClick={close}>Annuler</button>
                  <button type="submit" className="btn btn-primary">Créer la commande</button>
                </div>
              </form>
            ) : (
              /* ======== VUE ÉDITION (Données de la ligne sélectionnée uniquement) ======== */
              <form onSubmit={submitEdit} className="d-flex flex-column gap-3">
                {(() => {
                  const o = modal.order;
                  const oid = String(getId(o));
                  const cid = o?.idCustomer ?? o?.customerId ?? o?.CustomerId ?? o?.customer?.id;
                  const cust = customersById.get(String(cid));
                  const lines = (opByOrder.get(oid) || []).map(l => {
                    const pid = String(getProductIdFromOP(l));
                    const prod = productsById.get(pid);
                    const qty  = Number(l?.quantity ?? l?.qty ?? 1);
                    return { pid, prod, qty };
                  });

                  return (
                    <>
                      {/* En-tête commande */}
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="card">
                            <div className="card-body">
                              <div className="fw-bold mb-1">Client</div>
                              <div>{cust ? `${cust?.firstName ?? ""} ${cust?.lastName ?? ""}`.trim() : "—"}</div>
                              <div className="text-muted small">{cust?.email ?? o?.customer?.email ?? "—"}</div>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="row g-3">
                            <div className="col-sm-6">
                              <label className="form-label">Paiement</label>
                              <select className="form-select" value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                                {["Carte","PayPal","Virement","Espèces"].map(p => <option key={p} value={p}>{p}</option>)}
                              </select>
                            </div>
                            <div className="col-sm-6">
                              <label className="form-label">Statut</label>
                              <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                                {["En attente","En cours","Envoyé préparé","Expédié","Annulé"].map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </div>
                            <div className="col-12">
                              <label className="form-label">Tracking link</label>
                              <input
                                className="form-control"
                                placeholder="https://..."
                                value={trackingLink}
                                onChange={(e) => setTrackingLink(e.target.value)}
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label">Tracking number</label>
                              <input
                                className="form-control"
                                placeholder="Numéro de suivi"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="mt-3 small text-muted">
                            <div><span className="fw-semibold">N° commande :</span> {o?.orderNo ?? o?.orderNumber ?? `#${oid}`}</div>
                            <div><span className="fw-semibold">Date :</span> {o?.date ? new Date(o.date).toLocaleDateString() : "—"}</div>
                          </div>
                        </div>
                      </div>

                      {/* Lignes produits */}
                      <div className="card">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h5 className="card-title mb-0">Produits de la commande</h5>
                            <span className="text-muted small">{lines.length} article(s)</span>
                          </div>

                          <div className="table-responsive">
                            <table className="table table-sm align-middle">
                              <thead>
                                <tr>
                                  <th>Produit</th>
                                  <th style={{width:120}}>Prix unitaire</th>
                                  <th style={{width:110}}>Qté</th>
                                  <th style={{width:140}}>Total ligne</th>
                                  <th style={{width:70}}></th>
                                </tr>
                              </thead>
                              <tbody>
                                {lines.map(({ pid, prod }) => {
                                  const label = labelForProduct(prod);
                                  const qty   = quantities.get(pid) ?? 1; // hydraté à l’ouverture
                                  const price = unitPrice(prod);
                                  return (
                                    <tr key={pid}>
                                      <td className="text-truncate" title={label}>{label}</td>
                                      <td>{fmtMoney(price)}</td>
                                      <td>
                                        <input
                                          type="number"
                                          min={1}
                                          className="form-control form-control-sm"
                                          value={qty}
                                          onChange={(e) => changeQty(pid, e.target.value)}
                                          onFocus={(e) => e.target.select()}
                                        />
                                      </td>
                                      <td className="fw-semibold">{fmtMoney(price * (quantities.get(pid) ?? 1))}</td>
                                      <td className="text-end">
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-outline-danger"
                                          title="Retirer"
                                          onClick={() => toggleProduct(pid)}
                                        >
                                          <i className="bi bi-x-lg" />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                                {lines.length === 0 && (
                                  <tr><td colSpan={5} className="text-center text-muted py-4">Aucun produit dans cette commande.</td></tr>
                                )}
                              </tbody>
                            </table>
                          </div>

                          {/* Total */}
                          <div className="d-flex justify-content-end">
                            <div className="fs-6">
                              <span className="me-2">Total :</span>
                              <strong className="text-success">{fmtMoney(calcModalAmount())}</strong>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="d-flex justify-content-end gap-2">
                        <button type="button" className="btn btn-light" onClick={close}>Fermer</button>
                        <button type="submit" className="btn btn-primary">Enregistrer</button>
                      </div>
                    </>
                  );
                })()}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderAdmin;
