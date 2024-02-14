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

      // Determine if the controllerName is in the customControllers list
      const isCustomController = customControllerNames.includes(controllerName);

      // If controllerName is a custom controller, use the customControllers config
      // Otherwise, use the default logic to determine the controller path
      const controllerConfig = isCustomController
        ? {
            name: controllerName,
            path: "",
            query: customControllers[controllerName]?.query ?? {},
          }
        : {
            name: controllerName,
            path: getControllerPath(controllerName),
          };

      // Push the endpoint configuration for this method
      modules[module].endpoints.push({
        route: routePath,
        method: httpMethod.toUpperCase() as Method,
        description: isCustomController
          ? customControllers[controllerName].description
          : "",
        controller: controllerConfig,
      });
    }

    // Syntax: router.route(...).<method>(...)
    // Normalize the content by removing multiline comments as an example
    const normalizedContent = routerFileContent.replace(
      /\/\*[\s\S]*?\*\//g,
      ""
    );

    // Split the normalized content by 'router.route', considering potential whitespace and line breaks
    const routeBlocks = normalizedContent.split(/\s*router\.route\s*/).slice(1);

    routeBlocks.forEach((block, index) => {
      // Prepend 'router.route' since we split on it, unless the block is empty or whitespace only
      if (!block.trim()) return;

      const fullBlock = `router.route ${block}`;

      // Extract the base route and the chained methods block
      const routeMatch = fullBlock.match(
        /router\.route\s*\(\s*['"]([^'"]+)['"]\s*\)\s*([\s\S]*)/
      );

      if (!routeMatch) return;

      const [, baseRoute, chainedMethods] = routeMatch;

      // Process the chained methods
      const methodMatchRegex = /\.(get|post|patch|put|delete)\(\s*([\w.]+)/g;
      let methodMatch;
      while ((methodMatch = methodMatchRegex.exec(chainedMethods)) !== null) {
        const [_, httpMethod, controllerName] = methodMatch;

        // Determine if the controllerName is in the customControllers list
        const isCustomController =
          customControllerNames.includes(controllerName);

        // Push the endpoint configuration for this method
        modules[module].endpoints.push({
          route: baseRoute,
          method: httpMethod.toUpperCase() as Method,
          description: isCustomController
            ? customControllers[controllerName].description
            : "",
          controller: {
            name: controllerName,
            path: isCustomController ? "" : getControllerPath(controllerName),
            query: isCustomController
              ? customControllers[controllerName]?.query ?? {}
              : {},
          },
        });
      }
    });
  });

  return modules;
};
