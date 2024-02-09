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
    // Pattern to match the content inside z.object({...})
    const schemaPattern = /z\.object\(\{([\s\S]*?)\}\)/;
    const match = schemaPattern.exec(schemaFileContent);

    if (match) {
      // Extract the properties string from the match, removing all newline characters
      const propertiesString = match[1].replace(/\s+/g, " ");

      // Split the string by commas to get individual properties
      const schemaProperties = propertiesString.split(/,(?=[^,]*?:)/);

      schemaProperties.forEach((prop) => {
        // Extract the key for each property
        const [key] = prop.split(/:\s*/);

        // Clean up the key
        const param = key.trim();

        const properties = parseSchemaProperty(schema, param, customSchemas);
        if (properties) params[param] = properties;
        else params[param] = { required: true, type: "string" };
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
