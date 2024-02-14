import { CustomSchemaConfig, ParamProperties } from "../../types";

export const parseSchemaProperty = (
  schemaString: string,
  propertyName: string,
  customSchemas: CustomSchemaConfig
): ParamProperties | undefined => {
  // Remove newline and spaces for easier parsing
  const schemaStringNormalized = schemaString
    .replace(/[\r\n]+/g, " ")
    .replaceAll(" ", "");

  // Regular expression to match the pattern: propertyName:<capturedString>,
  const pattern = new RegExp(`${propertyName}:([^,]+)`);
  const match = schemaStringNormalized.match(pattern);

  // If a match is found, the captured group (1) contains the desired string
  if (match && match[1]) {
    const paramDetails = match[1];
    let param: ParamProperties = { required: true, type: "string" };

    // Check if custom schema is used
    for (const pattern in customSchemas) {
      if (paramDetails.includes(pattern)) param = customSchemas[pattern];
    }

    // Check optional
    if (paramDetails.includes(".optional")) param.required = false;

    // Check types
    if (paramDetails.includes(".string")) param.type = "string";
    if (paramDetails.includes(".number")) param.type = "number";
    if (paramDetails.includes(".boolean")) param.type = "boolean";

    // Check describe
    const describePattern = /\.describe\(`([^`]*)`\)/;
    const describeMatch = paramDetails.match(describePattern);
    // If a match is found, the captured group (1) contains the description text
    if (describeMatch && describeMatch[1]) param.description = describeMatch[1];

    return param;
  }
};
