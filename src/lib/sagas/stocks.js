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

// function* addProduct(action) {
//     try {
//         const response = yield call (api.addProduct, action.payload);
//         yield put (actions.addProductUserSuccess({product : response.data}));
//     }
//     catch (error) {
//         yield put (actions.addProductUserFailure({error : error.response?.data || error.message}));
//     }
// }

function* updateStock(action) {
    try {
        const response = yield call (api.updateStock, action.payload);
        console.log("Stock updated :",response.data);
        const stocks = yield call (api.getStocks);
        yield put (actions.getStockSuccess({stock : stocks.data}));
        yield put (actions.updateStockSuccess({stock : response.data}));
    }
    catch (error) {
        yield put (actions.updateStockFailure({error : error.response?.data || error.message}));
    }
}

// function* deleteProduct(action) {
//     try {
//             yield call(api.deleteProduct, action.payload);
//             const response = yield call(api.getProducts);

//             yield put (actions.getProductUserSuccess({products : response.data}));
//     }
//     catch (error) {
//         yield put (actions.deleteProductUserFailure({error : error.response?.data || error.message}));
//     }
// }




function* watchGetStocks() {
    yield takeLatest(actions.actionsStock.GET_STOCK_REQUEST, getStocks);
}

// function* watchAddProduct() {
//     yield takeLatest(actions.addProductUserRequest, addProduct);
// }

function* watchUpdateStock() {
    yield takeLatest(actions.actionsStock.UPDATE_STOCK_REQUEST, updateStock);
}

// function* watchDeleteProduct() {
//     yield takeLatest(actions.deleteProductUserRequest, deleteProduct);
// }

function* stocksSaga() {
    yield fork(watchGetStocks);
    // yield fork(watchAddProduct);
     yield fork(watchUpdateStock);
    // yield fork(watchDeleteProduct);
}

export default stocksSaga;

