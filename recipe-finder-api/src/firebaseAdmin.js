import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

function getFirebaseCredential() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  let privateKey = privateKeyRaw?.trim();

  if (privateKey && !privateKey.includes("BEGIN PRIVATE KEY")) {
    privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----\n`;
  }

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin credentials are missing. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.",
    );
  }

  return {
    projectId,
    clientEmail,
    privateKey,
  };
}

let firestoreInstance = null;

export function getFirestore() {
  if (firestoreInstance) {
    return firestoreInstance;
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(getFirebaseCredential()),
    });
  }

  firestoreInstance = admin.firestore();
  return firestoreInstance;
}
