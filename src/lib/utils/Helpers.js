import React, { useMemo, useState, useEffect } from "react";
import "../../App.css";
import { useSelector } from "react-redux";


export const calculPrice = (product, promotionCodes = []) => {
    if (!product) return 0;
  
    const now = new Date();
    const isActive = (end) => !!end && now <= new Date(end);
  
    const tvaMultiplier = ((product?.tva ?? 0) / 100) + 1;
    const tax = product?.taxWithoutTvaAmount ?? 0;
  
    const endProd = product?.promotions?.[0]?.endDate;
  
    // 👇 sécurise l’accès au [0] et ajoute un fallback
    const subPromoId =
      product?.subCategoryVm?.promotionCodes?.[0]?.id ??
      product?.subCategoryVm?.idPromotionCode ??
      null;
  
    const catPromoId =
      product?.categoryVm?.promotionCodes?.[0]?.id ??
      product?.categoryVm?.idPromotionCode ??
      null;
  
    const endSub = promotionCodes.find(p => p.id === subPromoId)?.endDate;
    const endCat = promotionCodes.find(p => p.id === catPromoId)?.endDate;
  
    if (product?.priceHtSubCategoryCodePromoted != null && isActive(endSub)) {
      return product.priceHtSubCategoryCodePromoted * tvaMultiplier + tax;
    }
    if (product?.priceHtCategoryCodePromoted != null && isActive(endCat)) {
      return product.priceHtCategoryCodePromoted * tvaMultiplier + tax;
    }
    if (product?.priceHtPromoted != null && isActive(endProd)) {
      return product.priceHtPromoted * tvaMultiplier + tax;
    }
    return (product?.price ?? 0) * tvaMultiplier + tax;
  };
  

export const calculPriceForApplyPromoCode = (product, promotions, promotionCodes ,category, subCategory) => {
    let getPromotionPurcentage = null;
    let getCategoryPromotionPurcentage = null;
    let getSubCategoryPromotionPurcentage = null;

    let totalPurcentage = null;

    getPromotionPurcentage = promotions.find((p) => p.idProduct === product.id);

   if(category !== undefined && category !== null)
    getCategoryPromotionPurcentage = promotionCodes.find((p) => p.idCategory === category.id);

    if(subCategory !== undefined && subCategory !== null)
        getSubCategoryPromotionPurcentage = promotionCodes.find((p) => p.idSubCategory === subCategory.id);
    

    if(getPromotionPurcentage !== undefined && getPromotionPurcentage !== null) totalPurcentage += getPromotionPurcentage.purcentage;
    if(getCategoryPromotionPurcentage !== undefined && getCategoryPromotionPurcentage !== null) totalPurcentage += getCategoryPromotionPurcentage.purcentage;
    if(getSubCategoryPromotionPurcentage !== undefined && getSubCategoryPromotionPurcentage !== null) totalPurcentage += getSubCategoryPromotionPurcentage.purcentage;

    return totalPurcentage;
}


