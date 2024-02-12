import fs from "fs";
import { extractSchemaCode } from "./extractSchemaCode";
import { CustomSchemaConfig, QueryParamProperties } from "../types";
import { parseSchemaProperty } from "./parseSchemaProperty";

const extractObjectKeys = (schema: string): string[] => {
  // Regular expression to match the object literal part of the schema
  const regex = /z\.object\((\{[\s\S]*?\})\)/m;

  // Find the object literal in the schema string
  const match = schema.match(regex);
  if (!match) return [];

  console.log(`Match: `, match);

  // Extract the object literal string
  let objectLiteral = match[1];

  // Replace property value with valid JSON for parsing
  objectLiteral = objectLiteral.replace(/:\s*[^,}]+(?=,|})/g, ": null");

  // Attempt to parse the modified string as JSON
  try {
    const parsedObject = JSON.parse(objectLiteral);

    // Return the keys of the parsed object
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
    console.log(
      `Properties of ${query.schemaName}: `,
      extractObjectKeys(schema)
    );
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
