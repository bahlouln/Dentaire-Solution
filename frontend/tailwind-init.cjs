const { execSync } = require("child_process");

try {
  execSync(".\\node_modules\\.bin\\tailwindcss init -p", { stdio: "inherit" });
  console.log("Tailwind configuré avec succès !");
} catch (err) {
  console.error("Erreur :", err);
}
