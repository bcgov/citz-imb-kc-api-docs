import { QueryParamProperties } from "../types";

export const parseQueryParams = (
  controllerFileContent: string,
  functionString: string,
  modulesBasePath: string
): {
  params: Record<string, QueryParamProperties>;
  schemaName?: string;
  schemaPath?: string;
} => {
  const queryParams: Record<string, QueryParamProperties> = {};

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
    const controllerImportPath = schemaPaths[schemaName];
    return controllerImportPath
      ? `${modulesBasePath}${module}/${controllerImportPath.replace(
          /^\.\//,
          ""
        )}.ts`
      : "";
  };

  // Match direct usage of req.query properties
  const directUsagePattern = /\breq\.query\.(\w+)/g;
  let match;
  while ((match = directUsagePattern.exec(functionString)) !== null) {
    queryParams[match[1]] = { required: true, type: "string" };
  }

  // Match destructured usage of req.query
  const destructuredUsagePattern =
    /(?:const|let|var)\s+\{([^}]+)\}\s*=\s*req\.query/g;
  while ((match = destructuredUsagePattern.exec(functionString)) !== null) {
    const params = match[1]
      .split(",")
      .map((param) => param.trim().split("=")[0]);
    params.forEach((param) => {
      if (param) queryParams[param] = { required: true, type: "string" };
    });
  }

  let schemaName, schemaPath;

  // Match usage of getQuery function with destructuring, capturing the schema name
  const getQueryPattern =
    /const\s+\{([^}]+)\}\s*=\s*getQuery\(\s*req,\s*(\w+)/g;
  while ((match = getQueryPattern.exec(functionString)) !== null) {
    const params = match[1]
      .split(",")
      .map((param) => param.trim().split("=")[0]);
    schemaName = match[2];
    schemaPath = getSchemaPath(schemaName);

    params.forEach((param) => {
      if (param) queryParams[param] = { required: true, type: "string" };
    });
  }

  return { params: queryParams, schemaName, schemaPath };
};
