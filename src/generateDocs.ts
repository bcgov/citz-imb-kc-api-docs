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
        protectedByAll: true, // Default value is true
      };

      const protectedRouteRegex =
        /protectedRoute\(\s*(?:\[(.*?)\])?\s*(?:,\s*({.*?})\s*)?\)/;
      const protectedMatch = match[0].match(protectedRouteRegex);

      if (protectedMatch) {
        processedModule.protected = true;
        const roles = protectedMatch[1]?.replace(/['"\s]+/g, "").split(",");
        processedModule.protectedBy = roles || [];

        if (protectedMatch[2]) {
          try {
            const options = JSON.parse(protectedMatch[2].replace(/'/g, '"'));
            if (
              "requireAllRoles" in options &&
              options.requireAllRoles === false
            ) {
              processedModule.protectedByAll = false;
            }
          } catch (error) {
            console.error("Error parsing options in protectedRoute:", error);
          }
        }
      }

      processedModules.push(processedModule);
    }
  });

  const endpointsByModule: ModuleEndpoints = {};

  // Process endpoint details from modules.
  processedModules.forEach((module) => {
    const routerFilePath = `${modulesBasePath}${module.name}/router.ts`;
    const routerFileContent = fs.readFileSync(routerFilePath, "utf8");

    // Initialize the module in endpointsByModule
    endpointsByModule[module.name] = {
      description: modules[module.name].description,
      endpoints: [],
    };

    // Extract and map controller names to file paths
    const importRegex = /import\s+{\s*([^}]+)\s*}\s+from\s+'([^']+)'(?:;|$)/g;
    let importMatch;
    const imports: Record<string, string> = {};

    while ((importMatch = importRegex.exec(routerFileContent)) !== null) {
      const [fullMatch, controllerNames, path] = importMatch;
      controllerNames.split(",").forEach((name) => {
        imports[name.trim()] = path;
      });
    }

    // Match methods and extract controller names
    const methodRegex =
      /router\.(get|post|patch|put|delete)\(['"]\/(.*?)['"],\s*(\w+)/g;
    let match;
    while ((match = methodRegex.exec(routerFileContent)) !== null) {
      const [fullMatch, method, route, controllerName] = match;
      const controllerPath = imports[controllerName]; // Map controller name to import path
      endpointsByModule[module.name].endpoints.push({
        route: `/${route}`,
        method: method.toUpperCase() as Method,
        protected: module.protected,
        protectedBy: module.protectedBy,
        controller: {
          name: controllerName,
          path: controllerPath
            ? `${modulesBasePath}${module.name}/${controllerPath}`
            : "",
        },
      });
    }
  });

  // Write output to file
  const filePath = "src/endpoints.json";
  fs.writeFileSync(
    filePath,
    JSON.stringify(endpointsByModule, null, 2),
    "utf8"
  );
};
