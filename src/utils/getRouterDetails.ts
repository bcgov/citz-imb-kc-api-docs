import fs from "fs";
import { Method, Modules } from "../types";

/**
 * Gets details from the router for each module.
 * Details include endpoints and their methods.
 */
export const getRouterDetails = (modules: Modules, modulesBasePath: string) => {
  // Process endpoint details from modules.
  Object.keys(modules).forEach((module) => {
    const routerFileContent = fs.readFileSync(
      `${modulesBasePath}${module}/router.ts`,
      "utf8"
    );

    // Match router.<method> syntax in router content
    const methodRegex =
      /router\.(get|post|patch|put|delete)\(['"]\/(.*?)['"],/g;
    let match;
    while ((match = methodRegex.exec(routerFileContent)) !== null) {
      modules[module].endpoints.push({
        route: `/${match[2]}`,
        method: match[1].toUpperCase() as Method,
      });
    }

    // Match router.route().<method> syntax in router content
    const chainedMethodBlockRegex =
      /router\.route\(['"]\/(.*?)['"]\)\.([\s\S]+?)(?=\n|router|$)/g;
    while ((match = chainedMethodBlockRegex.exec(routerFileContent)) !== null) {
      const baseRoute = match[1];
      const chainedMethods = match[2].match(/(get|post|patch|put|delete)\(/g);
      if (chainedMethods) {
        chainedMethods.forEach((method) => {
          method = method.replace("(", "");
          modules[module].endpoints.push({
            route: `/${baseRoute}`,
            method: method.toUpperCase() as Method,
          });
        });
      }
    }
  });

  return modules;
};
