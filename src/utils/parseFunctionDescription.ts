export const parseFunctionDescription = (
  fileContent: string,
  functionName: string
) => {
  const multiLineRegex = new RegExp(
    `\\/\\*\\*([\\s\\S]*?)\\*\\/\\s*(export const|const) ${functionName}\\b`,
    "m"
  );
  const singleLineRegex = new RegExp(
    `//\\s*(.*?)\\s*\\n\\s*(export const|const) ${functionName}\\b`,
    "m"
  );

  let description;

  // Check multiline comments
  const multiMatch = fileContent.match(multiLineRegex);
  if (multiMatch && multiMatch[1]) {
    const commentContent = multiMatch[1];
    const descriptionLine = commentContent
      .split("\n")
      .find(
        (line) => line.trim().startsWith("*") && !line.trim().startsWith("* @")
      );
    description = descriptionLine?.replace(/\* /, "").trim();
  }

  // Check single-line comments if no multiline comment was found
  if (!description) {
    const singleMatch = fileContent.match(singleLineRegex);
    if (singleMatch && singleMatch[1]) {
      description = singleMatch[1].trim();
    }
  }

  return ""; // Return empty string if no description is found
};
