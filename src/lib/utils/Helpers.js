import React, { useMemo, useState, useEffect } from "react";
import "../../App.css";
import { useSelector } from "react-redux";


export const calculPrice = (product) => {
    if(product.priceHtSubCategoryCodePromoted !== null) return (product.priceHtSubCategoryCodePromoted * (product?.tva / 100 + 1)) + product?.taxWithoutTvaAmount;
    else if(product.priceHtCategoryCodePromoted !== null && product.priceHtSubCategoryCodePromoted === null) return (product.priceHtCategoryCodePromoted * (product?.tva / 100 + 1)) + product?.taxWithoutTvaAmount;
    else if(product.priceHtPromoted !== null && product.priceHtSubCategoryCodePromoted === null && product.priceHtCategoryCodePromoted === null) return (product.priceHtPromoted * (product?.tva / 100 + 1)) + product?.taxWithoutTvaAmount;
    else  return (product.price * (product?.tva / 100 + 1)) + product?.taxWithoutTvaAmount;
}

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


