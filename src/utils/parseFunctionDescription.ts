const getCommentAboveFunction = (fileContent: string, functionName: string) => {
  // Regex to find either a single-line comment or a multi-line comment block directly above a function
  // This version is more restrictive to ensure no unrelated lines are captured between the comment and the function
  const regex = new RegExp(
    `(?:^|\\n\\s*\\n)(\\/\\/[^\\n]*\\n)?\\s*(\\/\\*[\\s\\S]*?\\*\\/)?\\s*(?:export\\s+)?const\\s+${functionName}\\s*=`,
    "m"
  );

  // Execute the regex on the file content
  const match = regex.exec(fileContent);

  // Determine which comment type was found, if any, and return it
  const comment = match
    ? match[1] || match[2]
      ? (match[1] || match[2]).trim()
      : ""
    : "";

  return comment;
};

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

  console.log(
    `Comment for ${functionName}: `,
    getCommentAboveFunction(fileContent, functionName)
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
