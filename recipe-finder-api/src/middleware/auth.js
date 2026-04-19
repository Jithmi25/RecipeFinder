import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing authentication token." });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev-jwt-secret-change-me",
    );
    req.user = payload;
    return next();
  } catch {
    return res
      .status(401)
      .json({ error: "Invalid or expired authentication token." });
  }
}
