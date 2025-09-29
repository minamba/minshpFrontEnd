import {takeEvery, takeLatest, call, put, fork} from "redux-saga/effects";
import * as actions from "../actions/PromotionCodeActions";
import * as actionsApplication from "../actions/ApplicationActions";
import * as api from "../api/promotionCodes";
import * as apiApplication from "../api/applications";



function* getPromotionCodes() {
    try {
        const response = yield call (api.getPromotionCodes);
        console.log("Promotion codes :",response.data);
        yield put (actions.getPromotionCodesSuccess({promotionCodes : response.data}));
    }
    catch (error) {
        yield put (actions.getPromotionCodesFailure({error : error.response?.data || error.message}));
    }
}

function* addPromotionCode(action) {
    try {
        const response = yield call (api.addPromotionCode, action.payload);
        console.log("Promotion code added :",response.data);
        const promotionCodes = yield call (api.getPromotionCodes);
        yield put (actions.getPromotionCodesSuccess({promotionCodes : promotionCodes.data}));
        const apps = yield call (apiApplication.getApplication);
        yield put (actionsApplication.getApplicationSuccess({applications : apps.data}));
    }
    catch (error) {
        yield put (actions.addPromotionCodeFailure({error : error.response?.data || error.message}));
    }
}


function* updatePromotionCode(action) {
    try {
        const response = yield call (api.updatePromotionCode, action.payload);
        console.log("Promotion code updated :",response.data);
        const promotionCodes = yield call (api.getPromotionCodes);
        yield put (actions.getPromotionCodesSuccess({promotionCodes : promotionCodes.data}));
        const apps = yield call (apiApplication.getApplication);
        yield put (actionsApplication.getApplicationSuccess({applications : apps.data}));
    }
    catch (error) {
        yield put (actions.updatePromotionCodeFailure({error : error.response?.data || error.message}));
    }
}

function* deletePromotionCode(action) {
    try {
            yield call(api.deletePromotionCode, action.payload);
            const response = yield call(api.getPromotionCodes);

            yield put (actions.getPromotionCodesSuccess({promotionCodes : response.data}));
            const apps = yield call (apiApplication.getApplication);
            yield put (actionsApplication.getApplicationSuccess({applications : apps.data}));
    }
    catch (error) {
        yield put (actions.deletePromotionCodeFailure({error : error.response?.data || error.message}));
    }
}




function* watchGetPromotionCodes() {
    yield takeLatest(actions.actionsPromotionCode.GET_PROMOTION_CODE_REQUEST, getPromotionCodes);
}

function* watchAddPromotionCode() {
    yield takeLatest(actions.actionsPromotionCode.ADD_PROMOTION_CODE_REQUEST, addPromotionCode);
}

function* watchUpdatePromotionCode() {
    yield takeLatest(actions.actionsPromotionCode.UPDATE_PROMOTION_CODE_REQUEST, updatePromotionCode);
}

function* watchDeletePromotionCode() {
    yield takeLatest(actions.actionsPromotionCode.DELETE_PROMOTION_CODE_REQUEST, deletePromotionCode);
}

function* promotionCodesSaga() {
    yield fork(watchGetPromotionCodes);
    yield fork(watchAddPromotionCode);
    yield fork(watchUpdatePromotionCode);
    yield fork(watchDeletePromotionCode);
}

export default promotionCodesSaga;

