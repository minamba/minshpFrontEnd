import {takeEvery, takeLatest, call, put, fork} from "redux-saga/effects";
import * as actions from "../actions/BillingAddressActions";
import * as api from "../api/billingAddress";

function* getBillingAddresses() {
    try {
        const response = yield call (api.getBillingAddresses);
        console.log("Billing addresses :",response.data);
        yield put (actions.getBillingAddressSuccess({billingAddresses : response.data}));
    }
    catch (error) {
        yield put (actions.getBillingAddressFailure({error : error.response?.data || error.message}));
    }
}

function* addBillingAddress(action) {
    try {
        const response = yield call (api.addBillingAddress, action.payload);
        console.log("Billing address added :",response.data);
        const billingAddresses = yield call (api.getBillingAddresses);
        yield put (actions.getBillingAddressSuccess({billingAddresses : billingAddresses.data}));
    }
    catch (error) {
        yield put (actions.addBillingAddressFailure({error : error.response?.data || error.message}));
    }
}

function* updateBillingAddress(action) {
    try {
        const response = yield call (api.updateBillingAddress, action.payload);
        console.log("Billing address updated :",response.data);
        const billingAddresses = yield call (api.getBillingAddresses);
        yield put (actions.getBillingAddressSuccess({billingAddresses : billingAddresses.data}));
    }
    catch (error) {
        yield put (actions.updateBillingAddressFailure({error : error.response?.data || error.message}));
    }
}

function* deleteBillingAddress(action) {
    try {
            yield call(api.deleteBillingAddress, action.payload);
            console.log("Billing address deleted :",action.payload);
            const response = yield call(api.getBillingAddresses);

            yield put (actions.getBillingAddressSuccess({billingAddresses : response.data}));
    }
    catch (error) {
        yield put (actions.deleteBillingAddressFailure({error : error.response?.data || error.message}));
    }
}


function* watchGetBillingAddresses() {
    yield takeLatest(actions.actionsBillingAddress.GET_BILLING_ADDRESS_REQUEST, getBillingAddresses);
    yield takeLatest(actions.actionsBillingAddress.ADD_BILLING_ADDRESS_REQUEST, addBillingAddress);
    yield takeLatest(actions.actionsBillingAddress.UPDATE_BILLING_ADDRESS_REQUEST, updateBillingAddress);
    yield takeLatest(actions.actionsBillingAddress.DELETE_BILLING_ADDRESS_REQUEST, deleteBillingAddress);
}

function* billingAddressSaga() {
    yield fork(watchGetBillingAddresses);
}

export default billingAddressSaga;
