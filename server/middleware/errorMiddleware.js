const errorMiddleware = (err, req, res, next) => {
  console.error("Error is: ", err.stack);
  res.status(500).json({
    message: "Something went wrong. Please try again",
    // message: err.stack || "Something went wrong",
    // error:process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};

module.exports = errorMiddleware;
