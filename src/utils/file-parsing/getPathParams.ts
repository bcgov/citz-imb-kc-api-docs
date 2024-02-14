import path from "path";
import { ParamProperties } from "../../types";

/**
 * Get path params, schema name and path from a controller file content.
 * @param {string} controllerFileContent - File content to search.
 * @param {string} functionCode - Function code to search.
 * @param {string} controllerPath - Path of controller file.
 * @returns { params: Record<string, ParamProperties>, schemaName: string, schemaPath: string }
 */
export const getPathParams = (
  controllerFileContent: string,
  functionCode: string,
  controllerPath: string
): {
  params: Record<string, ParamProperties>;
  schemaName?: string;
  schemaPath?: string;
} => {
  const pathParams: Record<string, ParamProperties> = {};

  // Initialize a map to hold schema names and their import paths
  const schemaPaths: { [key: string]: string } = {};

  // Extract all import statements
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"](.+?)['"]/g;
  let importMatch;
  while ((importMatch = importRegex.exec(controllerFileContent)) !== null) {
    const importedItems = importMatch[1].split(",").map((item) => item.trim());
    const importPath = importMatch[2];
    importedItems.forEach((item) => {
      // Handle alias imports, e.g., { originalName as aliasName }
      const aliasMatch = item.match(/(\w+)\s+as\s+(\w+)/);
      if (aliasMatch) {
        schemaPaths[aliasMatch[2]] = importPath;
      } else {
        schemaPaths[item] = importPath;
      }
    });
  }

  // Function to determine the path for a schema name
  const getSchemaPath = (schemaName: string) => {
    const schemaImportPath = schemaPaths[schemaName];
    return schemaImportPath
      ? path.resolve(
          path.dirname(controllerPath),
          `${schemaImportPath.replace(/^\.\//, "")}.ts`
        )
      : "";
  };

  // Match direct usage of req.params properties
  // // (ex: const name = req.params.name;)
  const directUsagePattern = /\breq\.params\.(\w+)/g;
  let match;
  while ((match = directUsagePattern.exec(functionCode)) !== null) {
    pathParams[match[1]] = { required: true, type: "string" };
  }

  // Match destructured usage of req.params
  // (ex: const { id, name } = req.params;)
  const destructuredUsagePattern =
    /(?:const|let|var)\s+\{([^}]+)\}\s*=\s*req\.params/g;
  while ((match = destructuredUsagePattern.exec(functionCode)) !== null) {
    const params = match[1]
      .split(",")
      .map((param) => param.trim().split("=")[0]);
    params.forEach((param) => {
      if (param) pathParams[param] = { required: true, type: "string" };
    });
  }

  let schemaName, schemaPath;

  // Match usage of getParams function with destructuring, capturing the schema name
  // (ex: const { id, name } = getParams(req, schema);)
  const getParamsPattern =
    /const\s+\{([^}]+)\}\s*=\s*getParams\(\s*req,\s*(\w+)/g;
  while ((match = getParamsPattern.exec(functionCode)) !== null) {
    const params = match[1]
      .split(",")
      .map((param) => param.trim().split("=")[0]);
    schemaName = match[2];
    schemaPath = getSchemaPath(schemaName);

    params.forEach((param) => {
      if (param) pathParams[param] = { required: true, type: "string" };
    });
  }

  // Match non-destructured usage of getParams
  // (ex: const user = getParams(req, schema);)
  const nonDestructuredPattern =
    /const\s+(\w+)\s*=\s*getParams\(\s*req,\s*(\w+)/g;
  let nonDestructuredMatch = nonDestructuredPattern.exec(functionCode);
  if (nonDestructuredMatch) {
    schemaName = nonDestructuredMatch[2];
    schemaPath = getSchemaPath(schemaName);
    // pathParams are not added because they are unknown
  }

  return { params: pathParams, schemaName, schemaPath };
};
