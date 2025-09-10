import {takeEvery, takeLatest, call, put, fork} from "redux-saga/effects";
import * as actions from "../actions/SubCategoryActions";
import * as api from "../api/subCategories";

function* getSubCategories() {
    try {
        const response = yield call (api.getSubCategories);
        console.log("SubCategories :",response.data);
        yield put (actions.getSubCategorySuccess({subCategories : response.data}));
    }
    catch (error) {
        yield put (actions.getSubCategoryFailure({error : error.response?.data || error.message}));
    }
}

function* addSubCategory(action) {
    try {
        const response = yield call (api.addSubCategory, action.payload);
        console.log("SubCategory added :",response.data);
        const subCategories = yield call (api.getSubCategories);
        yield put (actions.getSubCategorySuccess({subCategories : subCategories.data}));
    }
    catch (error) {
        yield put (actions.addSubCategoryFailure({error : error.response?.data || error.message}));
    }
}

function* updateSubCategory(action) {
    try {
        const response = yield call (api.updateSubCategory, action.payload);
        console.log("SubCategory updated :",response.data);
        const subCategories = yield call (api.getSubCategories);
        yield put (actions.getSubCategorySuccess({subCategories : subCategories.data}));
    }
    catch (error) {
        yield put (actions.updateSubCategoryFailure({error : error.response?.data || error.message}));
    }
}

function* deleteSubCategory(action) {
    try {
            yield call(api.deleteSubCategory, action.payload);
            console.log("SubCategory deleted :",action.payload);
            const response = yield call(api.getSubCategories);

            yield put (actions.getSubCategorySuccess({subCategories : response.data}));
    }
    catch (error) {
        yield put (actions.deleteSubCategoryFailure({error : error.response?.data || error.message}));
    }
}


function* watchGetSubCategories() {
    yield takeLatest(actions.actionsSubCategory.GET_SUBCATEGORY_REQUEST, getSubCategories);
    yield takeLatest(actions.actionsSubCategory.ADD_SUBCATEGORY_REQUEST, addSubCategory);
    yield takeLatest(actions.actionsSubCategory.UPDATE_SUBCATEGORY_REQUEST, updateSubCategory);
    yield takeLatest(actions.actionsSubCategory.DELETE_SUBCATEGORY_REQUEST, deleteSubCategory);
}

function* subCategoriesSaga() {
    yield fork(watchGetSubCategories);
}

export default subCategoriesSaga;
