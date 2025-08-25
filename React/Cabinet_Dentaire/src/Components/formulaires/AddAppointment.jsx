import  { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api";
import styles from "./AddAppointment.module.css"; // import du CSS module

function AddAppointmentForm() {
  const { date } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    Nom: "",
    Prenom: "",
    Tel: "",
    Date_Debut: date ? date + "T08:00" : "",
    Date_Fin: date ? date + "T09:00" : "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.rendezvous.create(formData);
      navigate("/"); // retour au calendrier après création
    } catch (err) {
      alert("Erreur lors de la création : " + err.message);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Nouveau Rendez-vous</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input type="text" name="Nom" placeholder="Nom" value={formData.Nom} onChange={handleChange} required />
        <input type="text" name="Prenom" placeholder="Prénom" value={formData.Prenom} onChange={handleChange} required />
        <input type="tel" name="Tel" placeholder="Téléphone" value={formData.Tel} onChange={handleChange} required />
        <label>Date & Heure Début</label>
        <input type="datetime-local" name="Date_Debut" value={formData.Date_Debut} onChange={handleChange} required />
        <label>Date & Heure Fin</label>
        <input type="datetime-local" name="Date_Fin" value={formData.Date_Fin} onChange={handleChange} required />
        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button type="submit">Créer</button>
          <button type="button" onClick={() => navigate("/")}>Annuler</button>
        </div>
      </form>
    </div>
  );
}

export default AddAppointmentForm;
