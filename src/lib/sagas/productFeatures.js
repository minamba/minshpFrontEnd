import {takeEvery, takeLatest, call, put, fork} from "redux-saga/effects";
import * as actions from "../actions/FeatureProductActions";
import * as api from "../api/productFeatures";



function* getProductFeatures() {
    try {
        const response = yield call (api.getProductFeatures);
        console.log("Features :",response.data);
        yield put (actions.getFeatureProductSuccess({features : response.data}));
    }
    catch (error) {
        yield put (actions.getFeatureProductFailure({error : error.response?.data || error.message}));
    }
}

function* addProductFeature(action) {
    try {
        const response = yield call (api.addProductFeature, action.payload);
        console.log("Feature added :",response.data);
        const features = yield call (api.getProductFeatures);
        yield put (actions.getFeatureProductSuccess({features : features.data}));
    }
    catch (error) {
        yield put (actions.addFeatureProductFailure({error : error.response?.data || error.message}));
    }
}


function* updateProductFeature(action) {
    try {
        const response = yield call (api.updateProductFeature, action.payload);
        console.log("Feature updated :",response.data);
        const features = yield call (api.getProductFeatures);
        yield put (actions.getFeatureProductSuccess({features : features.data}));
    }
    catch (error) {
        yield put (actions.updateFeatureProductFailure({error : error.response?.data || error.message}));
    }
}

function* deleteProductFeature(action) {
    try {
            yield call(api.deleteProductFeature, action.payload);
            const response = yield call(api.getProductFeatures);

            yield put (actions.getFeatureProductSuccess({features : response.data}));
    }
    catch (error) {
        yield put (actions.deleteFeatureProductFailure({error : error.response?.data || error.message}));
    }
}




function* watchGetProductFeatures() {
    yield takeLatest(actions.actionsFeatureProduct.GET_FEATURE_PRODUCT_REQUEST, getProductFeatures);
}

function* watchAddProductFeature() {
    yield takeLatest(actions.actionsFeatureProduct.ADD_FEATURE_PRODUCT_REQUEST, addProductFeature);
}

function* watchUpdateProductFeature() {
    yield takeLatest(actions.actionsFeatureProduct.UPDATE_FEATURE_PRODUCT_REQUEST, updateProductFeature);
}

function* watchDeleteProductFeature() {
    yield takeLatest(actions.actionsFeatureProduct.DELETE_FEATURE_PRODUCT_REQUEST, deleteProductFeature);
}

function* productFeaturesSaga() {
    yield fork(watchGetProductFeatures);
    yield fork(watchAddProductFeature);
    yield fork(watchUpdateProductFeature);
    yield fork(watchDeleteProductFeature);
}

export default productFeaturesSaga;

