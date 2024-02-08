export const parseFunctionDescription = (
  fileContent: string,
  functionName: string
) => {
  // Pattern to match block comments or single-line comments above the function declaration
  const pattern = new RegExp(
    `(\\/\\*\\*([\\s\\S]*?)\\*\\/|\\/\\/\\s*(.*))\\s*\\n\\s*(?:export\\s+const\\s+)?${functionName}\\s*=`,
    "gm"
  );

  const matches = [...fileContent.matchAll(pattern)];

  if (matches.length > 0) {
    // Use the last (closest) match
    const lastMatch = matches[matches.length - 1];
    const blockCommentContent = lastMatch[2]; // Group 2 captures block comment content
    const singleLineCommentContent = lastMatch[3]; // Group 3 captures single-line comment content

    if (blockCommentContent) {
      // Process block comment
      const lines = blockCommentContent.split("\n").map((line) => line.trim());
      const descriptionLine = lines.find(
        (line) => line && !line.match(/^(\*|@|\s*$)/)
      );

      if (descriptionLine) {
        return descriptionLine.replace(/^\*+/, "").trim(); // Clean up and return the description line
      }
    } else if (singleLineCommentContent) {
      // Use single-line comment content as description
      return singleLineCommentContent.trim();
    }
  }

  return ""; // Return empty string if no description is found
};
