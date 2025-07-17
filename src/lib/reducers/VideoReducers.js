import { actionsVideo } from "../actions/VideoActions";

const initialState = {
    videos: [],
    addVideoSuccess: false,
    addVideoError: null,
    updateVideoSuccess: false,
    updateVideoError: null,
    deleteVideoSuccess: false,
    deleteVideoError: null,
    error: null,
}

export default function videoReducer(state = initialState, action) {
    switch (action.type) {

        case actionsVideo.GET_VIDEO_SUCCESS:
            return {
                ...state,
                videos: action.payload.videos,
            }

        case actionsVideo.ADD_VIDEO_SUCCESS:
            return {...state.videos, ...action.payload.video}
  

        case actionsVideo.UPDATE_VIDEO_SUCCESS:
            state.videos.map(video => {
                    if(video.id === action.payload.id)
                        return {...video, ...action.payload.video}
                    else
                        return video
                })

        case actionsVideo.DELETE_VIDEO_SUCCESS:
            return state.videos.filter(video => video.id !== action.payload.id)

        default:
            return state
    }
}