// pages/api/hello.js
import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter, expressWrapper } from "next-connect";

import { unstable_getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]"

// Default Req and Res are IncomingMessage and ServerResponse
// You may want to pass in NextApiRequest and NextApiResponse
const router = createRouter<NextApiRequest, NextApiResponse>();

router
  .use(async (req, res, next) => {
    const session = await unstable_getServerSession(req, res, authOptions)
    console.log('session', session);
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
  .post("/api/v1/projects", async (req, res) => {
    console.log(req.body)
    // use async/await
    res.json({ text: "this should create a new project for ther user. Yipee!" });
  });

export default router.handler({
  onError: (err, req, res) => {
    res.status(500).end("Something broke!");
  },
  onNoMatch: (req, res) => {
    res.status(404).end("Page is not found");
  },
});