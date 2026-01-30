import functions from "firebase-functions";
import app from "../src/app.js";

// Export the Express app as a Cloud Function
export const api = functions.https.onRequest(app);
