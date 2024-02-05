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

    // Match router.<method> syntax in router content and capture the controller
    const methodRegex =
      /router\.(get|post|patch|put|delete)\(['"]\/(.*?)['"],\s*(.*?)\)/g;
    let match;
    while ((match = methodRegex.exec(routerFileContent)) !== null) {
      modules[module].endpoints.push({
        route: `/${match[2]}`,
        method: match[1].toUpperCase() as Method,
        controller: {
          name: match[3].trim(),
          path: "",
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
            modules[module].endpoints.push({
              route: `/${baseRoute}`,
              method: methodParts[1].toUpperCase() as Method,
              controller: {
                name: methodParts[2].trim(),
                path: "",
              },
            });
          }
        });
      }
    }
  });

  return modules;
};
