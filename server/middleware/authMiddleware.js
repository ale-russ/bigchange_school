const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  try {
    // Get the token from Authorization header (Bearer <token>)
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "No Token Provided" });

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; //Attach user info (userId, role) to request

    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
