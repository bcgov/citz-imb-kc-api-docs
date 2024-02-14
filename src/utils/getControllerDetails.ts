import fs from "fs";
import { CustomResponseStatuses, CustomSchemaConfig, Modules } from "../types";
import {
  parseSchema,
  getFunctionCode,
  getCommentAboveFunction,
  getQueryParams,
  getPathParams,
} from "./file-parsing";
import { getCommentText, getStatusCodes } from "./string-parsing";

export const getControllerDetails = (
  modules: Modules,
  customSchemas: CustomSchemaConfig,
  customResponseStatuses: CustomResponseStatuses,
  defaultResponses: number[]
) => {
  Object.keys(modules).forEach((module) => {
    // For each endpoint in a module
    modules[module].endpoints.forEach((endpoint, index) => {
      if (endpoint.controller.path !== "") {
        const controllerFileContent = fs.readFileSync(
          endpoint.controller.path,
          "utf8"
        );

        // Extract description if provided
        const comment = getCommentAboveFunction(
          controllerFileContent,
          endpoint.controller.name
        ).trim();
        const description = getCommentText(comment);
        modules[module].endpoints[index].description = description;

        // Extract function code from controller file content
        const functionCode = getFunctionCode(
          controllerFileContent,
          endpoint.controller.name
        );

        // Get path params
        const pathParams = getPathParams(
          controllerFileContent,
          functionCode,
          modules[module].endpoints[index].controller.path
        );

        // Set path properties on controller data
        if (pathParams.schemaName && pathParams.schemaPath) {
          const params = parseSchema(pathParams, customSchemas);
          if (params)
            modules[module].endpoints[index].controller.pathParams = params;
        } else {
          modules[module].endpoints[index].controller.pathParams =
            pathParams.params;
        }

        // Get query params
        const query = getQueryParams(
          controllerFileContent,
          functionCode,
          modules[module].endpoints[index].controller.path
        );

        // Set query properties on controller data
        if (query.schemaName && query.schemaPath) {
          const params = parseSchema(query, customSchemas);
          if (params)
            modules[module].endpoints[index].controller.query = params;
        } else {
          modules[module].endpoints[index].controller.query = query.params;
        }

        // Set response status codes
        const controllerStatusCodes = getStatusCodes(
          functionCode,
          customResponseStatuses
        );
        const responseStatusCodes = [
          ...controllerStatusCodes,
          ...defaultResponses,
        ];
        modules[module].endpoints[index].responseStatusCodes =
          responseStatusCodes;
      }
    });
  });

  return modules;
};
