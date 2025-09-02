import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_URL || "http://localhost:5000", 
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

// ✅ Interceptor pour ajouter le token dynamiquement
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// ✅ Interceptor pour retourner directement response.data
http.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

export const api = {
  rendezvous: {
    async getAll() {
      return await http.get("/appointment"); // ✅ cohérent avec backend
    },
    async create(newAppointment) {
      return await http.post("/appointment", newAppointment);
    },
    async delete(id) {
      return await http.delete(`/appointment/${id}`); // ✅ corrigé
    },
  },
};
