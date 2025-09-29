// api.ts
import axios from "axios";

export const API = axios.create({
  baseURL: "http://192.168.1.44:5000", // your backend IP
  timeout: 10000,
});
