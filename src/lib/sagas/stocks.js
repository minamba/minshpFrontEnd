import {takeEvery, takeLatest, call, put, fork} from "redux-saga/effects";
import * as actions from "../actions/StockActions";
import * as api from "../api/stocks";



function* getStocks() {
    try {
        const response = yield call (api.getStocks);
        console.log("Stocks :",response.data);
        yield put (actions.getStockSuccess({stocks : response.data}));
    }
    catch (error) {
        yield put (actions.getStockFailure({error : error.response?.data || error.message}));
    }
}

function* addStock(action) {
    try {
        const response = yield call (api.addStock, action.payload);
        console.log("Stock added :",response.data);
        const stocks = yield call (api.getStocks);
        yield put (actions.getStockSuccess({stocks : stocks.data}));
    }
    catch (error) {
        yield put (actions.addStockFailure({error : error.response?.data || error.message}));
    }
}


function* updateStock(action) {
    try {
        const response = yield call (api.updateStock, action.payload);
        console.log("Stock updated :",response.data);
        const stocks = yield call (api.getStocks);
        yield put (actions.getStockSuccess({stocks : stocks.data}));
    }
    catch (error) {
        yield put (actions.updateStockFailure({error : error.response?.data || error.message}));
    }
}

function* deleteStock(action) {
    try {
            yield call(api.deleteStock, action.payload);
            const response = yield call(api.getStocks);

            yield put (actions.getStockSuccess({stocks : response.data}));
    }
    catch (error) {
        yield put (actions.deleteStockFailure({error : error.response?.data || error.message}));
    }
}




function* watchGetStocks() {
    yield takeLatest(actions.actionsStock.GET_STOCK_REQUEST, getStocks);
}

function* watchAddStock() {
    yield takeLatest(actions.actionsStock.ADD_STOCK_REQUEST, addStock);
}

function* watchUpdateStock() {
    yield takeLatest(actions.actionsStock.UPDATE_STOCK_REQUEST, updateStock);
}

function* watchDeleteStock() {
    yield takeLatest(actions.actionsStock.DELETE_STOCK_REQUEST, deleteStock);
}

function* stocksSaga() {
    yield fork(watchGetStocks);
    yield fork(watchAddStock);
    yield fork(watchUpdateStock);
    yield fork(watchDeleteStock);
}

export default stocksSaga;

