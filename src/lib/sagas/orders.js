import {takeEvery, takeLatest, call, put, fork} from "redux-saga/effects";
import * as actions from "../actions/OrderActions";
import * as api from "../api/orders";



function* onGetOrdersPaged(action) {
    try {
      const { page, pageSize, search, sort, filter } = action.payload || {};
      const response = yield call(api.getOrdersPaged, { page, pageSize, search, sort, filter });
      const data = response.data; // { items, totalCount, page, pageSize }
      console.log("Orders Paged :",data);
      yield put(
        actions.getOrderPagedUserSuccess({
          items: data.items || data.Items || [],
          totalCount: data.totalCount || data.TotalCount || 0,
          page: data.page || data.Page || page || 1,
          pageSize: data.pageSize || data.PageSize || pageSize || 20,
        })
      );
    } catch (err) {
      console.log("Error order paged :",err?.response?.data);
      yield put(actions.getOrderPagedUserFailure(err?.response?.data || err?.message || String(err)));
    }
  }



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


function* downloadInvoicePDF(action) {
    try {
      const orderId = action.payload;
      const res = yield call(api.downloadInvoice, orderId); // blob
  
      // Essayer de lire le nom de fichier depuis l'en-tête
      let filename = `invoice-${orderId}.pdf`;
      const dispo = res.headers?.["content-disposition"];
      if (dispo) {
        const match = /filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i.exec(dispo);
        if (match?.[1]) filename = decodeURIComponent(match[1]);
      }
  
      // Créer le blob et déclencher le téléchargement
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename; // force le save
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
  
      yield put(actions.downloadInvoiceSuccess(orderId));
    } catch (error) {
      yield put(
        actions.downloadInvoiceFailure(error?.response?.data || error?.message || "Erreur téléchargement")
      );
    }
  }


function* watchGetOrders() {
    yield takeLatest(actions.actionsOrder.GET_ORDER_REQUEST, getOrders);
    yield takeLatest(actions.actionsOrder.ADD_ORDER_REQUEST, addOrder);
    yield takeLatest(actions.actionsOrder.UPDATE_ORDER_REQUEST, updateOrder);
    yield takeLatest(actions.actionsOrder.DELETE_ORDER_REQUEST, deleteOrder);
    yield takeLatest(actions.actionsOrder.DOWNLOAD_ORDER_INVOICE_REQUEST, downloadInvoicePDF);
    yield takeLatest(actions.actionsOrder.GET_ORDER_PAGED_USER_REQUEST, onGetOrdersPaged);
}

function* ordersSaga() {
    yield fork(watchGetOrders);
}

export default ordersSaga;
