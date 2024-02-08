import express, { Application, Request, Response, NextFunction } from "express";
import { getLoginURL, getTokens } from "./utils/index";
import { IdentityProvider, Modules } from "./types";
import path from "path";
const router = express.Router();

import config from "./config";
const { BACKEND_URL, BASE_PATH, LOGIN, LOGIN_CALLBACK } = config;

// Middleware function to serve files.
export const apiDocsServe = (app: Application) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Serve html for docs.
    app.set("view engine", "ejs");
    app.use(express.static(path.join(__dirname, "static")));
    app.set("views", path.join(__dirname, "static"));
    next();
  };
};

// Router.
export const apiDocsRender = (
  endpointsJson: Modules,
  title: string,
  description: string
) => {
  router.get(LOGIN, (req: Request, res: Response) => {
    try {
      const { idp } = req.query;
      if (!req.token) return res.redirect(getLoginURL(idp as IdentityProvider));
      return res.redirect("");
    } catch (error: any) {
      res.json({ success: false, error: error.message ?? error });
    }
  });

  router.get(LOGIN_CALLBACK, async (req: Request, res: Response) => {
    try {
      const { code } = req.query;
      const { id_token, access_token, refresh_token } = await getTokens(
        code as string
      );

      // Send response.
      res
        .cookie("refresh_token", refresh_token, {
          secure: true,
        })
        .cookie("access_token", access_token, {
          secure: true,
        })
        .cookie("id_token", id_token, {
          secure: true,
        })
        .redirect(`${BACKEND_URL}${BASE_PATH}`);
    } catch (error: any) {
      res.json({ success: false, error: error.message ?? error });
    }
  });

  // Serves documentation.
  router.get("/", (req: Request, res: Response) => {
    res.render("index", {
      title,
      description,
      endpoints: endpointsJson,
    });
  });

  return router;
};
