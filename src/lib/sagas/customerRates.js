import {takeEvery, takeLatest, call, put, fork} from "redux-saga/effects";
import * as actions from "../actions/CustomerRateActions";
import * as actionsProduct from "../actions/ProductActions";
import * as api from "../api/customerRates";
import * as apiProduct from "../api/products";



function* getCustomerRates() {
    try {
        const response = yield call (api.getCustomerRates);
        console.log("CustomerRates :",response.data);
        yield put (actions.getCustomerRateSuccess({customerRates : response.data}));
        const products = yield call (apiProduct.getProducts);
        yield put (actionsProduct.getProductUserSuccess({products : products.data}));
    }
    catch (error) {
        yield put (actions.getCustomerRateFailure({error : error.response?.data || error.message}));
    }
}

function* addCustomerRate(action) {
    try {
        const response = yield call (api.addCustomerRate, action.payload);
        console.log("CustomerRate added :",response.data);
        const customerRates = yield call (api.getCustomerRates);
        yield put (actions.getCustomerRateSuccess({customerRates : customerRates.data}));
        const products = yield call (apiProduct.getProducts);
        yield put (actionsProduct.getProductUserSuccess({products : products.data}));

    }
    catch (error) {
        yield put (actions.addCustomerRateFailure({error : error.response?.data || error.message}));
    }
}


function* updateCustomerRate(action) {
    try {
        const response = yield call (api.updateCustomerRate, action.payload);
        console.log("CustomerRate updated :",response.data);
        const customerRates = yield call (api.getCustomerRates);
        yield put (actions.getCustomerRateSuccess({customerRates : customerRates.data}));
        const products = yield call (apiProduct.getProducts);
        yield put (actionsProduct.getProductUserSuccess({products : products.data}));
    }
    catch (error) {
        yield put (actions.updateCustomerRateFailure({error : error.response?.data || error.message}));
    }
}

function* deleteCustomerRate(action) {
    try {
            yield call(api.deleteCustomerRate, action.payload);
            const response = yield call(api.getCustomerRates);

            yield put (actions.getCustomerRateSuccess({customerRates : response.data}));

            const products = yield call (apiProduct.getProducts);
            yield put (actionsProduct.getProductUserSuccess({products : products.data}));
    }
    catch (error) {
        yield put (actions.deleteCustomerRateFailure({error : error.response?.data || error.message}));
    }
}




function* watchGetCustomerRates() {
    yield takeLatest(actions.actionsCustomerRate.GET_CUSTOMER_RATE_REQUEST, getCustomerRates);
}

function* watchAddCustomerRate() {
    yield takeLatest(actions.actionsCustomerRate.ADD_CUSTOMER_RATE_REQUEST, addCustomerRate);
}

function* watchUpdateCustomerRate() {
    yield takeLatest(actions.actionsCustomerRate.UPDATE_CUSTOMER_RATE_REQUEST, updateCustomerRate);
}

function* watchDeleteCustomerRate() {
    yield takeLatest(actions.actionsCustomerRate.DELETE_CUSTOMER_RATE_REQUEST, deleteCustomerRate);
}

function* customerRatesSaga() {
    yield fork(watchGetCustomerRates);
    yield fork(watchAddCustomerRate);
    yield fork(watchUpdateCustomerRate);
    yield fork(watchDeleteCustomerRate);
}

export default customerRatesSaga;

