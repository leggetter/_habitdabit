// pages/api/hello.js
import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";

import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]"
import { tigrisDb } from "../../../lib/tigris";
import { Project } from "../../../db/models/project";
import { User } from "../../../db/models/user";
import { ProjectFormValues } from "../../../lib/project-helpers";

// Default Req and Res are IncomingMessage and ServerResponse
// You may want to pass in NextApiRequest and NextApiResponse
const router = createRouter<NextApiRequest, NextApiResponse>();

router
  .use(async (req, res, next) => {
    const session = await getServerSession(req, res, authOptions)
    // console.log('session', session);
    if (!session) {
      res.status(401).end();
      return;
    }

    const start = Date.now();
    await next(); // call next in chain
    const end = Date.now();
    console.log(`Request took ${end - start}ms`);
  })
  .get("/api/v1/projects", (req, res) => {
    res.send("this should authenticate the user ang get all projects that they can see. Yipee!");
  })
  .get("/api/v1/projects/:id", async (req, res: NextApiResponse<Project | { error: string }>) => {
    // TODO: ensure that the current session user has permission to view the project
    // 1. owner 2. champion 3. an admin

    try {
      const { slug } = req.query
      const id = parseInt(slug![1] as string) as number;

      const projects = tigrisDb.getCollection<Project>(Project);
      const project = await projects.findOne({ filter: { id: id } });

      if (project) {
        // TODO: get the owner and admins for the project
        res.status(200).json(project);
      }
      else {
        res.status(404).json({ error: `Project with id "${id}" not found` });
      }
    }
    catch (ex) {
      console.error(ex)
      res.status(500).json({ error: "Unexpected server error in /api/va/project/[id]" })
    }
  })
  .post("/api/v1/projects", async (req, res) => {
    const session = await getServerSession(req, res, authOptions)
    const projectCreationRequest = req.body as ProjectFormValues;

    if (projectCreationRequest.owner !== session?.user.email) {
      res.status(403).json({ error: "The provided owner email does not match the current logged in user" });
      return;
    }

    try {
      const users = tigrisDb.getCollection<User>("users");

      let owner = await users.findOne({ filter: { email: projectCreationRequest.owner } });
      if (!owner) {
        owner = await users.insertOne({
          name: session.user.name || "",
          email: session.user.email,
          createdAt: new Date(),
        });

        console.log("New user created for owner", owner);

        // This should never happen as the user should be created at signup
        // TODO: create user at signup
        // res.status(404).json({ error: "The owner could not be found." });
        // return
      }
      else {
        console.log("Owner already exists.", owner);
      }

      let champion = await users.findOne({ filter: { email: projectCreationRequest.champion } });
      if (!champion) {

        champion = await users.insertOne({
          name: "",
          email: projectCreationRequest.champion,
          createdAt: new Date(),
        });

        console.log("New user created for owner", champion);
        // TODO: should the champion be created if they don't exist? Probably!
        // res.status(404).json({ error: "The champion could not be found." });
      }
      else {
        console.log('Champion already exists.', champion)
      }

      const creationDate = new Date();
      const projects = tigrisDb.getCollection<Project>("projects");
      const insertedProject = await projects.insertOne({
        name: projectCreationRequest.name,
        championId: champion.id!,
        goalDescription: projectCreationRequest.goal,
        ownerId: owner.id!,
        adminIds: [owner.id!],
        startDate: creationDate,
      });

      res.status(201).json(insertedProject)
    }
    catch (ex) {
      console.error(ex)

      res.status(500).json({ error: "unexpected server error" });
    }
  });

export default router.handler({
  onError: (err, req, res) => {
    console.error(err);
    res.status(500).end("Something broke!");
  },
  onNoMatch: (req, res) => {
    res.status(404).end("Page is not found");
  },
});