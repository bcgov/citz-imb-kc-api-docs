import fs from "fs";
import { CustomSchemaConfig, ParamProperties } from "../../types";
import { parseSchemaProperty } from "../string-parsing/parseSchemaProperty";
import { getSchemaCode } from "./getSchemaCode";
import { getZodObjectProperties } from "../string-parsing/getZodObjectProperties";

export const parseSchema = (
  query: {
    params: Record<string, ParamProperties>;
    schemaName?: string;
    schemaPath?: string;
  },
  customSchemas: CustomSchemaConfig
) => {
  if (!query.schemaName || !query.schemaPath) return null;

  const schemaFileContent = fs.readFileSync(query.schemaPath, "utf8");

  // Extract schema code from file content
  const schema = getSchemaCode(schemaFileContent, query.schemaName);

  let params: {
    [param: string]: ParamProperties;
  } = {};

  // If queryParams is empty but schemaName and schemaPath are provided,
  // parse the entire schema to extract all query parameters.
  if (Object.keys(query.params).length === 0 && schema) {
    const propertyKeys = getZodObjectProperties(schema);
    if (propertyKeys.length > 0) {
      propertyKeys.forEach((param) => {
        const properties = parseSchemaProperty(schema, param, customSchemas);
        if (properties) params[param] = properties;
        else params[param] = query.params[param];
      });
    }
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
