import { actionsRole } from "../actions/RoleActions";

const initialState = {
    roles: [],
    error: null,
}

export default function roleReducer(state = initialState, action) {
    switch (action.type) {

        case actionsRole.GET_ROLE_SUCCESS:
            return {
                ...state,
                roles: action.payload.roles,
            }

        case actionsRole.GET_ROLE_FAILURE:
            return {
                ...state,
                error: action.payload.error,
            }

        default:
            return state
    }
}