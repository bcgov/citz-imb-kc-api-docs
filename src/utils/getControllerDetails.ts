import fs from "fs";
import { Modules } from "../types";
import { extractFunctionCode } from "./extractFunctionCode";
import { parseQueryParams } from "./parseQueryParams";

export const getcontrollerDetails = (
  modules: Modules,
  modulesBasePath: string
) => {
  Object.keys(modules).forEach((module) => {
    // For each endpoint in a module
    modules[module].endpoints.forEach((endpoint, index) => {
      if (endpoint.controller.path !== "") {
        const controllerFileContent = fs.readFileSync(
          endpoint.controller.path,
          "utf8"
        );

        // Extract function code from controller file content
        const functionCode = extractFunctionCode(
          controllerFileContent,
          endpoint.controller.name
        );

        // Get query params
        const query = parseQueryParams(
          controllerFileContent,
          functionCode,
          modulesBasePath
        );

        // Set query properties on controller data
        modules[module].endpoints[index].controller.query = query.params;
        if (query.schemaName)
          modules[module].endpoints[index].controller.querySchemaName =
            query.schemaName;
        if (query.schemaPath)
          modules[module].endpoints[index].controller.querySchemaPath =
            query.schemaPath;
      }
    });
  });

  return modules;
};
