import fs from "fs";
import { extractSchemaCode } from "./extractSchemaCode";
import { CustomSchemaConfig, QueryParamProperties } from "../types";
import { parseSchemaProperty } from "./parseSchemaProperty";

export const parseSchema = (
  query: {
    params: Record<string, QueryParamProperties>;
    schemaName?: string;
    schemaPath?: string;
  },
  customSchemas: CustomSchemaConfig
) => {
  if (!query.schemaName || !query.schemaPath) return null;

  const schemaFileContent = fs.readFileSync(query.schemaPath, "utf8");

  // Extract schema code from file content
  const schema = extractSchemaCode(schemaFileContent, query.schemaName);

  let params: {
    [param: string]: QueryParamProperties;
  } = {};

  // If queryParams is empty but schemaName and schemaPath are provided,
  // parse the entire schema to extract all query parameters.
  if (Object.keys(query.params).length === 0 && schema) {
    // Assuming the schema is an object with properties, each representing a query parameter
    const schemaProperties = Object.keys(schema);
    schemaProperties.forEach((param) => {
      const properties = parseSchemaProperty(schema, param, customSchemas);
      if (properties) params[param] = properties;
      else {
        // Default to string type if the property type cannot be determined
        params[param] = { required: true, type: "string" };
      }
    });
  } else {
    // Handling provided queryParams
    Object.keys(query.params).forEach((param) => {
      const properties = parseSchemaProperty(schema, param, customSchemas);
      if (properties) params[param] = properties;
      else params[param] = query.params[param];
    });
  }

  return params;
};
