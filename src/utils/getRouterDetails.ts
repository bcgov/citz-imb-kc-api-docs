import fs from "fs";
import { Method, Modules } from "../types";

/**
 * Gets details from the router for each module.
 * Details include endpoints, their methods, and associated controllers.
 */
export const getRouterDetails = (modules: Modules, modulesBasePath: string) => {
  // Process endpoint details from modules.
  Object.keys(modules).forEach((module) => {
    const routerFileContent = fs.readFileSync(
      `${modulesBasePath}${module}/router.ts`,
      "utf8"
    );

    // Parse import statements to map controller names to their paths
    const importRegex = /import\s+{\s*(.*?)\s*}\s*from\s*['"](.*?)['"]/g;
    let importsMatch;
    const controllerPaths: { [key: string]: string } = {};
    while ((importsMatch = importRegex.exec(routerFileContent)) !== null) {
      const [_, controllerNames, importPath] = importsMatch;
      controllerNames.split(",").forEach((name) => {
        controllerPaths[name.trim()] = importPath;
      });
    }

    // Match router.<method> syntax in router content and capture the controller
    const methodRegex =
      /router\.(get|post|patch|put|delete)\(['"]\/(.*?)['"],\s*(.*?)\)/g;
    let match;
    while ((match = methodRegex.exec(routerFileContent)) !== null) {
      const controllerName = match[3].trim();
      const path = controllerName.startsWith("dataController")
        ? `${modulesBasePath}common/controller/controller.class.ts`
        : `${modulesBasePath}${module}/${
            controllerPaths[controllerName] || "controller"
          }`;

      modules[module].endpoints.push({
        route: `/${match[2]}`,
        method: match[1].toUpperCase() as Method,
        controller: {
          name: controllerName,
          path: path.replace("./", ""), // Remove './' to avoid relative path issues
        },
      });
    }

    // Match router.route().<method> syntax in router content and capture the controller
    const chainedMethodBlockRegex =
      /router\.route\(['"]\/(.*?)['"]\)\.([\s\S]+?)(?=\n|router|$)/g;
    while ((match = chainedMethodBlockRegex.exec(routerFileContent)) !== null) {
      const baseRoute = match[1];
      const chainedMethods = match[2].match(
        /(get|post|patch|put|delete)\(\s*(.*?)(,|\))/g
      );
      if (chainedMethods) {
        chainedMethods.forEach((method) => {
          const methodParts =
            /(get|post|patch|put|delete)\(\s*(.*?)(,|\))/g.exec(method);
          if (methodParts) {
            const controllerName = methodParts[2].trim();
            const path = controllerName.startsWith("dataController")
              ? `${modulesBasePath}common/controller/controller.class.ts`
              : `${modulesBasePath}${module}/${
                  controllerPaths[controllerName] || "controller"
                }`;

            modules[module].endpoints.push({
              route: `/${baseRoute}`,
              method: methodParts[1].toUpperCase() as Method,
              controller: {
                name: controllerName,
                path: path.replace("./", ""), // Remove './' to avoid relative path issues
              },
            });
          }
        });
      }
    }
  });

  return modules;
};
