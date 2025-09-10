// src/lib/utils/cartLocalStorage.js
const LS_KEY = "items";

const readLs = () => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }
  catch { return []; }
};
const writeLs = (arr) => localStorage.setItem(LS_KEY, JSON.stringify(arr));

const getPPId = (pp) =>
  pp?.id ?? pp?.Id ?? pp?.packageProfilId ?? pp?.PackageProfilId ?? null;

const normalizePP = (pp) => ({
  id: getPPId(pp),
  name: pp?.name ?? pp?.Name ?? "",
  description: pp?.description ?? pp?.Description ?? "",
  longer: Number(pp?.longer ?? pp?.Longer ?? pp?.longueur ?? pp?.Longueur) || 0,
  width:  Number(pp?.width  ?? pp?.Width  ?? pp?.largeur  ?? pp?.Largeur)  || 0,
  height: Number(pp?.height ?? pp?.Height ?? pp?.hauteur  ?? pp?.Hauteur)  || 0,
  weight: Number(pp?.weight ?? pp?.Weight ?? pp?.poids    ?? pp?.Poids)    || 0,
});

const getItemPPId = (it) =>
  it?.packageProfil?.id ??
  it?.packageProfil?.Id ??
  it?.packageProfilId ??
  it?.product?.packageProfil?.id ??
  it?.product?.packageProfil?.Id ??
  null;

/** Met à jour l'objet packageProfil dans tous les items qui pointent vers cet ID */
export function patchPackageProfilInCart(updatedPP) {
  const pp = normalizePP(updatedPP);
  if (!pp.id) return;

  const items = readLs();
  let changed = false;

  const next = items.map((it) => {
    const currentId = getItemPPId(it);
    if (String(currentId) !== String(pp.id)) return it;

    const copy = { ...it };

    if (copy.packageProfil) {
      copy.packageProfil = { ...copy.packageProfil, ...pp, id: pp.id };
      changed = true;
      return copy;
    }
    if (copy.product?.packageProfil) {
      copy.product = {
        ...copy.product,
        packageProfil: { ...copy.product.packageProfil, ...pp, id: pp.id },
      };
      changed = true;
      return copy;
    }
    if ("packageProfilId" in copy) {
      // Option: injecter l'objet si besoin
      // copy.packageProfil = pp;
      changed = true;
    }
    return copy;
  });

  if (changed) writeLs(next);
}

/** Au delete, enlève la référence au packageProfil dans les items */
export function removePackageProfilFromCart(ppIdToRemove) {
  const items = readLs();
  let changed = false;

  const next = items.map((it) => {
    const currentId = getItemPPId(it);
    if (String(currentId) !== String(ppIdToRemove)) return it;

    const copy = { ...it };
    if (copy.packageProfil) copy.packageProfil = null;
    if (copy.product?.packageProfil) {
      copy.product = { ...copy.product, packageProfil: null };
    }
    if ("packageProfilId" in copy) copy.packageProfilId = null;

    changed = true;
    return copy;
  });

  if (changed) writeLs(next);
}
