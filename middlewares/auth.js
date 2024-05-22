const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const token = req.headers.authorization;
  const tokenBearerRemoved = token.replace("Bearer", "").trimLeft();
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }
  try {
    const decoded = jwt.verify(tokenBearerRemoved, "secret_key_generated");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Unauthorized: Invalid token" });
  }
}

function isAdmin(req, res, next) {
  if (req.user && req.user.role === "ADMIN") {
    next();
  } else {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }
}

module.exports = {
  verifyToken,
  isAdmin,
};
