import fs from "fs";
import dotenv from "dotenv";
import { ROOT_ENV_PATH, SERVER_ENV_PATH } from "./paths.js";

let didLoadEnv = false;

export function loadServerEnv(): void {
  if (didLoadEnv) return;

  for (const envPath of [SERVER_ENV_PATH, ROOT_ENV_PATH]) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath, override: false });
    }
  }

  didLoadEnv = true;
}
