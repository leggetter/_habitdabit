import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { tigrisClient } from "../lib/tigris";

import { Project } from "../db/models/project"
import { User } from "../db/models/user";

async function main() {
  // ensure branch exists, create it if it needs to be created dynamically
  await tigrisClient.getDatabase().initializeBranch();
  // register schemas
  await tigrisClient.registerSchemas([Project, User]);
}

main();