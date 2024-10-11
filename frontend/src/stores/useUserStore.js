import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: true,

  signup: async ({ name, email, password, confirmPassword }) => {
    set({ loading: true });

    if (password !== confirmPassword) {
      set({ loading: false });
      return toast.error("Passwords do not match");
    }
    try {
      const res = await axios.post("/auth/signup", {
        name,
        email,
        password,
        confirmPassword,
      });
      set({ loading: false, user: res.data });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.message || "An error occurred");
    }
  },

  login: async ({ email, password }) => {
    set({ loading: true });

    try {
      const res = await axios.post("/auth/login", { email, password });
      // console.log(res.data.role);
      set({ loading: false, user: res.data });
      toast.success("Logged in successfully");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.message || "An error occurred");
    }
  },

  checkAuth: async () => {
    set({ checkingAuth: true });
    try {
      const res = await axios.get("/auth/get-profile");
      set({ user: res.data, checkingAuth: false });
    } catch (error) {
      console.log("error in checkAuth ", error);
      set({ user: null, checkingAuth: false });
    }
  },

  logout: async () => {
    try {
      await axios.post("/auth/logout");
      set({ user: null });
      toast.success("Logged out successfully");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.message || "An error occurred");
    }
  },

  refreshToken: async () => {
    if (get().checkingAuth) return;
    try {
      const res = await axios.post("/auth/refresh-token");
      set({ checkingAuth: false });
      return res.data;
    } catch (error) {
      set({ user: null, checkingAuth: false });
      throw error;
    }
  },
}));

//TODO: implement the axios interceptors for refreshing the access token
//a security check we do underneath to check if the access token is expired without the user's knowledge
//to maintain the session
let refreshPromise = null;

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        //if a refresh is already in progress, wait for it to finish
        if (refreshPromise) {
          await refreshPromise;
          return axios(originalRequest);
        }

        //start a new refresh process
        refreshPromise = useUserStore.getState().refreshToken();
        await refreshPromise;
        refreshPromise = null;

        return axios(originalRequest);
      } catch (refreshError) {
        useUserStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
