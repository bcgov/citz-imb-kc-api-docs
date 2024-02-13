import { Config, Modules } from "./types";
import {
  getModuleDetails,
  getRouterDetails,
  getControllerDetails,
} from "./utils";

export const generateDocs = (config: Config) => {
  const {
    expressFilePath,
    modulesBasePath,
    customSchemas,
    customControllers,
    modules,
  } = config;

  const moduleNames = Object.keys(modules);

  // Add details from the express file about each module.
  let moduleDetails: Modules = getModuleDetails(
    moduleNames,
    expressFilePath,
    modules
  );

  // Add details about the endpoints from the router file for each module.
  moduleDetails = getRouterDetails(
    moduleDetails,
    modulesBasePath,
    customControllers ?? {}
  );

  // Add controller details
  moduleDetails = getControllerDetails(moduleDetails, customSchemas ?? {});

  return moduleDetails;
};
