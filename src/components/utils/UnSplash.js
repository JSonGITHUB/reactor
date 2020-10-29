import axios from "axios";

const KEY = 'Client-ID LV6VY88M75l5IvWUJp5aKDIBpB1bI97YIr8PW3h_bas'

export default axios.create({
  baseURL: "https://api.unsplash.com/search/photos",
  params: {
      key: KEY
  }
});