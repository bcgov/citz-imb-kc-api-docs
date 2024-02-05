import fs from "fs";
import { Modules } from "../types";

/**
 * Parse details about each module from the express file.
 * Details include name, if the module is protected by Keycloak,
 * and if any roles are required to access the endpoints.
 */
export const getModuleDetails = (
  moduleNames: string[],
  expressFilePath: string,
  configModules: any
): Modules => {
  // Get express file content
  const expressFileContent = fs.readFileSync(expressFilePath, "utf8");

  const modules: Modules = {};

  // Process module details from express.
  moduleNames.forEach((module) => {
    const regex = new RegExp(`app\\.use\\(['"]\\/${module}['"],.*?\\)`, "s");
    const match = expressFileContent.match(regex);

    if (match) {
      // Initialize the modules
      modules[module] = {
        description: configModules[module].description,
        protected: false,
        protectedBy: [],
        protectedByAll: true,
        endpoints: [],
      };

      const protectedRouteRegex =
        /protectedRoute\(\s*(?:\[(.*?)\])?\s*(?:,\s*({.*?})\s*)?\)/;
      const protectedMatch = match[0].match(protectedRouteRegex);

      if (protectedMatch) {
        modules[module].protected = true;

        // Process roles
        const roles = protectedMatch[1]?.replace(/['"\s]+/g, "");
        modules[module].protectedBy = roles ? roles.split(",") : [];

        // Process options parameter if present
        if (protectedMatch[2]) {
          try {
            // Safely parse the options JSON
            const options = JSON.parse(protectedMatch[2].replace(/'/g, '"')); // Replace single quotes with double quotes for valid JSON
            // Set protectedByAll based on requireAllRoles
            if (
              options.hasOwnProperty("requireAllRoles") &&
              options.requireAllRoles === false
            ) {
              modules[module].protectedByAll = false;
            }
          } catch (error) {
            console.error(
              "Error parsing options parameter in protectedRoute:",
              error
            );
          }
        }
      }
    }
  });

  return modules;
};
