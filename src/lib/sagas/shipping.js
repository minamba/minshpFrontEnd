// src/lib/sagas/shippingSaga.js
import { call, put, takeLatest, fork } from "redux-saga/effects";
import * as api from "../api/shipping"; // garde ton chemin
import * as apiOrder from "../api/orders";
import * as actionsOrder from "../actions/OrderActions";
import {
  actionsShipping,
  getShippingRatesSuccess, getShippingRatesFailure,
  getRelaysSuccess, getRelaysFailure,
  createShipmentSuccess, createShipmentFailure,
  getRelaysByAddressSuccess, getRelaysByAddressFailure,
  getContentCategorySuccess, getContentCategoryFailure,
} from "../actions/ShippingActions";

function* getRatesWorker({ payload }) {
  try {
    const { data } = yield call(api.getRates, payload); 
    console.log("getRatesWorker", data); 
    yield put(getShippingRatesSuccess(data));  
  } catch (e) {
    console.log("error : getRatesWorker", e);
    yield put(getShippingRatesFailure(e?.message || "rates error"));
  } 
}

function* getRelaysWorker({ payload }) {
  try {
    const { data } = yield call(api.getRelays, payload);
    console.log("getRelaysWorker", data);
    yield put(getRelaysSuccess(data));
  } catch (e) {
    yield put(getRelaysFailure(e?.message || "relays error"));
  }
}

function* createShipmentWorker(action) {
  try {
    const { data } = yield call(api.createShipment, action.payload);
    console.log("createShipmentWorker", data);
    yield put(createShipmentSuccess(data));
    const orders = yield call (apiOrder.getOrders);
    yield put (actionsOrder.getOrderSuccess({orders : orders.data}));
  } catch (e) {
    console.log("error : createShipmentWorker", e);
    yield put(createShipmentFailure(e?.message || "create shipment error"));
  }
}

function* getRelaysByAddressWorker({ payload }) {
  try {
    const { data } = yield call(api.getRelaysByAddress, payload);
    console.log("getRelaysByAddressWorker", data);
    yield put(getRelaysByAddressSuccess(data));
  } catch (e) {
    console.log("error : getRelaysByAddressWorker", e);
    yield put(getRelaysByAddressFailure(e?.message || "relays by address error"));
  }
}

function* getContentCategoryWorker({ payload }) {
  try {
    const { data } = yield call(api.getContentCategory, payload);
    console.log("getContentCategoryWorker", data);
    yield put(getContentCategorySuccess(data));
  } catch (e) {
    yield put(getContentCategoryFailure(e?.message || "content category error"));
  }
}

function* watchGetRates() {
  yield takeLatest(actionsShipping.GET_RATES_REQUEST, getRatesWorker);
}
function* watchGetRelays() {
  yield takeLatest(actionsShipping.GET_RELAYS_REQUEST, getRelaysWorker);
}
function* watchCreateShipment() {
  yield takeLatest(actionsShipping.CREATE_SHIPMENT_REQUEST, createShipmentWorker);
}
function* watchGetRelaysByAddress() {
  yield takeLatest(actionsShipping.GET_RELAYS_BY_ADDRESS_REQUEST, getRelaysByAddressWorker);
}
function* watchGetContentCategory() {
  yield takeLatest(actionsShipping.GET_CONTENT_CATEGORY_REQUEST, getContentCategoryWorker);
}

export default function* shippingSaga() {
  yield fork(watchGetRates);
  yield fork(watchGetRelays);
  yield fork(watchCreateShipment);
  yield fork(watchGetRelaysByAddress);
  yield fork(watchGetContentCategory);
}
