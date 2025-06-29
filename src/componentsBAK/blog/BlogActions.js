import _ from 'lodash';
import jsonPlaceholder from '../../apis/jsonPlaceholder.js';

const fetchPostsAndUsers = () => async (dispatch, getState) => {
    await dispatch(fetchPosts());

    //const userIds = _.uniq(_.map(getState().posts, 'userId'));
    //userIds.forEach(id => dispatch(fetchUser(id)))

    _.chain(getState().posts)
        .map('userId')
        .uniq()
        .forEach(id => dispatch(fetchUser(id)))
        .value();
    
} 

const fetchPosts = () => async dispatch => {
    const response = await jsonPlaceholder.get('/posts');
    //console.log(`BlogActions => FETCH_POSTS => fetchPosts => \nresponse: ${JSON.stringify(response.data,null,2)}`);
    dispatch({ 
        type: 'FETCH_POSTS', 
        payload: response.data
    })
};

const fetchUser = id => async dispatch => {
    const response = await jsonPlaceholder.get(`/users/${id}`);
    dispatch({
        type: 'FETCH_USER', 
        payload: response.data
    });
}

/*
const fetchUser = id => dispatch => _fetchUser(id, dispatch);
const _fetchUser = _.memoize(async (id, dispatch) => {
    const response = await jsonPlaceholder.get(`/users/${id}`);
    dispatch({
        type: 'FETCH_USER', 
        payload: response.data
    });
});
*/

export { fetchPosts, fetchUser, fetchPostsAndUsers }