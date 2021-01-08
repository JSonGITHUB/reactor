import axios from "axios";
import { unsplashAPI_KEY, unsplashAPI_BASE_URL } from '../../apis/config';


const KEY = unsplashAPI_KEY;

export default axios.create({
  baseURL: unsplashAPI_BASE_URL,
  params: {
      key: KEY
  }
});