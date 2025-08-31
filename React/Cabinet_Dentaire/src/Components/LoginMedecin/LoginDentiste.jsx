import { useState } from "react";
import styles from "./LoginDentiste.module.css";
import { FaUser, FaLock, FaFacebookF, FaInstagram } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LoginDentiste() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    motDePasse: "", // ⚠️ le backend attend `motDePasse`
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/auth/login", formData);
      console.log("✅ Login success:", res.data);

      // Sauvegarder le token pour les requêtes futures
      localStorage.setItem("token", res.data.token);

      // Rediriger vers la page d’accueil ou dashboard
      navigate("/Calendar"); // Remplacez par la route souhaitée
    } catch (err) {
      console.error("❌ Login error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Erreur de connexion");
    }
  };

  return (
    <div className={styles.bgImg}>
      <div className={styles.content}>
        <header>Login Dentiste</header>
        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <FaUser className={styles.icon} />
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Email"
            />
          </div>

          <div className={`${styles.field} ${styles.space}`}>
            <FaLock className={styles.icon} />
            <input
              type={showPassword ? "text" : "password"}
              name="motDePasse"   
              value={formData.motDePasse}
              onChange={handleChange}
              required
              placeholder="Mot de passe"
            />
            <span className={styles.show} onClick={togglePassword}>
              {showPassword ? "HIDE" : "SHOW"}
            </span>
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <div className={styles.pass}>
            <a href="#">Mot de passe oublié ?</a>
          </div>

          <div className={styles.field}>
            <input type="submit" value="LOGIN" />
          </div>
        </form>

        <div className={styles.login}>Ou se connecter avec</div>
        <div className={styles.links}>
          <div className={styles.facebook}>
            <FaFacebookF />
            <span>Facebook</span>
          </div>
          <div className={styles.instagram}>
            <FaInstagram />
            <span>Instagram</span>
          </div>
        </div>

        <div className={styles.signup}>
          Pas encore de compte ? <a href="/register-dentiste">Inscription</a>
        </div>
      </div>
    </div>
  );
}

export default LoginDentiste;
