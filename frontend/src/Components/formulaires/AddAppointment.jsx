import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./AddAppointment.module.css";

function AddAppointmentForm() {
  const { date } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    patientId: "",
    dentisteId: "",
    dateDebut: date ? date + "T08:00" : "",
    dateFin: date ? date + "T09:00" : "",
    note: "",
  });

  const [patients, setPatients] = useState([]);
  const [dentistes, setDentistes] = useState([]);

  // Charger patients et dentistes depuis le backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, dentistesRes] = await Promise.all([
          axios.get("http://localhost:5000/patients"),
          axios.get("http://localhost:5000/dentistes"),
        ]);
        setPatients(patientsRes.data);
        setDentistes(dentistesRes.data);
      } catch (err) {
        alert("Erreur lors du chargement des données");
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/rendezvous", formData);
      navigate("/"); // retour au calendrier
    } catch (err) {
      alert("Erreur lors de la création : " + err.message);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Nouveau Rendez-vous</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        
        <label>Patient</label>
        <select name="patientId" value={formData.patientId} onChange={handleChange} required>
          <option value="">-- Choisir un patient --</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>
          ))}
        </select>

        <label>Dentiste</label>
        <select name="dentisteId" value={formData.dentisteId} onChange={handleChange} required>
          <option value="">-- Choisir un dentiste --</option>
          {dentistes.map((d) => (
            <option key={d.id} value={d.id}>{d.nom} {d.prenom}</option>
          ))}
        </select>

        <label>Date & Heure Début</label>
        <input type="datetime-local" name="dateDebut" value={formData.dateDebut} onChange={handleChange} required />

        <label>Date & Heure Fin</label>
        <input type="datetime-local" name="dateFin" value={formData.dateFin} onChange={handleChange} required />

        <label>Note (optionnel)</label>
        <textarea name="note" value={formData.note} onChange={handleChange} />

        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button type="submit">Créer</button>
          <button type="button" onClick={() => navigate("/")}>Annuler</button>
        </div>
      </form>
    </div>
  );
}

export default AddAppointmentForm;
