export const parseFunctionDescription = (
  fileContent: string,
  functionName: string
) => {
  // Combined pattern for block comments or single-line comments
  const commentPattern = new RegExp(
    `(\\/\\*\\*([\\s\\S]*?)\\*\\/|\\/\\/\\s*(.*))\\s*\\n\\s*(?:export\\s+const\\s+)?${functionName}\\s*=`,
    "gm"
  );

  let description = ""; // Initialize description variable

  // Array to hold all matches to find the last (closest) match
  const matches = [...fileContent.matchAll(commentPattern)];

  if (matches.length > 0) {
    // Use the last (closest) match
    const lastMatch = matches[matches.length - 1];
    const blockCommentContent = lastMatch[2]; // Group 2 captures block comments
    const singleLineCommentContent = lastMatch[3]; // Group 3 captures single-line comments

    if (blockCommentContent) {
      // Process block comment
      const lines = blockCommentContent.split("\n").map((line) => line.trim());
      const descriptionLine = lines.find(
        (line) => line && !line.match(/^(\*|@|\s*$)/)
      );

      if (descriptionLine) {
        description = descriptionLine.replace(/^\*+/, "").trim();
      }
    } else if (singleLineCommentContent) {
      // Use single-line comment content as description
      description = singleLineCommentContent.trim();
    }
  }

  return ""; // Return empty string if no description is found
};
