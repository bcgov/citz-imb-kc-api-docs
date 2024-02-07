import { QueryParamProperties } from "../types";

export const parseQueryParams = (
  functionString: string
): Record<string, QueryParamProperties> => {
  const queryParams: Record<string, QueryParamProperties> = {};

  // Match direct usage of req.query properties
  const directUsagePattern = /req\.query\.(\w+)/g;
  let match;
  while ((match = directUsagePattern.exec(functionString)) !== null) {
    queryParams[match[1]] = { required: true, type: "string" }; // Add the property to the object
  }

  // Match destructured usage of req.query
  const destructuredUsagePattern = /\{([^}]+)\}\s*=\s*req\.query/g;
  while ((match = destructuredUsagePattern.exec(functionString)) !== null) {
    // Split the matched string by commas and clean up any whitespace or destructuring defaults
    const params = match[1]
      .split(",")
      .map((param) => param.split("=")[0].trim());
    params.forEach((param) => {
      queryParams[param] = { required: true, type: "string" }; // Add each param to the object
    });
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
