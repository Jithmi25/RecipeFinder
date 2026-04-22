import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import recipeRoutes from "./routes/recipes.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
const DEFAULT_FRONTEND_ORIGIN = "http://localhost:5173";
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
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
