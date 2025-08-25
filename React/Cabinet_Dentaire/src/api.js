import axios from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_URL, // Assure-toi que .env contient VITE_URL
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor pour retourner directement data
http.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

export const api = {
  rendezvous: {
    async getAll() {
      try {
        return await http.get('/appointment'); // récupère tous les rendez-vous
      } catch (error) {
        if (error.response?.status === 404) {
          throw new Error('Rendez-vous non trouvés');
        }
        throw error;
      }
    },
    async create(newAppointment) {
      try {
        return await http.post('/appointment', newAppointment);
      } catch (error) {
        throw error;
      }
    },
  },
};
