/**
 * Get object keys from a z.object in a schema.
 * @param schema - The schema string to search.
 * @returns {string[]}
 */
export const getZodObjectProperties = (schema: string): string[] => {
  // Check if the schema includes ".object"
  if (!schema.trim().includes(".object")) return [];

  // Extract the object definition
  const startIndex = schema.indexOf("{");
  const endIndex = schema.indexOf("}", startIndex) + 1; // Start search from startIndex to find the corresponding '}'

  if (startIndex === 0 || endIndex === -1) return []; // Return empty if '{' or '}' not found
  let objectBody = schema.substring(startIndex, endIndex).trim();

  // Set each property's value to null
  objectBody = objectBody.replace(/:\s*[^,]+/g, ": null");

  // Remove trailing commas before a closing brace
  objectBody = objectBody.replace(/,(\s*})/g, "$1");

  // Ensuring the string is JSON-compliant by adding double quotes around property names
  let jsonCompliantString = `${objectBody.replace(/(\w+)(?=\s*:)/g, '"$1"')}`;

  // Replace sequences of whitespace characters longer than 1 with an empty string
  jsonCompliantString = jsonCompliantString.replace(/\s{2,}/g, "");

  // Replace newline characters with an empty string
  jsonCompliantString = jsonCompliantString.replace(/\r?\n/g, "");

  // Parse the modified string into an object
  let parsedObject;
  try {
    parsedObject = JSON.parse(jsonCompliantString);
  } catch (e) {
    throw new Error(
      "Failed to parse the modified schema string into an object."
    );
  }

  // Extract and return the keys
  return Object.keys(parsedObject);
};
