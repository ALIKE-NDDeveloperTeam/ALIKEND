import { initializeApp, getApps, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";

const projectId = process.env.FIREBASE_PROJECT_ID?.trim() || "gen-lang-client-0165380635";

const app: App = getApps().length > 0
  ? getApps()[0]
  : initializeApp({ projectId });

export const firebaseAuth: Auth = getAuth(app);
export default app;
