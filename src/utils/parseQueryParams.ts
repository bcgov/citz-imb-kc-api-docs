import { QueryParamProperties } from "../types";

export const parseQueryParams = (
  functionString: string
): Record<string, QueryParamProperties> => {
  const queryParams: Record<string, QueryParamProperties> = {};

  // Match direct usage of req.query properties
  const directUsagePattern = /req\.query\.(\w+)/g;
  let match;
  while ((match = directUsagePattern.exec(functionString)) !== null) {
    // Ensure that the matched query param is not part of a variable declaration
    if (!functionString.substring(0, match.index).trim().endsWith("const")) {
      queryParams[match[1]] = { required: true, type: "string" }; // Add the property to the object
    }
  }

  // Match destructured usage of req.query
  const destructuredUsagePattern = /\{([^}]+)\}\s*=\s*req\.query/g;
  while ((match = destructuredUsagePattern.exec(functionString)) !== null) {
    const params = match[1]
      .split(",")
      .map((param) => param.split("=")[0].trim());
    params.forEach(
      (param) => (queryParams[param] = { required: true, type: "string" })
    );
  }

  // Match usage of getQuery function with destructuring
  const getQueryPattern = /const\s+\{([^}]+)\}\s*=\s*getQuery\(/g;
  while ((match = getQueryPattern.exec(functionString)) !== null) {
    const params = match[1]
      .split(",")
      .map((param) => param.split("=")[0].trim());
    params.forEach(
      (param) => (queryParams[param] = { required: true, type: "string" })
    );
  }

  return queryParams;
};
