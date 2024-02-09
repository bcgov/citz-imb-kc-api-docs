import fs from "fs";
import { CustomControllerConfig, Method, Modules } from "../types";

/**
 * Gets details from the router for each module,
 * including endpoints, their methods, and associated controllers
 * with dynamic paths based on controller names.
 */
export const getRouterDetails = (
  modules: Modules,
  modulesBasePath: string,
  customControllers: CustomControllerConfig
) => {
  Object.keys(modules).forEach((module) => {
    const routerFileContent = fs.readFileSync(
      `${modulesBasePath}/${module}/router.ts`,
      "utf8"
    );

    const customControllerNames = Object.keys(customControllers);

    // Initialize a map to hold controller names and their import paths
    const controllerPaths: { [key: string]: string } = {};

    // Extract all import statements
    const importRegex = /import\s+{([^}]+)}\s+from\s+['"](.+?)['"]/g;
    let importMatch;
    while ((importMatch = importRegex.exec(routerFileContent)) !== null) {
      const importedItems = importMatch[1]
        .split(",")
        .map((item) => item.trim());
      const importPath = importMatch[2];
      importedItems.forEach((item) => {
        // Handle alias imports, e.g., { originalName as aliasName }
        const aliasMatch = item.match(/(\w+)\s+as\s+(\w+)/);
        if (aliasMatch) {
          controllerPaths[aliasMatch[2]] = importPath;
        } else {
          controllerPaths[item] = importPath;
        }
      });
    }

    // Function to determine the path for a controller name
    const getControllerPath = (controllerName: string) => {
      const controllerImportPath = controllerPaths[controllerName];
      return controllerImportPath
        ? `${modulesBasePath}/${module}/${controllerImportPath.replace(
            /^\.\//,
            ""
          )}.ts`
        : "";
    };

    // Syntax: router.<method>(...)
    const methodRegex =
      /router\.(get|post|patch|put|delete)\(['"]([^'"]+)['"],\s*([\w.]+)/g;
    let match;
    while ((match = methodRegex.exec(routerFileContent)) !== null) {
      const [_, httpMethod, routePath, controllerName] = match;

      if (customControllerNames.includes(controllerName)) {
        // Controller name is included in customControllers config.
        modules[module].endpoints.push({
          route: routePath,
          method: httpMethod.toUpperCase() as Method,
          description: customControllers[controllerName].description,
          controller: {
            name: controllerName,
            path: "",
            query: customControllers[controllerName]?.query ?? {},
          },
        });
      } else {
        // Else
        modules[module].endpoints.push({
          route: routePath,
          method: httpMethod.toUpperCase() as Method,
          controller: {
            name: controllerName,
            path: getControllerPath(controllerName),
          },
        });
      }
    }

    // Syntax: router.route(...).<method>(...)
    const routeRegex =
      /router\.route\(['"]([^'"]+)['"]\)\.([\s\S]+?)(?=\n\s*router|$)/g;
    while ((match = routeRegex.exec(routerFileContent)) !== null) {
      const baseRoute = match[1];
      const methodBlock = match[2];
      const methodMatchRegex = /(get|post|patch|put|delete)\(\s*(\w+)/g;
      let methodMatch;
      while ((methodMatch = methodMatchRegex.exec(methodBlock)) !== null) {
        const [_, httpMethod, controllerName] = methodMatch;
        if (customControllerNames.includes(controllerName)) {
          // Controller name is included in customControllers config.
          modules[module].endpoints.push({
            route: baseRoute,
            method: httpMethod.toUpperCase() as Method,
            description: customControllers[controllerName].description,
            controller: {
              name: controllerName,
              path: "",
              query: customControllers[controllerName]?.query ?? {},
            },
          });
        } else {
          // Else
          modules[module].endpoints.push({
            route: baseRoute,
            method: httpMethod.toUpperCase() as Method,
            controller: {
              name: controllerName,
              path: getControllerPath(controllerName),
            },
          });
        }
      }
    }
  });

  return modules;
};
