import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    // import.meta.mode === "development" ? "http://localhost:8080/api" : "/", //to make it dynamic
    "http://localhost:8080/api",
  withCredentials: true, //allow to send cookies to the server
});

export default axiosInstance;
