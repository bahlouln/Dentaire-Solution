import { useState } from "react";
import styles from "./RegisterDentiste.module.css";
import { FaUser, FaEnvelope, FaLock, FaUserTag } from "react-icons/fa";
import axios from "axios";
function RegisterDentiste() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    motDePasse: "",
    role: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await axios.post("http://localhost:5000/auth/register", {
      nom: formData.nom,
      email: formData.email,
      motDePasse: formData.password, 
      role: formData.role || "dentiste",
    });

    alert("✅ Inscription réussie !");
    console.log("Utilisateur créé :", response.data);

    window.location.href = "/login-dentiste";
  } catch (err) {
    console.error(err.response?.data || err.message);
    alert("❌ Erreur : " + (err.response?.data?.message || "Serveur injoignable"));
  }
};

  return (
    <div className={styles.bgImg}>
      <div className={styles.content}>
        <header>Inscription Dentiste/Secretaire</header>
        <form onSubmit={handleSubmit}>
          
          {/* Champ Nom */}
          <div className={styles.field}>
            <FaUser className={styles.icon} />
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
              placeholder="Nom complet"
            />
          </div>

          {/* Champ Email */}
          <div className={styles.field}>
            <FaEnvelope className={styles.icon} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Email"
            />
          </div>

          {/* Champ Mot de passe */}
          <div className={`${styles.field} ${styles.space}`}>
            <FaLock className={styles.icon} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Mot de passe"
            />
            <span className={styles.show} onClick={togglePassword}>
              {showPassword ? "HIDE" : "SHOW"}
            </span>
          </div>

          {/* Champ Rôle */}
          <div className={`${styles.field} ${styles.space}`}>
            <FaUserTag className={styles.icon} />
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              placeholder="Rôle (dentiste ou secretaire)"
            />
          </div>

          {/* Bouton submit */}
          <div className={styles.field}>
            <input type="submit" value="REGISTER" />
          </div>
        </form>

        <div className={styles.signup}>
          Déjà un compte ? <a href="/login-dentiste">Se connecter</a>
        </div>
      </div>
    </div>
  );
}

export default RegisterDentiste;
