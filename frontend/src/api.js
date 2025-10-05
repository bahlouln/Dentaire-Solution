// src/api/api.js
import axios from "axios";

const http = axios.create({
    baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_URL || "http://localhost:5000",
    timeout: 10000,
    headers: { "Content-Type": "application/json" },
});

// Injecte token (depuis localStorage ou autre storage)
http.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Simplifie les réponses → retourne response.data
http.interceptors.response.use(
    (res) => res.data,
    (err) => Promise.reject(err)
);

// Groupes d’endpoints
export const api = {
    auth: {
        logout() {
            localStorage.removeItem("token");
        },
    },

    admin: {
        dentistes: {
            list() {
                return http.get("/api/admin/dentistes", );
            },
            update(id, payload) {
                return http.put(`/api/admin/dentistes/${id}`, payload);
            },
            remove(id) {
                return http.delete(`/api/admin/dentistes/${id}`);
            },
            create(payload) {
                return http.post(`/api/admin/dentistes`, payload);
            },
        },
    },
    
    rendezvous: {
        getAll() {
            return http.get("/rendezvous");
        },
        create(newAppointment) {
            return http.post("/rendezvous", newAppointment);
        },
        delete(id) {
            return http.delete(`/rendezvous/${id}`);
        },
    },
};

export default api;
