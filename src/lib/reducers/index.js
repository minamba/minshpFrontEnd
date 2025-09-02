import { combineReducers } from "redux";
import productReducer from "./ProductReducers";
import categoryReducer from "./CategoryReducers";
import imageReducer from "./ImageReducers";
import orderReducer from "./OrderReducers";
import featureReducer from "./FeatureReducers";
import featureProductReducer from "./FeatureProductReducers";
import promotionReducer from "./PromotionReducers";
import stockReducer from "./StockReducers";
import customerReducer from "./CustomerReducers";
import videoReducer from "./VideoReducers";
import uploadReducer from "./UploadReducers";
import featureCategoryReducer from "./FeatureCategoryReducers";
import cartReducer from "./CartReducers";
import taxeReducer from "./TaxeReducers";
import promotionCodeReducer from "./PromotionCodeReducers";
import applicationReducer from "./ApplicationReducers";
import AccountReducer from "./AccountReducers";
import billingAddressReducer from "./BillingAddressReducers";
import deliveryAddressReducer from "./DeliveryAddressReducers";
import orderCustomerProductReducer from "./OrderCustomerProductReducers";
import shippingReducer from "./ShippingReducers";
import packageprofilReducer from "./PackageProfilReducers";

export default combineReducers({
    products : productReducer,
    categories : categoryReducer,
    images : imageReducer,
    orders : orderReducer,
    features : featureReducer,
    featureProducts : featureProductReducer,
    promotions : promotionReducer,
    stocks : stockReducer,
    customers : customerReducer,
    videos : videoReducer,
    upload : uploadReducer,
    featureCategories : featureCategoryReducer,
    items : cartReducer,
    taxes : taxeReducer,
    promotionCodes : promotionCodeReducer,
    applications : applicationReducer,
    account : AccountReducer,
    billingAddresses : billingAddressReducer,
    deliveryAddresses : deliveryAddressReducer,
    orderProducts : orderCustomerProductReducer,
    shipping : shippingReducer,
    packageProfils : packageprofilReducer
})