import db from "./config/database.js";
import "./models/User.js";
import "./models/Dentiste.js";
import "./models/Patient.js";
import "./models/RendezVous.js";

(async () => {
  try {
    await db.sync({ force: true }); // ⚠️ supprime et recrée toutes les tables
    console.log("✅ Tables créées avec succès !");
    process.exit();
  } catch (error) {
    console.error("❌ Erreur lors de la création des tables :", error);
    process.exit(1);
  }
})();
