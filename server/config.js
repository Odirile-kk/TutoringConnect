// Loads environment variables for the Express server such as the MongoDB URI,
// port number, and JWT secret used during authentication.
import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const serverDirectory = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(serverDirectory, ".env") });

export const PORT = process.env.PORT || 5000;
export const JWT_SECRET = process.env.JWT_SECRET || "development-secret";
export const MONGODB_URI = process.env.MONGODB_URI;
