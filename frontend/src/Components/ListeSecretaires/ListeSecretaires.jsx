import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./ListeSecretaires.module.css";

const ListeSecretaires = () => {
  const [secretaires, setSecretaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nom: "", email: "" });
  const navigate = useNavigate();

  // Charger secrétaires
  useEffect(() => {
    fetchSecretaires();
  }, []);

  const fetchSecretaires = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/secretaires/dentiste", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSecretaires(res.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des secrétaires:", error);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette secrétaire ?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/secretaires/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSecretaires(secretaires.filter((sec) => sec.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  // Activer édition
  const handleEdit = (sec) => {
    setEditingId(sec.id);
    setFormData({
      nom: sec.User?.nom || "",
      email: sec.User?.email || "",
    });
  };

  // Sauvegarder update
  const handleUpdate = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/secretaires/${id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Mettre à jour la liste localement
      setSecretaires(secretaires.map((sec) =>
        sec.id === id ? { ...sec, User: { ...sec.User, ...formData } } : sec
      ));

      setEditingId(null); // fermer le formulaire
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
    }
  };

  // Ajouter une secrétaire
  const handleAddSecretary = () => {
    navigate("/add-secretary");
  };

  if (loading) return <p className={styles.loading}>Chargement...</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Liste des secrétaires</h2>
      <button
        className={styles.addBtn}
        onClick={handleAddSecretary}
      >
        Ajouter Secrétaire
      </button>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Supprimer</th>
            <th>Modifier</th>
          </tr>
        </thead>
        <tbody>
          {secretaires.map((sec) => (
            <tr key={sec.id}>
              <td>
                {editingId === sec.id ? (
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className={styles.input}
                  />
                ) : (
                  sec.User?.nom
                )}
              </td>
              <td>
                {editingId === sec.id ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={styles.input}
                  />
                ) : (
                  sec.User?.email
                )}
              </td>
              <td>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(sec.id)}
                >
                  Supprimer
                </button>
              </td>
              <td>
                {editingId === sec.id ? (
                  <div className={styles.buttonGroup}>
                    <button
                      className={styles.updateBtn}
                      onClick={() => handleUpdate(sec.id)}
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
                    onClick={() => handleEdit(sec)}
                  >
                    Modifier
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListeSecretaires;