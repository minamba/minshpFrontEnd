// src/lib/sagas/shippingSaga.js
import { call, put, takeLatest, fork } from "redux-saga/effects";
import * as api from "../api/shipping"; // garde ton chemin
import {
  actionsShipping,
  getShippingRatesSuccess, getShippingRatesFailure,
  getRelaysSuccess, getRelaysFailure,
  createShipmentSuccess, createShipmentFailure,
  getRelaysByAddressSuccess, getRelaysByAddressFailure,
} from "../actions/ShippingActions";

function* getRatesWorker({ payload }) {
  try {
    const { data } = yield call(api.getRates, payload);
    console.log("getRatesWorker", data);
    yield put(getShippingRatesSuccess(data));
  } catch (e) {
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

function* createShipmentWorker({ payload: { orderId, body } }) {
  try {
    const { data } = yield call(api.createShipment, orderId, body);
    yield put(createShipmentSuccess(data));
  } catch (e) {
    yield put(createShipmentFailure(e?.message || "create shipment error"));
  }
}

function* getRelaysByAddressWorker({ payload }) {
  try {
    const { data } = yield call(api.getRelaysByAddress, payload);
    console.log("getRelaysByAddressWorker", data);
    yield put(getRelaysByAddressSuccess(data));
  } catch (e) {
    yield put(getRelaysByAddressFailure(e?.message || "relays by address error"));
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

export default function* shippingSaga() {
  yield fork(watchGetRates);
  yield fork(watchGetRelays);
  yield fork(watchCreateShipment);
  yield fork(watchGetRelaysByAddress);
}
