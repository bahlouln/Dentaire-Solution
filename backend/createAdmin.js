import db from "./config/database.js";
import User from "./models/User.js";

const createAdmin = async () => {
  try {
    await db.sync();

    const admin = await User.create({
      nom: "AdminTest",
      email: "admin@test.com",
      motDePasse: "123456", // sera hashé automatiquement par beforeCreate
      role: "admin",
    });

    console.log("Admin créé :", admin.toJSON());
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();
