import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function googleLogin(req, res) {
  const { credential } = req.body || {};

  if (!credential) {
    return res.status(400).json({ error: "Missing Google credential token." });
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    return res
      .status(500)
      .json({ error: "Server is missing GOOGLE_CLIENT_ID." });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.sub || !payload?.email) {
      return res
        .status(401)
        .json({ error: "Google token payload is incomplete." });
    }

    const appToken = jwt.sign(
      {
        sub: payload.sub,
        email: payload.email,
        name: payload.name || "",
        picture: payload.picture || "",
      },
      process.env.JWT_SECRET || "dev-jwt-secret-change-me",
      { expiresIn: "7d" },
    );

    return res.json({
      token: appToken,
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name || payload.email,
        picture: payload.picture || "",
      },
    });
  } catch {
    return res.status(401).json({ error: "Google token verification failed." });
  }
}
