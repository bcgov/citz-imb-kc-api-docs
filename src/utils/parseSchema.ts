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
    // Pattern to match the z.object content
    const zObjectPattern = /z\.object\((\{[\s\S]*?\})\)/;
    const match = zObjectPattern.exec(schema);

    if (match && match[1]) {
      // Extracting properties from the matched z.object content
      const propertiesContent = match[1];
      // Match all the keys in the object
      const propertyPattern = /(\w+):/g;
      let propertiesMatch;
      let propertyNames: string[] = [];

      while (
        (propertiesMatch = propertyPattern.exec(propertiesContent)) !== null
      ) {
        propertyNames.push(propertiesMatch[1]);
      }

      // Console log all properties
      console.log(`Properties of ${query.schemaName}: `, propertyNames);
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
