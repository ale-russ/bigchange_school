const roleMiddleware = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role))
    return res
      .status(403)
      .json({ message: "Access Denied: Insufficient permissions" });

  next();
};

module.exports = roleMiddleware;
