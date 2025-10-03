import axios from "axios";

const API = axios.create({
  baseURL: "http://192.168.1.47:5000", 
  timeout: 10000,
});

// export const getUserById = (id: string) => {
//   return API.get(`/user/${id}`);
// };


export const getUserById = async (id: string, token: string) => {
  try {
    const res = await API.get(`/user/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res;   // normal Axios response
  } catch (err: any) {
    // Log for debugging
    console.error("getUserById error:", err.response?.status, err.response?.data);

    // Return a consistent error object instead of throwing
    return {
      data: {
        success: false,
        message: err.response?.data?.message || "Failed to fetch user",
      },
      status: err.response?.status || 500,
    };
  }
};
