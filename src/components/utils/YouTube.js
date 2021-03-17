import axios from "axios";

const KEY = ''

export default axios.create({
    baseURL: 'https://www.googleapis.com/youtube/v3',
    timeout: 1000,
    params: {
      part: 'snippet', 
      type: 'video',
      maxResults: 5,
      key: KEY
  }
});