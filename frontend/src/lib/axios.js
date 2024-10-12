import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development" ? "http://localhost:8080/api" : "/", //to make it dynamic

  withCredentials: true, //allow to send cookies to the server
});

export default axiosInstance;
