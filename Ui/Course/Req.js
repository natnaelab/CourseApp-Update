import axios from "axios";

// const BaseURL = "http://localhost:8000/api"
// const BaseURL = "https://courseapi-one.vercel.app/api"
const BaseURL = "https://course-app-api-one.vercel.app/api"
const Req = axios.create({
  baseURL: BaseURL,
  withCredentials: true, // Ensures cookies are sent with requests
});

export default Req;

