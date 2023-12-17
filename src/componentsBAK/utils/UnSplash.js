import axios from "axios";
import config from '../apis/config';

const KEY = config.unsplashAPI_KEY;

export default axios.create({
  baseURL: config.unsplashAPI_BASE_URL,
  timeout: 1000,
  params: {
      key: KEY
  }
});