import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./AjouterSecretaire.module.css";

const AjouterSecretaire = () => {
  const [formData, setFormData] = useState({ nom: "", email: "", motDePasse: "", bureau: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/secretaires",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Secrétaire ajoutée avec succès !");
      setTimeout(() => navigate("/ListeSecretaires"), 1500); // Retour après 1.5s
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'ajout de la secrétaire");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Ajouter une Secrétaire</h2>
      {success && <p className={styles.success}>{success}</p>}
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="nom">Nom</label>
          <input
            type="text"
            id="nom"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="motDePasse">Mot de Passe</label>
          <input
            type="password"
            id="motDePasse"
            name="motDePasse"
            value={formData.motDePasse}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="bureau">Bureau (facultatif)</label>
          <input
            type="text"
            id="bureau"
            name="bureau"
            value={formData.bureau}
            onChange={handleChange}
            className={styles.input}
          />
        </div>
        <button type="submit" className={styles.submitBtn}>
          Ajouter
        </button>
      </form>
    </div>
  );
};

export default AjouterSecretaire;