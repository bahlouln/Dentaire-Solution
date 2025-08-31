import jwt from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
  // Récupérer le header Authorization
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Accès refusé : aucun token fourni" });
  }

  // Le format attendu est : "Bearer <token>"
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Accès refusé : format du token invalide" });
  }

  try {
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Ajouter les infos du user dans req.user (disponible dans les routes protégées)
    req.user = decoded;

    next(); // Continuer vers le contrôleur
  } catch (err) {
    console.error("Erreur de vérification du token :", err.message);
    return res.status(403).json({ message: "Token invalide ou expiré" });
  }
}
