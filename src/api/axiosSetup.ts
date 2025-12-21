import axios from "axios";
import { getToken } from "../auth";

axios.interceptors.request.use(
  (config) => {
    const token = getToken();

    console.log("axios interceptor token:", token);

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
