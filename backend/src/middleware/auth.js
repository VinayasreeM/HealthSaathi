const jwt = require("jsonwebtoken");

// Verifies the JWT from the Authorization header and attaches req.user
function protect(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, no token" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    next();
  } catch {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, invalid token" });
  }
}

// Restricts a route to a specific role ("patient" or "doctor")
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
  };
}

module.exports = { protect, requireRole };
