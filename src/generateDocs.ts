import fs from "fs";
import { Config, Modules } from "./types";
import {
  getModuleDetails,
  getRouterDetails,
  getcontrollerDetails,
} from "./utils";

export const generateDocs = (config: Config) => {
  const { expressFilePath, modulesBasePath, modules } = config;

  const moduleNames = Object.keys(modules);

  // Add details from the express file about each module.
  const moduleDetails: Modules = getModuleDetails(
    moduleNames,
    expressFilePath,
    modules
  );

  // Add details about the endpoints from the router file for each module.
  const routerDetails: Modules = getRouterDetails(
    moduleDetails,
    modulesBasePath
  );

  // Add controller details
  const controllerDetails: Modules = getcontrollerDetails(
    routerDetails,
    modulesBasePath
  );

  // Write output to file.
  const filePath = "src/endpoints.json";
  fs.writeFileSync(
    filePath,
    JSON.stringify(controllerDetails, null, 2),
    "utf8"
  );
};
