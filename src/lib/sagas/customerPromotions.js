import {takeEvery, takeLatest, call, put, fork} from "redux-saga/effects";
import * as actions from "../actions/CustomerPromotionCodeActions";
import * as api from "../api/customerPromotions";



function* getCustomerPromotionCodes() {
    try {
        const response  = yield call (api.getCustomerPromotionCodes);
        console.log("CustomerPromotionCodes :",response.data);
        yield put (actions.getCustomerPromotionCodeSuccess({customerPromotionCodes : response.data}));
    }
    catch (error) {
        yield put (actions.getCustomerPromotionCodeFailure({error : error.response?.data || error.message}));
    }
}

function* addCustomerPromotionCode(action) {
    try {
        const response = yield call (api.addCustomerPromotionCode, action.payload);
        console.log("CustomerPromotionCode added :",response.data);
        const customerPromotionCodes = yield call (api.getCustomerPromotionCodes);
        yield put (actions.getCustomerPromotionCodeSuccess({customerPromotionCodes : customerPromotionCodes.data}));
    }
    catch (error) {
        yield put (actions.addCustomerPromotionCodeFailure({error : error.response?.data || error.message}));
    }
}

function* updateCustomerPromotionCode(action) {
    try {
        const response = yield call (api.updateCustomerPromotionCode, action.payload);
        console.log("CustomerPromotionCode updated :",response.data);
        const customerPromotionCodes = yield call (api.getCustomerPromotionCodes);
        yield put (actions.getCustomerPromotionCodeSuccess({customerPromotionCodes : customerPromotionCodes.data}));
    }
    catch (error) {
        yield put (actions.updateCustomerPromotionCodeFailure({error : error.response?.data || error.message}));
    }
}

function* deleteCustomerPromotionCode(action) {
    try {
            yield call(api.deleteCustomerPromotionCode, action.payload);
            console.log("CustomerPromotionCode deleted :",action.payload);
            const response = yield call(api.getCustomerPromotionCodes);

            yield put (actions.getCustomerPromotionCodeSuccess({customerPromotionCodes : response.data}));
    }
    catch (error) {
        yield put (actions.deleteCustomerPromotionCodeFailure({error : error.response?.data || error.message}));
    }
}




function* watchGetCustomerPromotionCodes() {
    yield takeLatest(actions.actionsCustomerPromotionCode.GET_CUSTOMER_PROMOTION_CODE_REQUEST, getCustomerPromotionCodes);
}

function* watchAddCustomerPromotionCode() {
    yield takeLatest(actions.actionsCustomerPromotionCode.ADD_CUSTOMER_PROMOTION_CODE_REQUEST, addCustomerPromotionCode);
}

function* watchUpdateCustomerPromotionCode() {
    yield takeLatest(actions.actionsCustomerPromotionCode.UPDATE_CUSTOMER_PROMOTION_CODE_REQUEST, updateCustomerPromotionCode);
}

function* watchDeleteCustomerPromotionCode() {
    yield takeLatest(actions.actionsCustomerPromotionCode.DELETE_CUSTOMER_PROMOTION_CODE_REQUEST, deleteCustomerPromotionCode);
}

function* customerPromotionSaga() {
    yield fork(watchGetCustomerPromotionCodes);
    yield fork(watchAddCustomerPromotionCode);
    yield fork(watchUpdateCustomerPromotionCode);
    yield fork(watchDeleteCustomerPromotionCode);
}

export default customerPromotionSaga;

