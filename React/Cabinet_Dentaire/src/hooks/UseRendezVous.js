import { useState, useEffect } from "react";
import { api } from "../api";

export function UseRendezVous() {
  const [appointment, setAppointment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRendezVous() {
      try {
        const data = await api.rendezvous.getAll();
        console.log("Données reçues du backend :", data);
        setAppointment(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRendezVous();
  }, []);

  return { appointment, loading, error };
}
