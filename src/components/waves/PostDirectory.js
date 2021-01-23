/* backup pre hooks 1/7/21
import React, { useState, useEffect } from 'react';
const PostDirectory = () => {

    const [postDirectory, setPostDirectory] = useState(localStorage.getItem("postDirectory") === null) ? [] : JSON.parse(localStorage.getItem("postDirectory"));        
    const [uniquePosts, setUniquePosts] = useState([...new Set(postDirectory)]);
    const [index, setIndex] = useState(uniquePosts.indexOf(null));
    if (index > -1) {
        setUniquePosts(uniquePosts.splice(index, 1));
    }
    localStorage.setItem("postDirectory", JSON.stringify(uniquePosts));
    
    useEffect(() => {
        setPostDirectory(uniquePosts);
    }, []);

    const getDirectory = () => postDirectory;
    const removeLastId = () => setPostDirectory(postDirectory.pop());

    const deleteLast = () => {
         console.log(`PostDirectory => deleteLast()`)
         setPostDirectory(removeLastId());
         localStorage.setItem("postDirectory", JSON.stringify(postDirectory))
     }
     const add = (id) => {
         console.log(`PostDirectory => add(${id})`);
         const pDirectory = postDirectory;
         pDirectory.push(id)
         setPostDirectory(pDirectory);
         localStorage.setItem("postDirectory", JSON.stringify(pDirectory))
     }
     
     const getLastIndex = () => Number(postDirectory.length-1);
     const getLastId = () => postDirectory[getLastIndex()];
     const get2ndToLastId = () => postDirectory[getLastIndex()-1];
     const getStorageItem = (id) => localStorage.getItem(id)
     const getLastItem = () => (localStorage.getItem(getLastId()) === null) ? JSON.parse(getStorageItem(get2ndToLastId())) : JSON.parse(getStorageItem(getLastId()));
     
     return <p>Count: {postDirectory.length}</p> 
     
 }
 export default PostDirectory;

*/
import React from 'react';
class PostDirectory extends React.Component {

    constructor(props) {
        super(props);
        this.postDirectory = (localStorage.getItem("postDirectory") === null) ? [] : JSON.parse(localStorage.getItem("postDirectory"));        
        this.uniquePosts = [...new Set(this.postDirectory)];
        const index = this.uniquePosts.indexOf(null);
        if (index > -1) {
            this.uniquePosts.splice(index, 1);
        }
        localStorage.setItem("postDirectory", JSON.stringify(this.uniquePosts))
        this.state = {
            postDirectory: this.uniquePosts,
        };
    }
    
     getDirectory = () => this.postDirectory;
     removeLastId = () => this.postDirectory.pop();
     deleteLast = () => {
         console.log(`PostDirectory => deleteLast()`)
         this.postDirectory = this.removeLastId();
         localStorage.setItem("postDirectory", JSON.stringify(this.postDirectory))
         this.setState({
             postDirectory: this.postDirectory
         }); 
     }
     add = (id) => {
         console.log(`PostDirectory => add(${id})`);
         this.postDirectory.push(id);
         localStorage.setItem("postDirectory", JSON.stringify(this.postDirectory))
     }
     delete = (id) => {
         console.log(`PostDirectory => delete(${id})`)
         const index = this.postDirectory.indexOf(String(id));
         console.log(`${index} of ${this.postDirectory.length}`)
         this.postDirectory.splice(index, 1);
         console.log(`${index} of ${this.postDirectory.length}`)
         localStorage.setItem("postDirectory", JSON.stringify(this.postDirectory))
         localStorage.removeItem(id);
         localStorage.setItem("lastPostId", `${this.postDirectory[this.postDirectory.length-1]}`);
         this.setState({
             postDirectory: this.postDirectory
         });
     }
     getLastIndex = () => Number(this.state.postDirectory.length-1);
     getLastId = () => this.state.postDirectory[this.getLastIndex()];
     get2ndToLastId = () => this.state.postDirectory[this.getLastIndex()-1];
     getStorageItem = (id) => localStorage.getItem(id)
     getLastItem = () => (localStorage.getItem(this.getLastId()) === null) ? JSON.parse(this.getStorageItem(this.get2ndToLastId())) : JSON.parse(this.getStorageItem(this.getLastId()));
     render() {      
             return <p>Count: {this.state.postDirectory.length}</p> 
     }
     
 }
 export default PostDirectory;