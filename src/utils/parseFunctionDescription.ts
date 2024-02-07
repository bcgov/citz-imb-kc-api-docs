export const parseFunctionDescription = (
  fileContent: string,
  functionName: string
) => {
  // Pattern captures the entire comment block immediately preceding the function declaration
  const pattern = new RegExp(
    `\\/\\*\\*([\\s\\S]*?)\\*\\/\\s*export\\s+const\\s+${functionName}\\s*=`,
    "gm"
  );

  const matches = [...fileContent.matchAll(pattern)];

  if (matches.length > 0) {
    // Extract the last match (in case there are multiple matches for the function name)
    const lastMatch = matches[matches.length - 1][1];

    // Split the comment block into lines and trim each line
    const lines = lastMatch.split("\n").map((line) => line.trim());

    // Find the first non-empty line that does not start with '*' or '@'
    const descriptionLine = lines.find(
      (line) => line && !line.startsWith("*") && !line.startsWith("@")
    );

    if (descriptionLine) {
      // Clean up the description line by removing leading '*' and trimming
      return descriptionLine.replace(/^\*+/, "").trim();
    }
  }

  return ""; // Return empty string if no description is found
};
