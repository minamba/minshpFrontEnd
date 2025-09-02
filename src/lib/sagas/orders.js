import {takeEvery, takeLatest, call, put, fork} from "redux-saga/effects";
import * as actions from "../actions/OrderActions";
import * as api from "../api/orders";

function* getOrders() {
    try {
        const response = yield call (api.getOrders);
        console.log("Orders :",response.data);
        yield put (actions.getOrderSuccess({orders : response.data}));
    }
    catch (error) {
        yield put (actions.getOrderFailure({error : error.response?.data || error.message}));
    }
}

function* addOrder(action) {
    try {
        const response = yield call (api.addOrder, action.payload);
        console.log("Order added :",response.data);
        const orders = yield call (api.getOrders);
        yield put (actions.getOrderSuccess({orders : orders.data}));
    }
    catch (error) {
        yield put (actions.addOrderFailure({error : error.response?.data || error.message}));
    }
}

function* updateOrder(action) {
    try {
        const response = yield call (api.updateOrder, action.payload);
        console.log("Order updated :",response.data);
        const orders = yield call (api.getOrders);
        yield put (actions.getOrderSuccess({orders : orders.data}));
    }
    catch (error) {
        yield put (actions.updateOrderFailure({error : error.response?.data || error.message}));
    }
}

function* deleteOrder(action) {
    try {
            yield call(api.deleteOrder, action.payload);
            console.log("Order deleted :",action.payload);
            const response = yield call(api.getOrders);

            yield put (actions.getOrderSuccess({orders : response.data}));
    }
    catch (error) {
        yield put (actions.deleteOrderFailure({error : error.response?.data || error.message}));
    }
}


function* watchGetOrders() {
    yield takeLatest(actions.actionsOrder.GET_ORDER_REQUEST, getOrders);
    yield takeLatest(actions.actionsOrder.ADD_ORDER_REQUEST, addOrder);
    yield takeLatest(actions.actionsOrder.UPDATE_ORDER_REQUEST, updateOrder);
    yield takeLatest(actions.actionsOrder.DELETE_ORDER_REQUEST, deleteOrder);
}

function* ordersSaga() {
    yield fork(watchGetOrders);
}

export default ordersSaga;
