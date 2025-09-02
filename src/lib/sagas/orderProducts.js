import {takeEvery, takeLatest, call, put, fork} from "redux-saga/effects";
import * as actions from "../actions/OrderCustomerProductActions";
import * as actionsOrders from "../actions/OrderActions";
import * as api from "../api/orderPorudcts";
import * as apiOrders from "../api/orders";

function* getOrderProducts() {
    try {
        const response = yield call (api.getOrderProducts);
        console.log("Orders products :",response.data);
        yield put (actions.getOrderCustomerProductSuccess({orderProducts : response.data}));
    }
    catch (error) {
        yield put (actions.getOrderCustomerProductFailure({error : error.response?.data || error.message}));
    }
}

function* addOrderProduct(action) {
    try {
        const response = yield call (api.addOrderProduct, action.payload);
        console.log("Order product added :",response.data);
        const orderProducts = yield call (api.getOrderProducts);
        yield put (actions.getOrderCustomerProductSuccess({orderProducts : orderProducts.data}));
        const orders = yield call (apiOrders.getOrders);
        yield put (actionsOrders.getOrderSuccess({orders : orders.data}));
    }
    catch (error) {
        yield put (actions.addOrderCustomerProductFailure({error : error.response?.data || error.message}));
    }
}

function* updateOrderProduct(action) {
    try {
        const response = yield call (api.updateOrderProduct, action.payload);
        console.log("Order product updated :",response.data);
        const orderProducts = yield call (api.getOrderProducts);
        yield put (actions.getOrderCustomerProductSuccess({orderProducts : orderProducts.data}));
        const orders = yield call (apiOrders.getOrders);
        yield put (actionsOrders.getOrderSuccess({orders : orders.data}));
    }
    catch (error) {
        yield put (actions.updateOrderCustomerProductFailure({error : error.response?.data || error.message}));
    }
}

function* deleteOrderProduct(action) {
    try {
            yield call(api.deleteOrderProduct, action.payload);
            console.log("Order product deleted :",action.payload);
            const response = yield call(api.getOrderProducts);

            yield put (actions.getOrderCustomerProductSuccess({orderProducts : response.data}));
            const orders = yield call (apiOrders.getOrders);
            yield put (actionsOrders.getOrderSuccess({orders : orders.data}));
    }
    catch (error) {
        yield put (actions.deleteOrderCustomerProductFailure({error : error.response?.data || error.message}));
    }
}


function* watchGetProductOrders() {
    yield takeLatest(actions.actionsOrderCustomerProduct.GET_ORDER_CUSTOMER_PRODUCT_REQUEST, getOrderProducts);
    yield takeLatest(actions.actionsOrderCustomerProduct.ADD_ORDER_CUSTOMER_PRODUCT_REQUEST, addOrderProduct);
    yield takeLatest(actions.actionsOrderCustomerProduct.UPDATE_ORDER_CUSTOMER_PRODUCT_REQUEST, updateOrderProduct);
    yield takeLatest(actions.actionsOrderCustomerProduct.DELETE_ORDER_CUSTOMER_PRODUCT_REQUEST, deleteOrderProduct);
}

function* orderProductsSaga() {
    yield fork(watchGetProductOrders);
}

export default orderProductsSaga;
