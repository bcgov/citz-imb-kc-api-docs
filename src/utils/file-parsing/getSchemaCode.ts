/**
 * Get the schema code from file content given a schema name.
 * @param {string} fileContent - The file content to search.
 * @param {string} schemaName - The schema name to search for.
 * @returns {string}
 */
export const getSchemaCode = (
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
