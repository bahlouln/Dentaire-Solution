import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./ListePatients.module.css";

const ListePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: ""
  });
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  // 🔹 Récupérer les patients du dentiste connecté
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/patients/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatients(res.data.patients); // <- correction ici
      } catch (error) {
        console.error("Erreur lors de la récupération des patients :", error);
        setErrorMsg("Impossible de récupérer les patients.");
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  // 🔹 Supprimer un patient
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce patient ?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/patients/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatients(patients.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      setErrorMsg("Impossible de supprimer le patient.");
    }
  };

  // 🔹 Préparer la modification
  const handleEdit = (patient) => {
    setEditingId(patient.id);
    setFormData({
      nom: patient.nom || "",
      prenom: patient.prenom || "",
      email: patient.email || "",
      telephone: patient.telephone || "",
    });
  };

  // 🔹 Sauvegarder la modification
  const handleUpdate = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/patients/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatients(patients.map((p) =>
        p.id === id ? { ...p, ...formData } : p
      ));
      setEditingId(null);
      setErrorMsg("");
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      setErrorMsg("Impossible de mettre à jour le patient.");
    }
  };

  // 🔹 Redirection vers le formulaire d'ajout
  const handleAddPatient = () => {
    navigate("/add-patient");
  };

  if (loading) return <p className={styles.loading}>Chargement...</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Liste des patients</h2>
      {errorMsg && <p className={styles.error}>{errorMsg}</p>}
      <button className={styles.addBtn} onClick={handleAddPatient}>
        Ajouter Patient
      </button>
      {patients.length === 0 ? (
        <p>Aucun patient trouvé.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Supprimer</th>
              <th>Modifier</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id}>
                <td>
                  {editingId === p.id ? (
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) =>
                        setFormData({ ...formData, nom: e.target.value })
                      }
                      className={styles.input}
                    />
                  ) : (
                    p.nom
                  )}
                </td>
                <td>
                  {editingId === p.id ? (
                    <input
                      type="text"
                      value={formData.prenom}
                      onChange={(e) =>
                        setFormData({ ...formData, prenom: e.target.value })
                      }
                      className={styles.input}
                    />
                  ) : (
                    p.prenom
                  )}
                </td>
                <td>
                  {editingId === p.id ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className={styles.input}
                    />
                  ) : (
                    p.email
                  )}
                </td>
                <td>
                  {editingId === p.id ? (
                    <input
                      type="text"
                      value={formData.telephone}
                      onChange={(e) =>
                        setFormData({ ...formData, telephone: e.target.value })
                      }
                      className={styles.input}
                    />
                  ) : (
                    p.telephone
                  )}
                </td>
                <td>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(p.id)}
                  >
                    Supprimer
                  </button>
                </td>
                <td>
                  {editingId === p.id ? (
                    <div className={styles.buttonGroup}>
                      <button
                        className={styles.updateBtn}
                        onClick={() => handleUpdate(p.id)}
                      >
                        Sauvegarder
                      </button>
                      <button
                        className={styles.cancelBtn}
                        onClick={() => setEditingId(null)}
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button
                      className={styles.updateBtn}
                      onClick={() => handleEdit(p)}
                    >
                      Modifier
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ListePatients;
