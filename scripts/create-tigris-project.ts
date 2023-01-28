import { promisify } from 'node:util';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
const writeFile = promisify(fs.writeFile);
import child_process from 'node:child_process'
const exec = promisify(child_process.exec)

import prompts from 'prompts';

const DEFAULT_PROJECT_NAME = 'habit_dabit';
const DEFAULT_TIGRIS_URI = 'https://api.preview.tigrisdata.cloud';
const DEFAULT_TIGRIS_BRANCH = 'develop';
const APP_KEY_NAME = 'dev_key';
const APP_KEY_DESC = 'Development Key';
const ENV_FILE_NAME = ".env.development.local";

const main = async () => {
  let existingProjects: string[] = [];
  let authenticed: boolean = false;
  let projectName: string = DEFAULT_PROJECT_NAME;
  let envVarFormat: string = "";

  const tigrisInstalled = await checkTigrisInstalled();
  if (!tigrisInstalled) {
    console.error('The Tigris CLI is not installed.\nPlease install it with `brew install tigris`.');
    if (os.platform().toLocaleLowerCase().includes('windows')) {
      console.error('If you are on Windows, create a project via the Tigris Console and manually populate a `.env.local` file.')
    }
    process.exit(1);
  }

  try {
    // Just list projects which requires auth in order to check if the CLI is logged in
    const projectsListOutput = await exec('tigris list projects');
    existingProjects = projectsListOutput.stdout.split(os.EOL);
    authenticed = true;
  }
  catch (err: unknown) {
    const error = err as { code: number, killed: boolean, cmd: string, stdout: string, stderr: string, signal: any }

    // Not logged in.
    if (error.stderr.includes('Failed to validate access token') ||
      error.stderr.includes('unauthenticated with bearer')) {
      while (!authenticed) {

        // Attempted login via the CLI
        const loginOutput = await exec('tigris login');
        authenticed = loginOutput.stderr.includes('Successfully logged in')

        if (authenticed) {
          console.log('Successfully logged in!')
        }
        else {
          console.error('Failed to login. Please retry.');
        }
      }
    }
    else {
      console.error('Error creating the Tigrs Project', error);
      process.exit(1);
    }
  }

  if (!authenticed) {
    // Should never get in here since `authenticated` is set above.
    console.error('Cannot create a project without being logged in');
    process.exit(1);
  }

  while (checkValidProjectName(projectName, existingProjects) === false) {
    const response = await prompts({
      type: 'text',
      name: 'value',
      message: 'What do you want to call your Tigris Project',
      validate: value => checkValidProjectName(value, existingProjects),
    }, {
      onCancel: (_prompt: any) => {
        process.exit(1)
      },
    });
    projectName = response.value;
    console.log(`Okay, let's try "${projectName}" as your Project name.`);
  }

  try {
    console.log(`Creating Project: ${projectName}`);
    const createProjectOutput = await exec(`tigris create project ${projectName}`);
    console.log('Project successfully created!');
  }
  catch (err) {
    console.error('Unexpected error encountered', err);
    process.exit(1);
  }

  try {
    console.log(`Creating Application Key ${APP_KEY_NAME} for Project ${projectName}.`);

    const createKeyOutput = await exec(`tigris create app_key ${APP_KEY_NAME} "${APP_KEY_DESC}" --project ${projectName}`);
    const config = JSON.parse(createKeyOutput.stdout);
    const envVars = {
      TIGRIS_URI: DEFAULT_TIGRIS_URI,
      TIGRIS_PROJECT: projectName,
      TIGRIS_CLIENT_ID: config.id,
      TIGRIS_CLIENT_SECRET: config.secret,
      TIGRIS_DB_BRANCH: DEFAULT_TIGRIS_BRANCH,
    };

    envVarFormat = toEnvVarFormat(envVars);
    console.log('Application Key successfully created!');
  }
  catch (err) {
    console.error('Unexpected error encountered creating the Application Key', err);
    process.exit(1);
  }

  try {
    console.log('Writing Project settings.');
    const dotEnvPath = path.resolve(__dirname, "..", ENV_FILE_NAME);
    await writeFile(dotEnvPath, envVarFormat);
    console.log(`Tigris Project settings successfully written to "${dotEnvPath}"!`);
    process.exit(0);
  }
  catch (err) {
    console.error(`Unexpected error encountered saving the "${ENV_FILE_NAME}" file.`, err);
    process.exit(1);
  }
};

const checkTigrisInstalled = async () => {
  let tigrisCliInstalled = false;
  try {
    const tigrisOutput = await exec('tigris')
    tigrisCliInstalled = true;
  }
  catch (err) { }

  return tigrisCliInstalled;
}

const checkValidProjectName = (projectName: string, existingProjects: string[]) => {
  if (!projectName || projectName.length < 4 || projectName === "undefined") {
    console.warn();
    console.warn('A Project name must have more than 4 characters.')
    return false;
  }

  if (existingProjects.includes(projectName)) {
    console.warn(`A Tigris project called "${projectName}" already exists.`);
    return false;
  }

  return true;
}

const toEnvVarFormat = (obj: Record<string, any>) => {
  let result = '';
  for (const [key, value] of Object.entries(obj)) {
    if (key) {
      const line = `${key}=${String(value)}`;
      result += line + os.EOL;
    }
  }
  return result;
}

main();