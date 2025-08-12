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
})