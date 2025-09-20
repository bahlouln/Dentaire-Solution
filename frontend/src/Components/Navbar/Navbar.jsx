import React from "react";
import styles from "./Navbar.module.css";
import { Link, useNavigate } from "react-router-dom";
import { FiBell, FiLogOut } from "react-icons/fi";

const Navbar = () => {
  const navigate = useNavigate();

  // ⚡ Fonction de déconnexion
  const handleLogout = () => {
    // Supprime le token ou l'état de connexion
    localStorage.removeItem("token");
    // Redirige vers la page login
    navigate("/login-dentiste");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link to="/">MonLogo</Link>
      </div>

      <ul className={styles.navLinks}>
        <li><Link to="/calendar">Accueil</Link></li>
        <li><Link to="/services">Services</Link></li>
        <li><Link to="/about">À propos</Link></li>
        <li><Link to="/contact">Contact</Link></li>
      </ul>

      <div className={styles.icons}>
        
        <FiBell className={styles.bellIcon} />
        {/* Icône déconnexion */}
        <FiLogOut className={styles.logoutIcon} onClick={handleLogout} />
      </div>
    </nav>
  );
};

export default Navbar;
