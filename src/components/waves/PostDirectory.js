import { useState, useEffect } from 'react';
import initializeData from '../utils/InitializeData';

const PostDirectory = () => {

    const localPostDirectory = initializeData('postDirectory', []);
    const [postDirectory, setPostDirectory] = useState(localPostDirectory);

    useEffect(() => {
        localStorage.setItem('postDirectory', JSON.stringify(postDirectory));
    }, [postDirectory]);

    const getLastIndex = () => Number(postDirectory.length - 1);
    const getLastId = () => {
        const lastId = postDirectory[getLastIndex()];
        console.log(`PostDirectory => getLastId: ${lastId}`);
        return lastId;
    }
    const get2ndToLastId = () => postDirectory[getLastIndex() - 1];
    const getPost = (id) => initializeData(id, null);
    const getLastPost = () => {
        const lastPost = (initializeData(getLastId(), null) === null) 
                            ? getPost(get2ndToLastId()) 
                            : getPost(getLastId());
        console.log(`PostDirectory => getLastPost: ${JSON.stringify(lastPost,null,2)}`);
        return lastPost;
    }

    console.log(`PostDirectory => getLastId: ${getLastId()}`);

    const addPost = (id, post) => {
        const newPost = JSON.stringify(post);
        localStorage.setItem(id, newPost);
        const postExists = postDirectory.includes(id);
        if (!postExists) {
            console.log(`PostDirectory => add(${id})`);
            const newPostDirectory = [...postDirectory];
            newPostDirectory.push(id);
            setPostDirectory(newPostDirectory);
        }
    }

    const savePost = (id, post) => {
        const newPost = JSON.stringify(post);
        localStorage.setItem(id, newPost);
        console.log(`PostDirectory => save(${id})`);
    }

    const deletePost = (id) => {
        const newPostDirectory = [...postDirectory];
        const index = newPostDirectory.indexOf(String(id));
        newPostDirectory.splice(index, 1);
        localStorage.removeItem(id);
        localStorage.setItem('lastPostId', `${newPostDirectory[getLastIndex()]}`);
        setPostDirectory(newPostDirectory);
    }

    const deleteLast = () => {
        const newPostDirectory = [...postDirectory];
        newPostDirectory.pop();
        setPostDirectory(newPostDirectory);
    }

    return [postDirectory, setPostDirectory, getPost, getLastIndex, getLastPost, addPost, savePost, deletePost, deleteLast];
};

export default PostDirectory;