import { actionsStripe } from "../actions/StripeActions";


const initialState = {
    // Création de session
    creatingSession: false,
    sessionId: null,
    publishableKey: null,
    createError: null,
  
    // Confirmation (succès Stripe)
    confirming: false,
    confirmed: false,
    orderId: null,
    orderNumber: null,
    shipmentId: null,
    trackingNumber: null,
    confirmError: null,
  };
  
  export default function StripeReducer(state = initialState, action) {
    switch (action.type) {
      // --- Create Checkout Session ---
      case actionsStripe.CREATE_CHECKOUT_SESSION_REQUEST:
        return {
          ...state,
          creatingSession: true,
          createError: null,
          // on reset d’anciennes confirmations au cas où
          confirming: false,
          confirmed: false,
          confirmError: null,
        };
  
      case actionsStripe.CREATE_CHECKOUT_SESSION_SUCCESS:
        return {
          ...state,
          creatingSession: false,
          createError: null,
          // sessionId: action.sessionId || null,
          // publishableKey: action.publishableKey || null,
        };
  
      case actionsStripe.CREATE_CHECKOUT_SESSION_FAILURE:
        return {
          ...state,
          creatingSession: false,
          createError: action.payload || "Erreur Stripe",
        };
  
      // --- Confirm Checkout (depuis page /success ou via webhook feedback) ---
      case actionsStripe.CONFIRM_CHECKOUT_REQUEST:
        return {
          ...state,
          confirming: true,
          confirmed: false,
          confirmError: null,
          sessionId: action.payload || null,
          // on peut garder les anciens IDs si tu veux afficher “en cours…”
        };
  
        case actionsStripe.CONFIRM_CHECKOUT_SUCCESS:
          return {
            ...state,
            confirming: false,
            confirmed: true,
            confirmError: null,
            orderId: action.payload?.orderId ?? null,
            orderNumber: action.payload?.orderNumber ?? null,
            shipmentId: action.payload?.shipmentId ?? null,
            trackingNumber: action.payload?.trackingNumber ?? null,
            sessionId: null,
          };
  
      case actionsStripe.CONFIRM_CHECKOUT_FAILURE:
        return {
          ...state,
          confirming: false,
          confirmed: false,
          confirmError: action.payload || "Erreur de confirmation",
        };
  
      default:
        return state;
    }
  }
  