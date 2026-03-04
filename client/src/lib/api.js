import axios from "axios";
import { toast } from "sonner";
import { store } from "@/redux/store";
import { signOut } from "@/redux/user/userSlice";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor — show toast on errors, auto-redirect on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    const status = error.response?.status;

    if (status === 401) {
      store.dispatch(signOut());
      window.location.href = "/sign-in";
      toast.error("Session expired. Please sign in again.");
    } else if (status === 429) {
      toast.error("Too many requests. Please slow down.");
    } else if (status !== undefined) {
      // Show error toast for all server errors (400, 403, 404, 500, etc.)
      toast.error(message);
    } else {
      // Network/connection error
      toast.error("Network error. Please check your connection.");
    }

    return Promise.reject(error);
  }
);

export default api;
