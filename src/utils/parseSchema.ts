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
    const schemaPattern = /z\.object\s*\(\s*\{\s*([\s\S]*?)\s*\}\s*\)/;
    const match = schemaPattern.exec(schema);

    if (match) {
      // Extract the properties string from the match
      const propertiesString = match[1];

      // Regular expression to match property names within the schema
      // Looks for any word character sequences that are preceded by a space (or start of line) and followed by a colon
      const propertyRegex = /(\w+)\s*:\s*/g;
      let propertiesMatch;
      const schemaProperties = [];

      // Use the regex to find all matches for property names within the properties string
      while (
        (propertiesMatch = propertyRegex.exec(propertiesString)) !== null
      ) {
        schemaProperties.push(propertiesMatch[1]); // Add the property name to the schemaProperties array
      }

      // Process each property found by the regex
      schemaProperties.forEach((param) => {
        const properties = parseSchemaProperty(schema, param, customSchemas);
        if (properties) {
          params[param] = properties;
        } else {
          // Default to string type if the property type cannot be determined
          params[param] = { required: true, type: "string" };
        }
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
