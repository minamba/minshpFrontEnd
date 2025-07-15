import {takeEvery, takeLatest, call, put, fork} from "redux-saga/effects";
import * as actions from "../actions/ProductActions";
import * as api from "../api/products";



function* getProducts() {
    try {
        const response = yield call (api.getProducts);
        console.log(response.data);
        yield put (actions.getProductUserSuccess({products : response.data}));
    }
    catch (error) {
        yield put (actions.getProductUserFailure({error : error.response?.data || error.message}));
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

// function* updateProduct(action) {
//     try {
//         const response = yield call (api.updateProduct, action.payload);
//         yield put (actions.updateProductUserSuccess({product : response.data}));
//     }
//     catch (error) {
//         yield put (actions.updateProductUserFailure({error : error.response?.data || error.message}));
//     }
// }

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




function* watchGetProducts() {
    yield takeLatest(actions.actionsProduct.GET_PRODUCT_USER_REQUEST, getProducts);
}

// function* watchAddProduct() {
//     yield takeEvery(actions.addProductUserRequest, addProduct);
// }

// function* watchUpdateProduct() {
//     yield takeEvery(actions.updateProductUserRequest, updateProduct);
// }

// function* watchDeleteProduct() {
//     yield takeEvery(actions.deleteProductUserRequest, deleteProduct);
// }

function* productsSaga() {
    yield fork(watchGetProducts);
    // yield fork(watchAddProduct);
    // yield fork(watchUpdateProduct);
    // yield fork(watchDeleteProduct);
}

export default productsSaga;

