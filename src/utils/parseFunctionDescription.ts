export const parseFunctionDescription = (
  fileContent: string,
  functionName: string
) => {
  // Pattern to match a block comment above the function declaration
  const pattern = new RegExp(
    `\\/\\*\\*([\\s\\S]*?)\\*\\/\\s*(?:export\\s+const\\s+)?${functionName}\\s*=`,
    "gm"
  );

  const matches = [...fileContent.matchAll(pattern)];

  if (matches.length > 0) {
    // Extract the last match (in case there are multiple matches for the function name)
    const lastMatch = matches[matches.length - 1][1];

    // Split the comment block into lines and trim each line
    const lines = lastMatch.split("\n").map((line) => line.trim());

    // Find the first descriptive line of the comment, ignoring lines with only '*', '@' annotations, or empty lines
    const descriptionLine = lines.find(
      (line) => line && !line.match(/^(\*|@|\s*$)/)
    );

    if (descriptionLine) {
      // Clean up the description line by removing leading '*' and trimming
      return descriptionLine.replace(/^\*+/, "").trim();
    }
  }

  return ""; // Return empty string if no description is found
};
