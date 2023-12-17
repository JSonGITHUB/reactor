import streams from '../../apis/streams.js';
import history from '../utils/history.js';
import { 
    CREATE_STREAM,
    FETCH_STREAM,
    FETCH_STREAMS,
    DELETE_STREAM,
    EDIT_STREAM
} from '../../actions/types';
export const createStream = formValues => async (dispatch, getState) => {
    const { userId } = getState().auth;
    const response = await streams.post('/streams', { ...formValues, userId });
    console.log(`history: ${JSON.stringify(history,null,2)}`)
    dispatch({ 
        type: CREATE_STREAM, 
        payload: response.data 
    });
    history.push('/reactor/streams');
    //history.push('/');
    window.location.href='/reactor/streams';
}
export const fetchStreams = () => async dispatch => {
    const response = await streams.get('/streams');
    dispatch({ 
        type: FETCH_STREAMS, 
        payload: response.data 
    });

}
export const fetchStream = (id) => async dispatch => {
    const response = await streams.get(`/streams/${id}`);
    dispatch({ 
        type: FETCH_STREAM, 
        payload: response.data 
    });
}
export const editStream = (id, formValues) => async dispatch => {
    const response = await streams.patch(`/streams/${id}`, formValues);
    dispatch({ 
        type: EDIT_STREAM, 
        payload: response.data 
    });
    history.push('/reactor/streams');
    window.location.href='/reactor/streams';
}
export const deleteStream = (id) => async dispatch => {
    await streams.delete(`/streams/${id}`);
    dispatch({ 
        type: DELETE_STREAM, 
        payload: id 
    });
    history.push('/reactor/streams');
    window.location.href='/reactor/streams';
}
