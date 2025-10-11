// featureCategoryReducer.js
import { actionsFeatureCategory } from "../actions/FeatureCategoryActions";

const initialState = {
  featureCategories: [],
  // ✅ map normalisée: { [productId]: FeatureCategory[] }
  featuresCategoryByProduct: {},
  addFeatureCategorySuccess: false,
  addFeatureCategoryError: null,
  updateFeatureCategorySuccess: false,
  updateFeatureCategoryError: null,
  deleteFeatureCategorySuccess: false,
  deleteFeatureCategoryError: null,
  loading: false,
  error: null,
};

export default function featureCategoryReducer(state = initialState, action) {
  switch (action.type) {
    /* ---------- clears ---------- */
    case actionsFeatureCategory.CLEAR_FEATURES_ALL:
      return {
        ...state,
        featuresCategoryByProduct: {}, // vide tout
      };

    case actionsFeatureCategory.CLEAR_FEATURES_FOR_PRODUCT: {
      const id = String(action.payload);
      const next = { ...(state.featuresCategoryByProduct || {}) };
      delete next[id];
      return { ...state, featuresCategoryByProduct: next };
    }

    /* ---------- get list ---------- */
    case actionsFeatureCategory.GET_FEATURE_CATEGORY_REQUEST:
      return { ...state, loading: true, error: null };

    case actionsFeatureCategory.GET_FEATURE_CATEGORY_SUCCESS:
      // payload attendu: { featureCategories: [...] }
      return {
        ...state,
        loading: false,
        featureCategories: action.payload?.featureCategories ?? [],
      };

    case actionsFeatureCategory.GET_FEATURE_CATEGORY_FAILURE:
      return { ...state, loading: false, error: action.payload };

    /* ---------- add ---------- */
    case actionsFeatureCategory.ADD_FEATURE_CATEGORY_REQUEST:
      return { ...state, addFeatureCategorySuccess: false, addFeatureCategoryError: null };

    case actionsFeatureCategory.ADD_FEATURE_CATEGORY_SUCCESS:
      return {
        ...state,
        featureCategories: [
          ...state.featureCategories,
          action.payload?.featureCategory,
        ],
        addFeatureCategorySuccess: true,
      };

    case actionsFeatureCategory.ADD_FEATURE_CATEGORY_FAILURE:
      return { ...state, addFeatureCategoryError: action.payload, addFeatureCategorySuccess: false };

    /* ---------- update ---------- */
    case actionsFeatureCategory.UPDATE_FEATURE_CATEGORY_REQUEST:
      return { ...state, updateFeatureCategorySuccess: false, updateFeatureCategoryError: null };

    case actionsFeatureCategory.UPDATE_FEATURE_CATEGORY_SUCCESS:
      return {
        ...state,
        featureCategories: state.featureCategories.map(fc =>
          fc.id === action.payload?.id
            ? { ...fc, ...(action.payload?.featureCategory || {}) }
            : fc
        ),
        updateFeatureCategorySuccess: true,
      };

    case actionsFeatureCategory.UPDATE_FEATURE_CATEGORY_FAILURE:
      return { ...state, updateFeatureCategoryError: action.payload, updateFeatureCategorySuccess: false };

    /* ---------- delete ---------- */
    case actionsFeatureCategory.DELETE_FEATURE_CATEGORY_REQUEST:
      return { ...state, deleteFeatureCategorySuccess: false, deleteFeatureCategoryError: null };

    case actionsFeatureCategory.DELETE_FEATURE_CATEGORY_SUCCESS:
      return {
        ...state,
        featureCategories: state.featureCategories.filter(fc => fc.id !== action.payload?.id),
        deleteFeatureCategorySuccess: true,
      };

    case actionsFeatureCategory.DELETE_FEATURE_CATEGORY_FAILURE:
      return { ...state, deleteFeatureCategoryError: action.payload, deleteFeatureCategorySuccess: false };

    /* ---------- get by product (clé du fix) ---------- */
    case actionsFeatureCategory.GET_FEATURE_CATEGORY_BY_PRODUCT_REQUEST:
      return { ...state, loading: true, error: null };

    case actionsFeatureCategory.GET_FEATURE_CATEGORY_BY_PRODUCT_SUCCESS: {
      const { productId, features } = action.payload || {};
      const pid = String(productId);
      return {
        ...state,
        loading: false,
        featuresCategoryByProduct: {
          ...(state.featuresCategoryByProduct || {}),
          [pid]: Array.isArray(features) ? features : [],
        },
      };
    }

    case actionsFeatureCategory.GET_FEATURE_CATEGORY_BY_PRODUCT_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}
