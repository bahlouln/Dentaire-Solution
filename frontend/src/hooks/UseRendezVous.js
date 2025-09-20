import { useState, useEffect } from "react";
import axios from "axios";

export function UseRendezVous() {
  const [appointment, setAppointment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRendezVous() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/rendezvous", {
          headers: { Authorization: `Bearer ${token}` }, // 🔑 token pour auth
        });

        console.log("Données reçues du backend :", res.data);
        setAppointment(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRendezVous();
  }, []);

  return { appointment, loading, error };
}
