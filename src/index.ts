import { Application } from "express";
import { apiDocsRender, apiDocsServe } from "./router";
import { generateDocs } from "./generateDocs";
import { Config } from "./types";
import config from "./config";
const { BASE_PATH } = config;

export const apiDocs = (app: Application, config: Config) => {
  const endpoints = generateDocs(config);
  app.use(
    BASE_PATH,
    apiDocsServe(app),
    apiDocsRender(endpoints, config.title, config.description)
  );
};

export const BaseAPIDocsConfig = {
  title: "API Documentation",
  description:
    "Welcome to our API documentation. Here you'll find details about our API's functionalities. This documentation is automatically generated based on the api codebase.",
  expressFilePath: "src/express.ts",
  modulesBasePath: "src/modules/",
  modules: {},
  defaultResponses: [],
};
