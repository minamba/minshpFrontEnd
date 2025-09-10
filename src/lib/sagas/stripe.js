import {takeEvery, takeLatest, call, put, fork} from "redux-saga/effects";
import * as actions from "../actions/StripeActions";
import * as api from "../api/stripe";
import { loadStripe } from "@stripe/stripe-js";


function* createCheckoutSession(action) {
    try {
      const response = yield call(api.createCheckoutSession, action.payload);
      console.log("Stripe session created:", response.data);
  
      const { sessionId, publishableKey } = response.data || {};
      if (!sessionId || !publishableKey) {
        throw new Error("Réponse Stripe invalide: sessionId/publishableKey manquants");
      }
  
      const stripe = yield call(loadStripe, publishableKey);
      const { error } = yield call([stripe, stripe.redirectToCheckout], { sessionId });
      if (error) throw error;
  
      yield put(actions.actionsStripe.CREATE_CHECKOUT_SESSION_SUCCESS());
    } catch (error) {
      yield put(
        actions.actionsStripe.CREATE_CHECKOUT_SESSION_FAILURE({
          error: error?.response?.data || error.message,
        })
      );
    }
  }
  
  /**
   * Confirme la session après redirection de Stripe (page /success).
   * action.sessionId attendu : string
   * Le backend vérifie le paiement et crée commande + expédition.
   */
  function* confirmCheckout(action) {
    try {
      const response = yield call(api.confirmCheckout, action.sessionId);
      console.log("Stripe confirm result:", response.data);
  
      yield put(
        actions.actionsStripe.CONFIRM_CHECKOUT_SUCCESS({
          orderId: response.data?.orderId,
          orderNumber: response.data?.orderNumber,
          shipmentId: response.data?.shipmentId,
          trackingNumber: response.data?.trackingNumber,
        })
      );
    } catch (error) {
      yield put(
        actions.actionsStripe.CONFIRM_CHECKOUT_FAILURE({
          error: error?.response?.data || error.message,
        })
      );
    }
  }
  
  /* ==================== WATCHERS ==================== */
  
  function* watchCreateCheckoutSession() {
    yield takeLatest(
      actions.actionsStripe.CREATE_CHECKOUT_SESSION_REQUEST,
      createCheckoutSession
    );
  }
  
  function* watchConfirmCheckout() {
    yield takeLatest(
      actions.actionsStripe.CONFIRM_CHECKOUT_REQUEST,
      confirmCheckout
    );
  }
  
  /* ==================== ROOT SAGA ==================== */
  
  function* stripeSaga() {
    yield fork(watchCreateCheckoutSession);
    yield fork(watchConfirmCheckout);
  }
  
  export default stripeSaga;