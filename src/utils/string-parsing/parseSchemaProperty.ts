import { CustomSchemaConfig, ParamProperties } from "../../types";

export const parseSchemaProperty = (
  schemaString: string,
  propertyName: string,
  customSchemas: CustomSchemaConfig
): ParamProperties | undefined => {
  // Remove newlines for easier parsing
  let schemaStringNormalized = schemaString.replace(/[\r\n]+/g, "");
  // Remove leading, trailing, and consecutive spaces while preserving single spaces between words
  schemaStringNormalized = schemaStringNormalized.replace(/\s+/g, " ").trim();

  // Regular expression to match the pattern: propertyName:<capturedString>,
  const pattern = new RegExp(`${propertyName}:([^,]+)`);
  const match = schemaStringNormalized.match(pattern);

  // If a match is found, the captured group (1) contains the desired string
  if (match && match[1]) {
    const paramDetails = match[1];
    let param: ParamProperties = {
      required: true,
      type: "string",
      description: "",
    };

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
    const describePattern = /\.describe\((`([^`]*)`|'([^']*)'|"([^"]*)")\)/;
    const describeMatch = paramDetails.match(describePattern);
    // If a match is found, the captured group for the correct quote type contains the description text
    if (describeMatch)
      param.description =
        describeMatch[2] || describeMatch[3] || describeMatch[4];

    return param;
  }
};
