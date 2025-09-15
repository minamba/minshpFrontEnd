export const calculPrice = (product) => {
    if(product.priceTtcSubCategoryCodePromoted !== null) return (product.priceTtcSubCategoryCodePromoted * (product?.tva / 100 + 1)) + product?.taxWithoutTvaAmount;
    else if(product.priceTtcCategoryCodePromoted !== null && product.priceTtcSubCategoryCodePromoted === null) return (product.priceTtcCategoryCodePromoted * (product?.tva / 100 + 1)) + product?.taxWithoutTvaAmount;
    else if(product.priceTtcPromoted !== null && product.priceTtcSubCategoryCodePromoted === null && product.priceTtcCategoryCodePromoted === null) return (product.priceTtcPromoted * (product?.tva / 100 + 1)) + product?.taxWithoutTvaAmount;
    else  return (product.price * (product?.tva / 100 + 1)) + product?.taxWithoutTvaAmount;
}