export const parseFunctionDescription = (
  fileContent: string,
  functionName: string
) => {
  // Pattern to match block comments or single-line comments above the function declaration
  const pattern = new RegExp(
    `\\/\\*\\*\\s*\\*\\s*([^\\n\\r]+).*?\\*\\/\\s*(export\\s+)?const\\s+${functionName}\\s*=|\\/\\/\\s*([^\\n\\r]+)\\s*\\n\\s*(export\\s+)?const\\s+${functionName}\\s*=`,
    "gms"
  );

  const matches = [...fileContent.matchAll(pattern)];

  if (matches.length > 0) {
    // Use the last (closest) match
    const lastMatch = matches[matches.length - 1];
    const blockCommentContent = lastMatch[2]; // Group 2 captures block comment content
    const singleLineCommentContent = lastMatch[3]; // Group 3 captures single-line comment content

    if (blockCommentContent) {
      // Process block comment
      const lines = blockCommentContent.split("\n");
      // Find the first line that is likely descriptive, ignoring lines that only contain '*', are annotations, or are empty
      const descriptionLine = lines.find(
        (line) => line.match(/^\s*\*\s+.+/) && !line.match(/^\s*\*\s+@/)
      );

      if (descriptionLine) {
        // Remove leading '*', whitespace, and return the description line
        return descriptionLine.replace(/^\s*\*\s+/, "").trim();
      }
    } else if (singleLineCommentContent) {
      // Use single-line comment content as description
      return singleLineCommentContent.trim();
    }
  }

  return ""; // Return empty string if no description is found
};
