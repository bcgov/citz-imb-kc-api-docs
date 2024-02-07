/**
 * Parses file content in the form of a string to extract a given function.
 */
export const extractFunctionCode = (
  fileContent: string,
  functionName: string
): string => {
  // Matches standalone function or class method
  const functionPattern = new RegExp(
    // Match standalone function
    `(const\\s+${functionName}\\s*=\\s*[^{]*{[^]*?\\n})` +
      // Or match class method
      `|((this\\.)?${functionName}\\s*=\\s*[^{]*{[^]*?\\n})`,
    "s"
  );

  // Search for the function or method in the file content using the regular expression
  const match = fileContent.match(functionPattern);

  // If a match is found, return the matched text, which is the function code or method code
  if (match) {
    return match[1] || match[2]; // Return the first non-null capturing group
  } else {
    // If no match is found
    return "";
  }
};
