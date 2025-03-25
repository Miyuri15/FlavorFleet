const jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
  console.log("Headers received:", req.headers);

  const token = req.headers.authorization?.split(" ")[1]; // Extract token
  console.log("Extracted token:", token);

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    // Attach the decoded user data (including role) to the request object
    req.user = {
      id: decoded.id,
      role: decoded.role, // Ensure the role is included
      username: decoded.username, // Optional: Include other fields if needed
    };

    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
