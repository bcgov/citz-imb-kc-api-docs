import fs from "fs";
import { extractSchemaCode } from "./extractSchemaCode";
import { CustomSchemaConfig, QueryParamProperties } from "../types";
import { parseSchemaProperty } from "./parseSchemaProperty";

const extractObjectKeys = (schema: string): string[] => {
  // Attempt to match the content within z.object({...})
  const regex = /z\.object\((\{[\s\S]*?\}\s*\))/m;

  const match = schema.match(regex);
  if (!match) return [];

  // Extract the matched object literal, including the first level of closing brace
  let objectLiteral = match[1];

  // Simplify the object literal for JSON parsing by replacing complex values with null
  objectLiteral = objectLiteral.replace(/:\s*[^,}\n]+/g, ": null");

  try {
    // Parse the simplified object literal as JSON
    const parsedObject = JSON.parse(objectLiteral);
    // Return the keys from the parsed object
    return Object.keys(parsedObject);
  } catch (error) {
    console.error("Error parsing object keys:", error);
    return [];
  }
};

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
    // console.log(
    //   `Properties of ${query.schemaName}: `,
    //   extractObjectKeys(schema)
    // );
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
