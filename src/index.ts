import { Application } from "express";
import { apiDocsRender, apiDocsServe } from "./router";
import { generateDocs } from "./generateDocs";
import { Config } from "./types";
import config from "./config";
const { BASE_PATH } = config;

const DefaultAPIDocsConfig = {
  title: "API Documentation",
  expressFilePath: "src/express.ts",
  modulesBasePath: "src/modules",
  modules: {},
  defaultResponses: [],
};

export const apiDocs = (app: Application, config: Config) => {
  // Add default config
  const configuration = {
    ...DefaultAPIDocsConfig,
    ...config,
  };
  const endpoints = generateDocs(configuration);
  app.use(BASE_PATH, apiDocsServe(app), apiDocsRender(endpoints, config.title));
};
