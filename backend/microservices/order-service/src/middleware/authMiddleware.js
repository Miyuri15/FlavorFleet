const jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
  /* =========================
     INTERNAL SERVICE AUTH
     (Stripe webhook, payment-service)
  ========================= */
  const internalKey = req.headers["x-internal-key"];

  if (
    internalKey &&
    internalKey === process.env.INTERNAL_SERVICE_KEY
  ) {
    // trusted internal request
    req.user = {
      id: "internal-service",
      role: "system",
    };
    return next();
  }

  /* =========================
     USER JWT AUTH
  ========================= */
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "No token or internal key, authorization denied",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Malformed authorization header",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role,
      username: decoded.username,
    };

    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
