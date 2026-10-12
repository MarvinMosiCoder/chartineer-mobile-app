export function errorHandler(error, _req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      message: "Send a valid JSON request.",
    });
  }

  if (error.type === "entity.too.large") {
    return res.status(413).json({
      message: "Request is too large.",
    });
  }

  console.error("API error:", error.message);

  res.status(500).json({
    message: "The server could not complete the request. Try again.",
  });
}