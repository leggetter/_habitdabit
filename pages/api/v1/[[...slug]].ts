// pages/api/hello.js
import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { tigrisDb } from "../../../lib/tigris";
import { IWeeklyHabitTemplate, Project } from "../../../db/models/project";
import { User } from "../../../db/models/user";
import { ProjectValues } from "../../../lib/project-helpers";
import {
  FindQuery,
  LogicalOperator,
  SelectorFilterOperator,
  Status,
  UpdateQuery,
} from "@tigrisdata/core";

import { getXataClient } from "db/xata";
const xata = getXataClient();

// Default Req and Res are IncomingMessage and ServerResponse
// You may want to pass in NextApiRequest and NextApiResponse
const router = createRouter<
  NextApiRequest & { params?: { id: number } },
  NextApiResponse
>();

const projects = tigrisDb.getCollection<Project>(Project);
const users = tigrisDb.getCollection<User>(User);

const toWeeklyHabitTemplate = (
  json: string | undefined | null
): IWeeklyHabitTemplate => {
  if (!json) {
    return {
      days: [],
    };
  } else {
    return JSON.parse(json) as IWeeklyHabitTemplate;
  }
};

router
  .use(async (req, res, next) => {
    const session = await getServerSession(req, res, authOptions);
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
  .get(
    "/api/v1/projects",
    async (req, res: NextApiResponse<Project[] | { error: string }>) => {
      try {
        const search = req.query.search as string;

        if (search) {
          const iterator = projects.search({ q: search });
          const searchResults = await iterator.toArray();
          let projectResults: Project[] = [];
          const results = searchResults.forEach((searchResult) => {
            projectResults = projectResults.concat(
              searchResult.hits.map((hit) => hit.document)
            );
          });
          return res.status(200).json(projectResults);
        } else {
          const records = await xata.db.projects
            .select([
              "id",
              "name",
              "goalDescription",
              "adminIds",
              "startDate",
              "habitScheduleTemplate",
              "owner.id",
              "owner.name",
              "owner.email",
              "champion.id",
              "champion.name",
              "champion.email",
            ])
            .getAll();

          const result: Project[] = records.map((result) => {
            return {
              id: result.id,
              name: result.name || "",
              goalDescription: result.goalDescription || "",
              ownerId: result.owner && result.owner.id ? result.owner.id : "",
              championId: result.champion?.id || "",
              startDate: result.startDate,
              habitsScheduleTemplate: toWeeklyHabitTemplate(
                result.habitScheduleTemplate
              ),
              adminIds: result.adminIds || [],
            };
          });

          // const cursor = projects.findMany();
          // return res.status(200).json(await cursor.toArray());
          return res.status(200).json(result);
        }
      } catch (e: any) {
        return res.status(500).json({ error: e.toString() });
      }
    }
  )
  .patch(
    "/api/v1/projects/:id",
    async (req, res: NextApiResponse<Project | { error: string }>) => {
      try {
        const id = req.params!.id;
        const project = await projects.findOne({ filter: { id } });

        if (!project) {
          res
            .status(404)
            .json({ error: `A project with id "${id}" could not be found.` });
        } else {
          const session = await getServerSession(req, res, authOptions);
          const loggedInUser = await users.findOne({
            filter: { email: session?.user.email },
          });

          if (project.adminIds.includes(loggedInUser!.id!) === false) {
            res.status(403).json({
              error:
                "The logged in user does not have permission to edit the project",
            });
            return;
          }
          // You cannot edit the owner (for now)
          // so those values are not being changed
          const projectUpdateRequest = req.body as ProjectValues;

          if (
            projectUpdateRequest.adminEmails &&
            projectUpdateRequest.adminEmails.length === 0
          ) {
            res.status(400).json({
              error: "At least one admin email must be set for a project",
            });
            return;
          }

          let adminIds = undefined;
          if (projectUpdateRequest.adminEmails) {
            let adminEmailQuery = {} as FindQuery<User>;
            if (projectUpdateRequest.adminEmails.length === 1) {
              adminEmailQuery.filter = {
                email: projectUpdateRequest.adminEmails[0],
              };
            } else {
              adminEmailQuery.filter = {
                op: LogicalOperator.OR,
                selectorFilters: projectUpdateRequest.adminEmails?.map(
                  (email) => {
                    return {
                      op: SelectorFilterOperator.EQ,
                      fields: {
                        email: email,
                      },
                    };
                  }
                ),
              };
            }

            const admins = await users.findMany(adminEmailQuery).toArray();
            adminIds =
              admins.length > 0
                ? admins.map((user) => {
                    return user.id;
                  })
                : undefined;
          }

          const update: UpdateQuery<Project> = {
            filter: {
              id: project.id,
            },
            fields: {
              name: projectUpdateRequest.name,
              goalDescription: projectUpdateRequest.goal,
              habitsScheduleTemplate:
                projectUpdateRequest.habitsScheduleTemplate,
              weeklyHabitSchedules: projectUpdateRequest.weeklySchedules,
              adminIds: adminIds,
            },
          };

          console.log(JSON.stringify(update.fields, null, 2));

          // It would be nice to be able to more explicitly edit fields.
          // Instead we rely on fields being undefined or Arrays being empty
          // in order for a field not be edited.
          // if(projectUpdateRequest.name) {
          //   update.fields.name = projectUpdateRequest.name;
          // }
          // if(projectUpdateRequest.goal) {
          //   update.fields.goalDescription = projectUpdateRequest.goal;
          // }
          // if(projectUpdateRequest.habitsScheduleTemplate) {
          //   update.fields.habitsScheduleTemplate = projectUpdateRequest.habitsScheduleTemplate;
          // }

          const result = await projects.updateOne(update);
          if (result.status === Status.Updated) {
            console.log(result.modifiedCount);
            res.status(200).json(project);
          } else {
            res.status(500).json({
              error:
                "Project update request did not result in an updated status.",
            });
          }
        }
      } catch (ex) {
        console.error(ex);
        res.status(500).json({
          error: "Unexpected server error in PATCH /api/va/project/[id]",
        });
      }
    }
  )
  .get(
    "/api/v1/projects/:id",
    async (req, res: NextApiResponse<ProjectValues | { error: string }>) => {
      // TODO: ensure that the current session user has permission to view the project
      // 1. owner 2. champion 3. an admin

      try {
        const id = req.params!.id;
        const record = await xata.db.projects.read(id.toString());
        const admins = await xata.db.users
          .select(["email"])
          .filter({
            id: {
              $any: record?.adminIds ? record?.adminIds : [],
            },
          })
          .getAll();

        if (record) {
          const weeklySchedules = await xata.db.weeklyHabitSchedules
            .select(["id", "weekStartDate", "days"])
            .filter({ "project.id": record.id })
            .getAll();

          const champion = await record.champion?.read();
          const owner = await record.owner?.read();
          const projectValues = new ProjectValues({
            id: record.id,
            goal: record.goalDescription || "",
            name: record.name || "",
            adminEmails: admins.length
              ? admins.map((admin) => admin.email || "")
              : [],
            champion: champion?.email || "",
            habitsScheduleTemplate: toWeeklyHabitTemplate(
              record.habitScheduleTemplate
            ),
            owner: owner?.email || "",
            weeklySchedules: weeklySchedules.map((schedule) => {
              return {
                days: schedule.days ? JSON.parse(schedule.days) : [],
                weekStartDate: schedule.weekStartDate || new Date(),
              };
            }),
          });

          res.status(200).json(projectValues);
        } else {
          res.status(404).json({ error: `Project with id "${id}" not found` });
        }
      } catch (ex) {
        console.error(ex);
        res.status(500).json({
          error: "Unexpected server error in POST /api/va/project/[id]",
        });
      }
    }
  )
  .post("/api/v1/projects", async (req, res) => {
    const session = await getServerSession(req, res, authOptions);
    const projectCreationRequest = req.body as ProjectValues;

    if (!session || projectCreationRequest.owner !== session?.user.email) {
      res.status(403).json({
        error:
          "The provided owner email does not match the current logged in user",
      });
      return;
    }

    try {
      const users = tigrisDb.getCollection<User>(User);

      let owner = await users.findOne({
        filter: { email: projectCreationRequest.owner },
      });
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
      } else {
        console.log("Owner already exists.", owner);
      }

      let champion = await users.findOne({
        filter: { email: projectCreationRequest.champion },
      });
      if (!champion) {
        champion = await users.insertOne({
          name: "",
          email: projectCreationRequest.champion!,
          createdAt: new Date(),
        });

        console.log("New user created for owner", champion);
        // TODO: should the champion be created if they don't exist? Probably!
        // res.status(404).json({ error: "The champion could not be found." });
      } else {
        console.log("Champion already exists.", champion);
      }

      const creationDate = new Date();
      const projects = tigrisDb.getCollection<Project>(Project);
      const insertedProject = await projects.insertOne({
        name: projectCreationRequest.name!,
        championId: champion.id!,
        goalDescription: projectCreationRequest.goal!,
        ownerId: owner.id!,
        adminIds: [owner.id!],
        startDate: creationDate,
      });

      res.status(201).json(insertedProject);
    } catch (ex) {
      console.error(ex);

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
