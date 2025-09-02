export default function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non connecté" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Accès refusé : rôle non autorisé" });
    }

    next();
  };
}
