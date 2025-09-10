// src/lib/reducers/shippingReducer.js
import { actionsShipping } from "../actions/ShippingActions";

const initial = {
  rates: [],
  ratesLoading: false,
  ratesError: null,

  relays: [],
  relaysLoading: false,
  relaysError: null,

  relaysByAddress: [],
  relaysByAddressLoading: false,
  relaysByAddressError: null,

  shipment: null,
  shipmentLoading: false,
  shipmentError: null,

  contentCategories: [],
  contentCategoriesLoading: false,
  contentCategoriesError: null,
};

export default function shippingReducer(state = initial, action) {
  switch (action.type) {
    /** RATES **/
    case actionsShipping.GET_RATES_REQUEST:
      return { ...state, ratesLoading: true, ratesError: null };
    case actionsShipping.GET_RATES_SUCCESS:
      return { ...state, ratesLoading: false, rates: action.payload || [] };
    case actionsShipping.GET_RATES_FAILURE:
      return { ...state, ratesLoading: false, ratesError: action.payload, rates: [] };

    /** RELAYS **/
    case actionsShipping.GET_RELAYS_REQUEST:
      return { ...state, relaysLoading: true, relaysError: null };
    case actionsShipping.GET_RELAYS_SUCCESS:
      return { ...state, relaysLoading: false, relays: action.payload || [] };
    case actionsShipping.GET_RELAYS_FAILURE:
      return { ...state, relaysLoading: false, relaysError: action.payload, relays: [] };

    /** SHIPMENT **/
    case actionsShipping.CREATE_SHIPMENT_REQUEST:
      return { ...state, shipmentLoading: true, shipmentError: null };
    case actionsShipping.CREATE_SHIPMENT_SUCCESS:
      return { ...state, shipmentLoading: false, shipment: action.payload };
    case actionsShipping.CREATE_SHIPMENT_FAILURE:
      return { ...state, shipmentLoading: false, shipmentError: action.payload };

    /** RELAYS BY ADDRESS **/
    case actionsShipping.GET_RELAYS_BY_ADDRESS_REQUEST:
      return { ...state, relaysByAddressLoading: true, relaysByAddressError: null };
    case actionsShipping.GET_RELAYS_BY_ADDRESS_SUCCESS:
      return { ...state, relaysByAddressLoading: false, relaysByAddress: action.payload || [] };
    case actionsShipping.GET_RELAYS_BY_ADDRESS_FAILURE:
      return { ...state, relaysByAddressLoading: false, relaysByAddressError: action.payload, relaysByAddress: [] };

    /** CONTENT CATEGORY **/
    case actionsShipping.GET_CONTENT_CATEGORY_REQUEST:
      return { ...state, contentCategoriesLoading: true, contentCategoriesError: null };
    case actionsShipping.GET_CONTENT_CATEGORY_SUCCESS:
      return { ...state, contentCategoriesLoading: false, contentCategories: action.payload || [] };
    case actionsShipping.GET_CONTENT_CATEGORY_FAILURE:
      return { ...state, contentCategoriesLoading: false, contentCategoriesError: action.payload, contentCategories: [] };

    default:
      return state;
  }
}
