import productsSaga from "./products";
import categoriesSaga from "./categories";
import stocksSaga from "./stocks";
import uploadSaga from "./upload";
import { all } from "redux-saga/effects";

export default function* rootSaga() {
    yield all([
        productsSaga(),
        categoriesSaga(),
        stocksSaga(),
        uploadSaga(),
    ]);
}
