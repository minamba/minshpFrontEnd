import {takeEvery, takeLatest, call, put, fork} from "redux-saga/effects";
import * as actions from "../actions/CategoryActions";
import * as api from "../api/categories";

function* getCategories() {
    try {
        const response = yield call (api.getCategories);
        console.log("Categories :",response.data);
        yield put (actions.getCategorySuccess({categories : response.data}));
    }
    catch (error) {
        yield put (actions.getCategoryFailure({error : error.response?.data || error.message}));
    }
}

function* addCategory(action) {
    try {
        const response = yield call (api.addCategory, action.payload);
        console.log("Category added :",response.data);
        const categories = yield call (api.getCategories);
        yield put (actions.getCategorySuccess({categories : categories.data}));
    }
    catch (error) {
        yield put (actions.addCategoryFailure({error : error.response?.data || error.message}));
    }
}

function* updateCategory(action) {
    try {
        const response = yield call (api.updateCategory, action.payload);
        console.log("Category updated :",response.data);
        const categories = yield call (api.getCategories);
        yield put (actions.getCategorySuccess({categories : categories.data}));
    }
    catch (error) {
        yield put (actions.updateCategoryFailure({error : error.response?.data || error.message}));
    }
}

function* deleteCategory(action) {
    try {
            yield call(api.deleteCategory, action.payload);
            console.log("Category deleted :",action.payload);
            const response = yield call(api.getCategories);

            yield put (actions.getCategorySuccess({categories : response.data}));
    }
    catch (error) {
        yield put (actions.deleteCategoryFailure({error : error.response?.data || error.message}));
    }
}


function* watchGetCategories() {
    yield takeLatest(actions.actionsCategory.GET_CATEGORY_REQUEST, getCategories);
    yield takeLatest(actions.actionsCategory.ADD_CATEGORY_REQUEST, addCategory);
    yield takeLatest(actions.actionsCategory.UPDATE_CATEGORY_REQUEST, updateCategory);
    yield takeLatest(actions.actionsCategory.DELETE_CATEGORY_REQUEST, deleteCategory);
}

function* categoriesSaga() {
    yield fork(watchGetCategories);
}

export default categoriesSaga;
