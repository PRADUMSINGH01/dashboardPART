import admin from "firebase-admin";

// Ensure the environment variable is set
if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  throw new Error(
    "The FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set."
  );
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

// Initialize the app if it's not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export { db };
