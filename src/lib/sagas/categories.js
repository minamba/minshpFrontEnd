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

function* watchGetCategories() {
    yield takeLatest(actions.actionsCategory.GET_CATEGORY_REQUEST, getCategories);
}

function* categoriesSaga() {
    yield fork(watchGetCategories);
}

export default categoriesSaga;
