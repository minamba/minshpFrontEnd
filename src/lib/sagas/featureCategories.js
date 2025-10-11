// featureCategoriesSaga.js
import { takeLatest, call, put, fork } from "redux-saga/effects";
import * as actions from "../actions/FeatureCategoryActions";
import * as api from "../api/featureCategories";

function* getFeatureCategories() {
  try {
    const response = yield call(api.getFeatureCategories);
    yield put(actions.getFeatureCategorySuccess({ featureCategories: response.data }));
  } catch (error) {
    yield put(actions.getFeatureCategoryFailure({ error: error.response?.data || error.message }));
  }
}

function* getFeaturesCategoryByProduct(action) {
  try {
    const productId = action.payload;
    const response = yield call(api.getFeaturesCategoryByProduct, productId);
    // ✅ passe (productId, features) au reducer normalisé
    yield put(actions.getFeatureCategoryByProductSuccess(productId, response.data));
  } catch (error) {
    yield put(actions.getFeatureCategoryByProductFailure({ error: error.response?.data || error.message }));
  }
}

function* addFeatureCategory(action) {
  try {
    yield call(api.addFeatureCategory, action.payload);
    const featureCategories = yield call(api.getFeatureCategories);
    yield put(actions.getFeatureCategorySuccess({ featureCategories: featureCategories.data }));
  } catch (error) {
    yield put(actions.addFeatureCategoryFailure({ error: error.response?.data || error.message }));
  }
}

function* updateFeatureCategory(action) {
  try {
    yield call(api.updateFeatureCategory, action.payload);
    const featureCategories = yield call(api.getFeatureCategories);
    yield put(actions.getFeatureCategorySuccess({ featureCategories: featureCategories.data }));
  } catch (error) {
    yield put(actions.updateFeatureCategoryFailure({ error: error.response?.data || error.message }));
  }
}

function* deleteFeatureCategory(action) {
  try {
    yield call(api.deleteFeatureCategory, action.payload);
    const response = yield call(api.getFeatureCategories);
    yield put(actions.getFeatureCategorySuccess({ featureCategories: response.data }));
  } catch (error) {
    yield put(actions.deleteFeatureCategoryFailure({ error: error.response?.data || error.message }));
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

export default function* featureCategoriesSaga() {
  yield fork(watchGetFeatureCategories);
  yield fork(watchGetFeaturesCategoryByProduct);
  yield fork(watchAddFeatureCategory);
  yield fork(watchUpdateFeatureCategory);
  yield fork(watchDeleteFeatureCategory);
}
