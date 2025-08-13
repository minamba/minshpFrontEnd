import {takeEvery, takeLatest, call, put, fork} from "redux-saga/effects";
import * as actions from "../actions/FeatureCategoryActions";
import * as api from "../api/featureCategories";



function* getFeatureCategories() {
    try {
        const response = yield call (api.getFeatureCategories);
        console.log("Feature categories :",response.data);
        yield put (actions.getFeatureCategorySuccess({featureCategories : response.data}));
    }
    catch (error) {
        yield put (actions.getFeatureCategoryFailure({error : error.response?.data || error.message}));
    }
}

function* getFeaturesCategoryByProduct(action) {
    try {
        const response = yield call (api.getFeaturesCategoryByProduct, action.payload);
        //console.log("Features category by product :",response.data);
        yield put (actions.getFeatureCategoryByProductSuccess({featuresCategoryByProduct : response.data}));
    }
    catch (error) {
        yield put (actions.getFeatureCategoryByProductFailure({error : error.response?.data || error.message}));
    }
}

function* addFeatureCategory(action) {
    try {
        const response = yield call (api.addFeatureCategory, action.payload);
        console.log("Feature category added :",response.data);
        const featureCategories = yield call (api.getFeatureCategories);
        yield put (actions.getFeatureCategorySuccess({featureCategories : featureCategories.data}));
    }
    catch (error) {
        yield put (actions.addFeatureCategoryFailure({error : error.response?.data || error.message}));
    }
}


function* updateFeatureCategory(action) {
    try {
        const response = yield call (api.updateFeatureCategory, action.payload);
        console.log("Feature category updated :",response.data);
        const featureCategories = yield call (api.getFeatureCategories);
        yield put (actions.getFeatureCategorySuccess({featureCategories : featureCategories.data}));
    }
    catch (error) {
        yield put (actions.updateFeatureCategoryFailure({error : error.response?.data || error.message}));
    }
}

function* deleteFeatureCategory(action) {
    try {
            yield call(api.deleteFeatureCategory, action.payload);
            const response = yield call(api.getFeatureCategories);

            yield put (actions.getFeatureCategorySuccess({featureCategories : response.data}));
    }
    catch (error) {
        yield put (actions.deleteFeatureCategoryFailure({error : error.response?.data || error.message}));
    }
}




function* watchGetFeatureCategories() {
    yield takeLatest(actions.actionsFeatureCategory.GET_FEATURE_CATEGORY_REQUEST, getFeatureCategories);
}

function* watchGetFeaturesCategoryByProduct() {
    yield takeLatest(actions.actionsFeatureCategory.GET_FEATURE_CATEGORY_BY_PRODUCT_REQUEST, getFeaturesCategoryByProduct);
}

function* watchAddFeatureCategory() {
    yield takeLatest(actions.actionsFeatureCategory.ADD_FEATURE_CATEGORY_REQUEST, addFeatureCategory);
}

function* watchUpdateFeatureCategory() {
    yield takeLatest(actions.actionsFeatureCategory.UPDATE_FEATURE_CATEGORY_REQUEST, updateFeatureCategory);
}

function* watchDeleteFeatureCategory() {
    yield takeLatest(actions.actionsFeatureCategory.DELETE_FEATURE_CATEGORY_REQUEST, deleteFeatureCategory);
}

function* featureCategoriesSaga() {
    yield fork(watchGetFeatureCategories);
    yield fork(watchGetFeaturesCategoryByProduct);
    yield fork(watchAddFeatureCategory);
    yield fork(watchUpdateFeatureCategory);
    yield fork(watchDeleteFeatureCategory);
}

export default featureCategoriesSaga;

