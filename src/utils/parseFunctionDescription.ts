export const parseFunctionDescription = (
  fileContent: string,
  functionName: string
) => {
  // Pattern for block comments
  const blockCommentPattern = new RegExp(
    `\\/\\*\\*([\\s\\S]*?)\\*\\/\\s*(?:export\\s+const\\s+)?${functionName}\\s*=`,
    "gm"
  );
  // Pattern for single-line comments
  const singleLineCommentPattern = new RegExp(
    `\\/\\/\\s*(.*?)\\s*\\n\\s*(?:export\\s+const\\s+)?${functionName}\\s*=`,
    "gm"
  );

  let description = ""; // Initialize description variable

  // First, try to match block comments
  const blockMatches = [...fileContent.matchAll(blockCommentPattern)];

  if (blockMatches.length > 0) {
    const lastMatch = blockMatches[blockMatches.length - 1][1];
    const lines = lastMatch.split("\n").map((line) => line.trim());
    const descriptionLine = lines.find(
      (line) => line && !line.match(/^(\*|@|\s*$)/)
    );

    if (descriptionLine) {
      description = descriptionLine.replace(/^\*+/, "").trim();
    }
  }

  // If no description has been found in block comments, try single-line comments
  if (!description) {
    const singleLineMatches = [
      ...fileContent.matchAll(singleLineCommentPattern),
    ];
    if (singleLineMatches.length > 0) {
      // Take the match closest to the function
      description = singleLineMatches[singleLineMatches.length - 1][1].trim();
    }
  }

  return ""; // Return empty string if no description is found
};
