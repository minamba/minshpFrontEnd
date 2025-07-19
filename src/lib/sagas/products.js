import {takeEvery, takeLatest, call, put, fork} from "redux-saga/effects";
import * as actions from "../actions/ProductActions";
import * as api from "../api/products";



function* getProducts() {
    try {
        const response = yield call (api.getProducts);
        console.log("Products :",response.data);
        yield put (actions.getProductUserSuccess({products : response.data}));
    }
    catch (error) {
        yield put (actions.getProductUserFailure({error : error.response?.data || error.message}));
    }
}

function* addProduct(action) {
    try {
        const response = yield call (api.addProduct, action.payload);
        console.log("Product added :",response.data);
        yield put (actions.addProductUserSuccess({product : response.data}));
    }
    catch (error) {
        yield put (actions.addProductUserFailure({error : error.response?.data || error.message}));
    }
}

function* updateProduct(action) {
    try {
        const response = yield call (api.updateProduct, action.payload);
        console.log("Product updated :",response.data);
        const products = yield call (api.getProducts);
        yield put (actions.getProductUserSuccess({product : products.data}));
        yield put (actions.updateProductUserSuccess({product : response.data}));
    }
    catch (error) {
        yield put (actions.updateProductUserFailure({error : error.response?.data || error.message}));
    }
}

function* deleteProduct(action) {
    try {
            yield call(api.deleteProduct, action.payload);
            console.log("Product deleted :",action.payload);
            const response = yield call(api.getProducts);

            yield put (actions.getProductUserSuccess({products : response.data}));
    }
    catch (error) {
        yield put (actions.deleteProductUserFailure({error : error.response?.data || error.message}));
    }
}




function* watchGetProducts() {
    yield takeLatest(actions.actionsProduct.GET_PRODUCT_USER_REQUEST, getProducts);
}

function* watchAddProduct() {
    yield takeLatest(actions.actionsProduct.ADD_PRODUCT_USER_REQUEST, addProduct);
}

function* watchUpdateProduct() {
    yield takeLatest(actions.actionsProduct.UPDATE_PRODUCT_USER_REQUEST, updateProduct);
}

function* watchDeleteProduct() {
    yield takeLatest(actions.actionsProduct.DELETE_PRODUCT_USER_REQUEST, deleteProduct);
}

function* productsSaga() {
    yield fork(watchGetProducts);
    yield fork(watchAddProduct);
    yield fork(watchUpdateProduct);
    yield fork(watchDeleteProduct);
}

export default productsSaga;

