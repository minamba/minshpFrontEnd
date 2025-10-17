// src/lib/utils/stockUi.js
export const qtyFromStockRow = (row) =>
  Number(row?.quantity ?? row?.Quantity ?? row?.qty ?? row?.Qty ?? 0);

export const productIdFromStockRow = (row) =>
  String(row?.idProduct ?? row?.Id_product ?? row?.IdProduct ?? row?.productId ?? "");

export const getQtyByProductId = (stocks = []) => {
  const map = new Map();
  for (const s of stocks) {
    const pid = productIdFromStockRow(s);
    if (!pid) continue;
    map.set(pid, qtyFromStockRow(s));
  }
  return map;
};

// Règles d'UI (à adapter si besoin)
export const stockUiFromQty = (q) => {
  if (q <= 0)
    return { cls: "out", label: "En rupture", isOut: true };

  if (q === 1)
    return { cls: "warn", label: "Il reste 1 produit", isOut: false };

  if (q > 1 && q < 6)
    return { cls: "warn", label: `Il reste ${q} produits`, isOut: false };

  if (q < 10 && q > 5)
    return { cls: "warn", label: "Bientôt en rupture", isOut: false };

  return { cls: "in", label: "En stock", isOut: false };
};

export const getStockUiByProductId = (stocks, productId) => {
  const map = getQtyByProductId(stocks);
  const q = Number(map.get(String(productId)) || 0);
  return { ...stockUiFromQty(q), qty: q };
};
