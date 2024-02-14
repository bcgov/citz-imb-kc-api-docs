import { CustomSchemaConfig, ParamProperties } from "../../types";

export const parseSchemaProperty = (
  schemaString: string,
  propertyName: string,
  customSchemas: CustomSchemaConfig
): ParamProperties | undefined => {
  // Regex to match standard zod types
  const standardPattern = new RegExp(
    `${propertyName}\\s*:\\s*z\\.(string|number|boolean)(\\(\\))?\\.?(optional)?\\(\\)?`,
    "s"
  );

  const standardMatch = schemaString.match(standardPattern);
  if (standardMatch) {
    const type = standardMatch[1] as "string" | "number" | "boolean";
    const required = !standardMatch[3]; // If 'optional' is captured, the property is not required
    return {
      required,
      type,
    };
  }

  // Attempt to match each custom schema pattern
  for (const pattern in customSchemas) {
    const escapedPattern = pattern
      .replace(/\./g, "\\.")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");
    const regexString = `${propertyName}\\s*:\\s*${escapedPattern}\\(`;
    const customPattern = new RegExp(regexString, "s");

    const customMatch = schemaString.match(customPattern);
    if (customMatch) {
      return customSchemas[pattern];
    }
  }
};
