import jwt from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: "Accès refusé, pas de token" });
  }

  try {
    const cleanedToken = token.replace('Bearer ', '');
    const decoded = jwt.verify(cleanedToken, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("Erreur de vérification :", err.message);
    res.status(403).json({ message: "Token invalide" });
  }
}