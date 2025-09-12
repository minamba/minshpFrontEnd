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
import applicationSaga from "./application";
import accountSaga from "./account";
import customersSaga from "./customers";
import billingAddressesSaga from "./billingAddress";
import deliveryAddressesSaga from "./deliveryAddress";
import ordersSaga from "./orders";
import orderProductsSaga from "./orderProducts";
import shippingSaga from "./shipping";
import packageProfilsSaga from "./packageProfils";
import subCategoriesSaga from "./subCategories";
import stripeSaga from "./stripe";
import invoicesSaga from "./invoices";
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
        promotionCodesSaga(),
        applicationSaga(),
        accountSaga(),
        customersSaga(),
        billingAddressesSaga(),
        deliveryAddressesSaga(),
        ordersSaga(),
        orderProductsSaga(),
        shippingSaga(),
        packageProfilsSaga(),
        subCategoriesSaga(),
        stripeSaga(),
        invoicesSaga()
    ]);
}
