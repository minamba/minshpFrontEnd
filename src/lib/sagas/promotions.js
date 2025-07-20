import {takeEvery, takeLatest, call, put, fork} from "redux-saga/effects";
import * as actions from "../actions/PromotionActions";
import * as api from "../api/promotions";



function* getPromotions() {
    try {
        const response = yield call (api.getPromotions);
        console.log("Promotions :",response.data);
        yield put (actions.getPromotionSuccess({promotions : response.data}));
    }
    catch (error) {
        yield put (actions.getPromotionFailure({error : error.response?.data || error.message}));
    }
}

function* addPromotion(action) {
    try {
        const response = yield call (api.addPromotion, action.payload);
        console.log("Promotion added :",response.data);
        const promotions = yield call (api.getPromotions);
        yield put (actions.getPromotionSuccess({promotions : promotions.data}));
    }
    catch (error) {
        yield put (actions.addPromotionFailure({error : error.response?.data || error.message}));
    }
}

function* updatePromotion(action) {
    try {
        const response = yield call (api.updatePromotion, action.payload);
        console.log("Promotion updated :",response.data);
        const promotions = yield call (api.getPromotions);
        yield put (actions.getPromotionSuccess({promotions : promotions.data}));
    }
    catch (error) {
        yield put (actions.updatePromotionFailure({error : error.response?.data || error.message}));
    }
}

function* deletePromotion(action) {
    try {
            yield call(api.deletePromotion, action.payload);
            console.log("Promotion deleted :",action.payload);
            const response = yield call(api.getPromotions);

            yield put (actions.getPromotionSuccess({promotions : response.data}));
    }
    catch (error) {
        yield put (actions.deletePromotionFailure({error : error.response?.data || error.message}));
    }
}




function* watchGetPromotions() {
    yield takeLatest(actions.actionsPromotion.GET_PROMOTION_REQUEST, getPromotions);
}

function* watchAddPromotion() {
    yield takeLatest(actions.actionsPromotion.ADD_PROMOTION_REQUEST, addPromotion);
}

function* watchUpdatePromotion() {
    yield takeLatest(actions.actionsPromotion.UPDATE_PROMOTION_REQUEST, updatePromotion);
}

function* watchDeletePromotion() {
    yield takeLatest(actions.actionsPromotion.DELETE_PROMOTION_REQUEST, deletePromotion);
}

function* promotionsSaga() {
    yield fork(watchGetPromotions);
    yield fork(watchAddPromotion);
    yield fork(watchUpdatePromotion);
    yield fork(watchDeletePromotion);
}

export default promotionsSaga;

