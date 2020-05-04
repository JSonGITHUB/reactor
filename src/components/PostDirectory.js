import React from 'react';
class PostDirectory extends React.Component {

    constructor(props) {
        super(props);
        this.postDirectory = (localStorage.getItem("postDirectory") === null) ? [] : JSON.parse(localStorage.getItem("postDirectory"));        
        this.uniquePosts = [...new Set(this.postDirectory)];
        localStorage.setItem("postDirectory", JSON.stringify(this.uniquePosts))
        this.state = {
            postDirectory: this.uniquePosts,

        };
    }
    /*
    postssssss=>[
        "ThuApr3020209:17:44PM",
        "ThuApr3020209:19:28PM",
        "FriMay0120207:10:29PM",
        "SunMay03202012:59:02PM",
        "SunMay0320201:04:32PM"
      ]
      */
    
    getDirectory = () => this.postDirectory;
    removeLastId = () => this.postDirectory.pop();
    deleteLast = () => {
        this.postDirectory = this.removeLastId();
        localStorage.setItem("postDirectory", JSON.stringify(this.postDirectory))
        this.setState({
            postDirectory: this.postDirectory
        }); 
    }
    add = (id) => {
        this.postDirectory.push(id);
        localStorage.setItem("postDirectory", JSON.stringify(this.postDirectory))
        this.setState({
            postDirectory: this.postDirectory
        });
    }
    delete = (id) => {
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
    getLastItem = () => (localStorage.getItem(this.getLastId()) === null) ? this.getStorageItem(this.get2ndToLastId()) : this.getStorageItem(this.getLastId());
    render() {      
            return <p>Count: {this.state.postDirectory.length}</p> 
    }
    
}
export default PostDirectory;