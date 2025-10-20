import {takeEvery, takeLatest, call, put, fork} from "redux-saga/effects";
import * as actions from "../actions/ProductActions";
import * as actionsStocks from "../actions/StockActions";
import * as api from "../api/products";
import * as apiStocks from "../api/stocks";


function* onGetProductsPaged(action) {
    try {
      const { page, pageSize, search, sort, filter } = action.payload || {};
      const response = yield call(api.getProductsPaged, { page, pageSize, search, sort, filter });
      const data = response.data; // { items, totalCount, page, pageSize }
      console.log("Products Paged :",data);
      yield put(
        actions.getProductsPagedUserSuccess({
          items: data.items || data.Items || [],
          totalCount: data.totalCount || data.TotalCount || 0,
          page: data.page || data.Page || page || 1,
          pageSize: data.pageSize || data.PageSize || pageSize || 20,
        })
      );
  
      const stocks = yield call (apiStocks.getStocks);
      yield put (actionsStocks.getStockSuccess({stocks : stocks.data}));
    } catch (err) {
      console.log("Error product paged :",err?.response?.data);
      yield put(actions.getProductsPagedUserFailure(err?.response?.data || err?.message || String(err)));
    }
  }



function* getProducts() {
    try {
        const response = yield call (api.getProducts);
        console.log("full Products from saga :",response.data);
        yield put (actions.getProductUserSuccess({products : response.data}));
        const stocks = yield call (apiStocks.getStocks);
        yield put (actionsStocks.getStockSuccess({stocks : stocks.data}));
    }
    catch (error) {
        yield put (actions.getProductUserFailure({error : error.response?.data || error.message}));
    }
}


function* addProduct(action) {
  try {
    const response = yield call(api.addProduct, action.payload);
    yield put(actions.addProductUserSuccess({ product: response.data }));

    // (optionnel) rafraîchir les stocks
    const stocks = yield call(apiStocks.getStocks);
    yield put(actionsStocks.getStockSuccess({ stocks: stocks.data }));
  } catch (error) {
    yield put(actions.addProductUserFailure({ error: error.response?.data || error.message }));
  }
}

function* updateProduct(action) {
  try {
    const response = yield call(api.updateProduct, action.payload);
    // ✅ on émet bien le SUCCESS d’update
    yield put(actions.updateProductUserSuccess({ product: response.data }));

    // (optionnel) rafraîchir les stocks
    const stocks = yield call(apiStocks.getStocks);
    yield put(actionsStocks.getStockSuccess({ stocks: stocks.data }));
  } catch (error) {
    yield put(actions.updateProductUserFailure({ error: error.response?.data || error.message }));
  }
}

function* deleteProduct(action) {
  try {
    yield call(api.deleteProduct, action.payload);
    // ✅ on émet bien le SUCCESS de delete
    yield put(actions.deleteProductUserSuccess(action.payload));
  } catch (error) {
    yield put(actions.deleteProductUserFailure({ error: error.response?.data || error.message }));
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

function* watchGetProductsPaged() {
    yield takeLatest(actions.actionsProduct.GET_PRODUCT_PAGED_USER_REQUEST, onGetProductsPaged);
}

function* productsSaga() {
    yield fork(watchGetProducts);
    yield fork(watchAddProduct);
    yield fork(watchUpdateProduct);
    yield fork(watchDeleteProduct);
    yield fork(watchGetProductsPaged);
}

export default productsSaga;

