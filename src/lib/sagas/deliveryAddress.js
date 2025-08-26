import {takeEvery, takeLatest, call, put, fork} from "redux-saga/effects";
import * as actions from "../actions/DeliveryAddressActions";
import * as api from "../api/deliveryAddress";

function* getDeliveryAddresses() {
    try {
        const response = yield call (api.getDeliveryAddresses);
        console.log("Delivery addresses :",response.data);
        yield put (actions.getDeliveryAddressSuccess({deliveryAddresses : response.data}));
    }
    catch (error) {
        yield put (actions.getDeliveryAddressFailure({error : error.response?.data || error.message}));
    }
}

function* addDeliveryAddress(action) {
    try {
        const response = yield call (api.addDeliveryAddress, action.payload);
        console.log("Delivery address added :",response.data);
        const deliveryAddresses = yield call (api.getDeliveryAddresses);
        yield put (actions.getDeliveryAddressSuccess({deliveryAddresses : deliveryAddresses.data}));
    }
    catch (error) {
        yield put (actions.addDeliveryAddressFailure({error : error.response?.data || error.message}));
    }
}

function* updateDeliveryAddress(action) {
    try {
        const response = yield call (api.updateDeliveryAddress, action.payload);
        console.log("Delivery address updated :",response.data);
        const deliveryAddresses = yield call (api.getDeliveryAddresses);
        yield put (actions.getDeliveryAddressSuccess({deliveryAddresses : deliveryAddresses.data}));
    }
    catch (error) {
        yield put (actions.updateDeliveryAddressFailure({error : error.response?.data || error.message}));
    }
}

function* deleteDeliveryAddress(action) {
    try {
            yield call(api.deleteDeliveryAddress, action.payload);
            console.log("Delivery address deleted :",action.payload);
            const response = yield call(api.getDeliveryAddresses);

            yield put (actions.getDeliveryAddressSuccess({deliveryAddresses : response.data}));
    }
    catch (error) {
        yield put (actions.deleteDeliveryAddressFailure({error : error.response?.data || error.message}));
    }
}


function* watchGetDeliveryAddresses() {
    yield takeLatest(actions.actionsDeliveryAddress.GET_DELIVERY_ADDRESS_REQUEST, getDeliveryAddresses);
    yield takeLatest(actions.actionsDeliveryAddress.ADD_DELIVERY_ADDRESS_REQUEST, addDeliveryAddress);
    yield takeLatest(actions.actionsDeliveryAddress.UPDATE_DELIVERY_ADDRESS_REQUEST, updateDeliveryAddress);
    yield takeLatest(actions.actionsDeliveryAddress.DELETE_DELIVERY_ADDRESS_REQUEST, deleteDeliveryAddress);
}

function* deliveryAddressSaga() {
    yield fork(watchGetDeliveryAddresses);
}

export default deliveryAddressSaga;
