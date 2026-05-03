import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import recipeRoutes from "./routes/recipes.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
const DEFAULT_FRONTEND_ORIGIN =
  "https://recipe-finder-frontend-hazel.vercel.app/";
const allowedOrigins = [
  ...(process.env.FRONTEND_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  DEFAULT_FRONTEND_ORIGIN,
].map((origin) => origin.replace(/\/$/, ""));

const uniqueAllowedOrigins = [...new Set(allowedOrigins)];

const corsOptions = {
  origin: (origin, callback) => {
    // Requests such as curl/Postman may not send an Origin header.
    if (!origin) {
      callback(null, true);
      return;
    }

    const normalizedOrigin = origin.replace(/\/$/, "");
    if (uniqueAllowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Normalize repeated slashes in request paths (e.g. //api/auth/google).
app.use((req, _res, next) => {
  const [path, query] = req.url.split("?");
  const normalizedPath = path.replace(/\/{2,}/g, "/");
  req.url = query ? `${normalizedPath}?${query}` : normalizedPath;
  next();
});

// Add COOP/COEP headers for Google OAuth compatibility
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

app.use(express.json());
app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
