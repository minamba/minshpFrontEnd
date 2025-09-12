import {takeEvery, takeLatest, call, put, fork} from "redux-saga/effects";
import * as actions from "../actions/InvoiceActions";
import * as api from "../api/invoices";

function* getInvoices() {
    try {
        const response = yield call (api.getInvoices);
        console.log("Invoices :",response.data);
        yield put (actions.getInvoiceSuccess({invoices : response.data}));
    }
    catch (error) {
        yield put (actions.getInvoiceFailure({error : error.response?.data || error.message}));
    }
}

function* addInvoice(action) {
    try {
        const response = yield call (api.addInvoice, action.payload);
        console.log("Invoice added :",response.data);
        const invoices = yield call (api.getInvoices);
        yield put (actions.getInvoiceSuccess({invoices : invoices.data}));
    }
    catch (error) {
        yield put (actions.addInvoiceFailure({error : error.response?.data || error.message}));
    }
}

function* updateInvoice(action) {
    try {
        const response = yield call (api.updateInvoice, action.payload);
        console.log("Invoice updated :",response.data);
        const invoices = yield call (api.getInvoices);
        yield put (actions.getInvoiceSuccess({invoices : invoices.data}));
    }
    catch (error) {
        yield put (actions.updateInvoiceFailure({error : error.response?.data || error.message}));
    }
}

function* deleteInvoice(action) {
    try {
            yield call(api.deleteInvoice, action.payload);
            console.log("Invoice deleted :",action.payload);
            const response = yield call(api.getInvoices);

            yield put (actions.getInvoiceSuccess({invoices : response.data}));
    }
    catch (error) {
        yield put (actions.deleteInvoiceFailure({error : error.response?.data || error.message}));
    }
}


function* watchGetInvoices() {
    yield takeLatest(actions.actionsInvoice.GET_INVOICE_REQUEST, getInvoices);
    yield takeLatest(actions.actionsInvoice.ADD_INVOICE_REQUEST, addInvoice);
    yield takeLatest(actions.actionsInvoice.UPDATE_INVOICE_REQUEST, updateInvoice);
    yield takeLatest(actions.actionsInvoice.DELETE_INVOICE_REQUEST, deleteInvoice);
}

function* invoicesSaga() {
    yield fork(watchGetInvoices);
}

export default invoicesSaga;
