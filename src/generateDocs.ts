import fs from "fs";
import { Config, Method, Module, ModuleEndpoints } from "./types";

export const config = {
  expressFilePath: "src/express.ts",
  modulesBasePath: "src/modules/",
  modules: {
    health: {
      description: "Check application health.",
    },
    config: {
      description: "Configuration variables.",
    },
    cssapi: {
      description:
        "Interface with the Keycloak Integration through the CSS API.",
    },
  },
  defaultResponses: [[503, "An unexpected error occurred."]],
};

export const generateDocs = (config: Config) => {
  const { expressFilePath, modulesBasePath, modules } = config;

  const moduleNames = Object.keys(modules);
  const processedModules: Module[] = [];

  // Get express file content
  const expressFileContent = fs.readFileSync(expressFilePath, "utf8");

  // Process module details from express.
  moduleNames.forEach((moduleName) => {
    const regex = new RegExp(
      `app\\.use\\(['"]\\/${moduleName}['"],.*?\\)`,
      "s"
    );
    const match = expressFileContent.match(regex);

    if (match) {
      const processedModule: Module = {
        name: moduleName,
        route: `/${moduleName}`,
        protected: false,
        protectedBy: [],
        protectedByAll: true,
      };

      const protectedRouteRegex =
        /protectedRoute\(\s*(?:\[(.*?)\])?\s*(?:,\s*({.*?})\s*)?\)/;
      const protectedMatch = match[0].match(protectedRouteRegex);

      if (protectedMatch) {
        processedModule.protected = true;

        // Process roles
        const roles = protectedMatch[1]?.replace(/['"\s]+/g, "");
        processedModule.protectedBy = roles ? roles.split(",") : [];

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
              processedModule.protectedByAll = false;
            }
          } catch (error) {
            console.error(
              "Error parsing options parameter in protectedRoute:",
              error
            );
          }
        }
      }

      processedModules.push(processedModule);
    }
  });

  const endpointsByModule: ModuleEndpoints = {};

  // Process endpoint details from modules.
  processedModules.forEach((module) => {
    const routerFileContent = fs.readFileSync(
      `${modulesBasePath}${module.name}/router.ts`,
      "utf8"
    );

    // Initialize the module in endpointsByModule
    endpointsByModule[module.name] = {
      description: modules[module.name].description,
      endpoints: [],
    };

    const methodRegex =
      /router\.(get|post|patch|put|delete)\(['"]\/(.*?)['"],/g;
    let match;
    while ((match = methodRegex.exec(routerFileContent)) !== null) {
      endpointsByModule[module.name].endpoints.push({
        route: `/${match[2]}`,
        method: match[1].toUpperCase() as Method,
        protected: module.protected,
        protectedBy: module.protectedBy,
        protectedByAll: module.protectedByAll,
      });
    }

    const chainedMethodBlockRegex =
      /router\.route\(['"]\/(.*?)['"]\)\.([\s\S]+?)(?=\n|router|$)/g;
    while ((match = chainedMethodBlockRegex.exec(routerFileContent)) !== null) {
      const baseRoute = match[1];
      const chainedMethods = match[2].match(/(get|post|patch|put|delete)\(/g);
      if (chainedMethods) {
        chainedMethods.forEach((method) => {
          method = method.replace("(", "");
          endpointsByModule[module.name].endpoints.push({
            route: `/${baseRoute}`,
            method: method.toUpperCase() as Method,
            protected: module.protected,
            protectedBy: module.protectedBy,
            protectedByAll: module.protectedByAll,
          });
        });
      }
    }
  });

  // Write output to file.
  const filePath = "src/endpoints.json";
  fs.writeFileSync(
    filePath,
    JSON.stringify(endpointsByModule, null, 2),
    "utf8"
  );
};
