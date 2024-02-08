import { Application } from "express";
import { apiDocsRender, apiDocsServe } from "./router";
import { generateDocs } from "./generateDocs";
import { Config } from "./types";
import config from "./config";
const { BASE_PATH } = config;

export const apiDocs = (app: Application, config: Config) => {
  const endpoints = generateDocs(config);
  app.use(BASE_PATH, apiDocsServe(app), apiDocsRender(endpoints, config.title));
};

export const BaseAPIDocsConfig = {
  title: "API Documentation",
  expressFilePath: "src/express.ts",
  modulesBasePath: "src/modules/",
  modules: {},
  defaultResponses: [],
};
