import { actions } from '../actions/UploadActions';

const initialState = {
    uploadSucceded: false,
    uploadFailed: false
}

 
function UploadReducer(state = initialState, action) {
    switch (action.type) {
        case actions.POST_UPLOAD_SUCCESS:
            return {
                ...state,
                uploadSucceded: true
            }
        case actions.POST_UPLOAD_FAILURE:
            return {
                ...state,
                uploadFailed: true
            }

        case "HIDE_POPUP":
            return {
                ...state,
                uploadSucceded: false,
                uploadFailed: false
            }
        default:
            return state
    }
}

export default UploadReducer
