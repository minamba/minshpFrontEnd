import productsSaga from "./products";
import categoriesSaga from "./categories";
import stocksSaga from "./stocks";
import uploadSaga from "./upload";
import featuresSaga from "./features";
import productFeaturesSaga from "./productFeatures";
import promotionsSaga from "./promotions";
import imagesSaga from "./images";
import videosSaga from "./videos";
import featureCategoriesSaga from "./featureCategories";
import cartSaga from "./carts";
import taxesSaga from "./taxes";
import promotionCodesSaga from "./promotionCodes";
import { all } from "redux-saga/effects";


export default function* rootSaga() {
    yield all([
        productsSaga(),
        categoriesSaga(),
        stocksSaga(),
        uploadSaga(),
        featuresSaga(),
        productFeaturesSaga(),
        promotionsSaga(),
        imagesSaga(),
        videosSaga(),
        featureCategoriesSaga(),
        cartSaga(),
        taxesSaga(),
        promotionCodesSaga()
    ]);
}
