// src/lib/sagas/customers.js
import { takeLatest, call, put, fork, select, delay } from "redux-saga/effects";
import * as actions from "../actions/CustomerActions";
import * as api from "../api/customers";

/* --- Critères courants stockés dans le slice --- */
const selectPaging = (s) =>
  s?.customers?.paging || { page: 1, pageSize: 10, search: "", sort: "LastName:asc", filter: {} };

/* --- Mapper uniforme --- */
const mapPaged = (data) => ({
  items: data?.items ?? data?.Items ?? [],
  totalCount: data?.totalCount ?? data?.TotalCount ?? 0,
  page: data?.page ?? data?.Page ?? 1,
  pageSize: data?.pageSize ?? data?.PageSize ?? 10,
});

/* --- GET paginé --- */
function* onGetCustomersPaged(action) {
  try {
    const prev = yield select(selectPaging);
    const req  = { ...prev, ...(action?.payload || {}) };
    const { data } = yield call(api.getCustomersPaged, req);
    yield put(actions.getPagedCustomerSuccess({ ...mapPaged(data), paging: req }));
  } catch (err) {
    yield put(actions.getPagedCustomerFailure(err?.response?.data || err?.message || String(err)));
  }
}

/* --- GET plein (non paginé) --- */
function* getCustomers() {
  try {
    const { data } = yield call(api.getCustomers);
    yield put(actions.getCustomerSuccess({ customers: data }));
  } catch (error) {
    yield put(actions.getCustomerFailure({ error: error?.response?.data || error?.message }));
  }
}

/* --- Utilitaire post-mutation: re-fetch plein + paginé (double) --- */
function* refreshAfterMutation() {
  const paging = yield select(selectPaging);
  yield put(actions.getCustomerRequest());                // plein
  yield put(actions.getPagedCustomerRequest(paging));     // paginé #1
  yield delay(400);                                       // petite latence DB/Index
  yield put(actions.getPagedCustomerRequest(paging));     // paginé #2
}

/* --- ADD --- */
function* addCustomer(action) {
  try {
    yield call(api.addCustomer, action.payload);
    yield* refreshAfterMutation();
  } catch (error) {
    yield put(actions.addCustomerFailure({ error: error?.response?.data || error?.message }));
  }
}

/* --- UPDATE --- */
function* updateCustomer(action) {
  try {
    yield call(api.updateCustomer, action.payload);
    const response = yield call (api.getCustomers);
    yield put (actions.getCustomerSuccess({customers : response.data}));
  } catch (error) {
    yield put(actions.updateCustomerFailure({ error: error?.response?.data || error?.message }));
  }
}

/* --- DELETE --- */
function* deleteCustomer(action) {
  try {
    // Assure-toi d’envoyer l’identifiant attendu par ton API (id numérique, etc.)
    yield call(api.deleteCustomer, action.payload);
    yield* refreshAfterMutation();
  } catch (error) {
    yield put(actions.deleteCustomerFailure({ error: error?.response?.data || error?.message }));
  }
}

/* --- Watchers --- */
function* watchCustomers() {
  yield takeLatest(actions.actionsCustomer.GET_CUSTOMER_REQUEST, getCustomers);               // plein
  yield takeLatest(actions.actionsCustomer.GET_PAGED_CUSTOMER_REQUEST, onGetCustomersPaged);  // paginé
  yield takeLatest(actions.actionsCustomer.ADD_CUSTOMER_REQUEST, addCustomer);
  yield takeLatest(actions.actionsCustomer.UPDATE_CUSTOMER_REQUEST, updateCustomer);
  yield takeLatest(actions.actionsCustomer.DELETE_CUSTOMER_REQUEST, deleteCustomer);
}

export default function* customersSaga() {
  yield fork(watchCustomers);
}
