// sagas/cartSaga.js
import { takeEvery, put } from 'redux-saga/effects';
import { actionsCart, addToCartSuccess, updateCartSuccess, deleteFromCartSuccess, saveCartSuccess } from '../actions/CartActions';
import { takeLatest, fork } from 'redux-saga/effects';

function* addToCartWorker(action) {
  // Ici pas d'appel API => on valide directement
  const { item, quantity } = action.payload;
  yield put(addToCartSuccess(item, quantity));
}

function* updateCartWorker(action) {
  const { item, quantity } = action.payload;
  yield put(updateCartSuccess(item, quantity));
}

function* deleteCartWorker(action) {
    const id = action.payload?.id ?? action.payload;
    yield put(deleteFromCartSuccess(id));
}

function* saveCartWorker(action) {
    const items = action.payload;
    yield put(saveCartSuccess(items));
}

function* watchAddToCart() {
    yield takeLatest(actionsCart.ADD_TO_CART_REQUEST, addToCartWorker);
    yield takeLatest(actionsCart.UPDATE_CART_REQUEST, updateCartWorker);
    yield takeLatest(actionsCart.DELETE_FROM_CART_REQUEST, deleteCartWorker);
    yield takeLatest(actionsCart.SAVE_CART_REQUEST, saveCartWorker);
}

function* cartSaga() {
    yield fork(watchAddToCart);
}

export default cartSaga;
