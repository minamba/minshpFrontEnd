import {takeEvery, takeLatest, call, put, fork} from "redux-saga/effects";
import * as actions from "../actions/TaxeActions";
import * as api from "../api/taxes";



function* getTaxes() {
    try {
        const response = yield call (api.getTaxes);
        console.log("Taxes :",response.data);
        yield put (actions.getTaxeSuccess({taxes : response.data}));
    }
    catch (error) {
        yield put (actions.getTaxeFailure({error : error.response?.data || error.message}));
    }
}

function* addTaxe(action) {
    try {
        const response = yield call (api.addTaxe, action.payload);
        console.log("Taxe added :",response.data);
        const taxes = yield call (api.getTaxes);
        yield put (actions.getTaxeSuccess({taxes : taxes.data}));
    }
    catch (error) {
        yield put (actions.addTaxeFailure({error : error.response?.data || error.message}));
    }
}


function* updateTaxe(action) {
    try {
        const response = yield call (api.updateTaxe, action.payload);
        console.log("Taxe updated :",response.data);
        const taxes = yield call (api.getTaxes);
        yield put (actions.getTaxeSuccess({taxes : taxes.data}));
    }
    catch (error) {
        yield put (actions.updateTaxeFailure({error : error.response?.data || error.message}));
    }
}

function* deleteTaxe(action) {
    try {
            yield call(api.deleteTaxe, action.payload);
            const response = yield call(api.getTaxes);

            yield put (actions.getTaxeSuccess({taxes : response.data}));
    }
    catch (error) {
        yield put (actions.deleteTaxeFailure({error : error.response?.data || error.message}));
    }
}




function* watchGetTaxes() {
    yield takeLatest(actions.actionsTaxe.GET_TAXE_REQUEST, getTaxes);
}

function* watchAddTaxe() {
    yield takeLatest(actions.actionsTaxe.ADD_TAXE_REQUEST, addTaxe);
}

function* watchUpdateTaxe() {
    yield takeLatest(actions.actionsTaxe.UPDATE_TAXE_REQUEST, updateTaxe);
}

function* watchDeleteTaxe() {
    yield takeLatest(actions.actionsTaxe.DELETE_TAXE_REQUEST, deleteTaxe);
}

function* taxesSaga() {
    yield fork(watchGetTaxes);
    yield fork(watchAddTaxe);
    yield fork(watchUpdateTaxe);
    yield fork(watchDeleteTaxe);
}

export default taxesSaga;

