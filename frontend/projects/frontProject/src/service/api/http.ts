import axios, { type AxiosError } from "axios";

const http = axios.create({
  baseURL: "http://10.20.30.34:8080",
  timeout: 30000,
  withCredentials: false,
});

export default http;
