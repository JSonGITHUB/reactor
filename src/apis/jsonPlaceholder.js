import axios from 'axios';

const baseURL = 'https://jsonplaceholder.typicode.com';

export default axios.create({
  baseURL: baseURL,
  timeout: 1000
});