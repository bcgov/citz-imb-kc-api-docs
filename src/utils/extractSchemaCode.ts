/**
 * Parses file content in the form of a string to extract a given schema.
 */
export const extractSchemaCode = (
  fileContent: string,
  schemaName: string
): string => {
  const schemaPattern = new RegExp(
    `export\\s+const\\s+${schemaName}\\s*=\\s*([^;]+);`,
    "s"
  );

  // Search for the schema in the file content using the regular expression
  const match = fileContent.match(schemaPattern);

  // If a match is found, return the matched schema string
  if (match && match[1]) {
    return match[1].trim();
  } else {
    // If no match is found
    return "";
  }
};
