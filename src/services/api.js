// src/services/api.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Change this to your computer's IP when testing on device
const API_URL = "http://172.20.10.2:3000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("userToken");
    console.log(
      "[api] REQUEST",
      config.method?.toUpperCase(),
      config.url,
      "token:",
      token ? "YES" : "NO"
    );
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log(
      "[api] RESPONSE ERROR:",
      error.response?.status,
      error.response?.data?.message
    );
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data) => api.put("/auth/profile", data),
};

// Workout API
export const workoutAPI = {
  getAll: () => api.get("/workouts"),
  getOne: (id) => api.get(`/workouts/${id}`),
  create: (data) => api.post("/workouts", data),
  update: (id, data) => api.put(`/workouts/${id}`, data),
  delete: (id) => api.delete(`/workouts/${id}`),
  getStats: () => api.get("/workouts/stats/summary"),
};

// Goal API
export const goalAPI = {
  getAll: () => api.get("/goals"),
  create: (data) => api.post("/goals", data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
};

// External Exercise API (ExerciseDB from RapidAPI)
// Note: You need to sign up for a free API key at https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb
const EXERCISE_API_KEY = "your-rapidapi-key-here";

export const exerciseAPI = {
  searchExercises: async (query) => {
    try {
      const response = await axios.get(
        `https://exercisedb.p.rapidapi.com/exercises/name/${query}`,
        {
          headers: {
            "X-RapidAPI-Key": EXERCISE_API_KEY,
            "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Exercise API error:", error);
      return [];
    }
  },
};

export default api;
