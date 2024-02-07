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

  Object.keys(query.params).forEach((param) => {
    const properties = parseSchemaProperty(schema, param, customSchemas);
    if (properties) params[param] = properties;
    else params[param] = query.params[param];
  });

  return params;
};
