import {takeEvery, takeLatest, call, put, fork} from "redux-saga/effects";
import * as actions from "../actions/CustomerActions";
import * as api from "../api/customers";

function* getCustomers() {
    try {
        const response = yield call (api.getCustomers);
        console.log("Customers :",response.data);
        yield put (actions.getCustomerSuccess({customers : response.data}));
    }
    catch (error) {
        yield put (actions.getCustomerFailure({error : error.response?.data || error.message}));
    }
}

function* addCustomer(action) {
    try {
        const response = yield call (api.addCustomer, action.payload);
        console.log("Customer added :",response.data);
        const customers = yield call (api.getCustomers);
        yield put (actions.getCustomerSuccess({customers : customers.data}));
    }
    catch (error) {
        yield put (actions.addCustomerFailure({error : error.response?.data || error.message}));
    }
}

function* updateCustomer(action) {
    try {
        const response = yield call (api.updateCustomer, action.payload);
        console.log("Customer updated :",response.data);
        const customers = yield call (api.getCustomers);
        yield put (actions.getCustomerSuccess({customers : customers.data}));
    }
    catch (error) {
        yield put (actions.updateCustomerFailure({error : error.response?.data || error.message}));
    }
}

function* deleteCustomer(action) {
    try {
            yield call(api.deleteCustomer, action.payload);
            console.log("Customer deleted :",action.payload);
            const response = yield call(api.getCustomers);

            yield put (actions.getCustomerSuccess({customers : response.data}));
    }
    catch (error) {
        yield put (actions.deleteCustomerFailure({error : error.response?.data || error.message}));
    }
}


function* watchGetCustomers() {
    yield takeLatest(actions.actionsCustomer.GET_CUSTOMER_REQUEST, getCustomers);
    yield takeLatest(actions.actionsCustomer.ADD_CUSTOMER_REQUEST, addCustomer);
    yield takeLatest(actions.actionsCustomer.UPDATE_CUSTOMER_REQUEST, updateCustomer);
    yield takeLatest(actions.actionsCustomer.DELETE_CUSTOMER_REQUEST, deleteCustomer);
}

function* customersSaga() {
    yield fork(watchGetCustomers);
}

export default customersSaga;
