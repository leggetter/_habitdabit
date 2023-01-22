import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { Tigris } from "@tigrisdata/core";
import { Project } from "../db/models/project"
import { User } from "../db/models/user";

async function main() {
  // setup client
  const tigrisClient = new Tigris();
  // ensure branch exists, create it if it needs to be created dynamically
  await tigrisClient.getDatabase().initializeBranch();
  // register schemas
  await tigrisClient.registerSchemas([Project, User]);
}

main();