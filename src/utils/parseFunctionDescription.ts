const getCommentAboveFunction = (fileContent: string, functionName: string) => {
  // First, try to find a single-line comment directly above the function definition
  let regexSingleLine = new RegExp(
    `(?:^|\\n)\\s*(\\/\\/[^\\n]*)\\n\\s*(?:export\\s+)?const\\s+${functionName}\\s*=`,
    "m"
  );
  let match = regexSingleLine.exec(fileContent);

  if (match && match[1]) {
    // If a single-line comment is found, return it
    return match[1].trim();
  } else {
    // Try to match multi-line comment
    let regexMultiLine = new RegExp(
      `([\\s\\S]*?)(\\/\\*\\*[^]*?\\*\\/\\s*)?(?:export\\s+)?const\\s+${functionName}\\s*=`,
      "m"
    );

    let match = regexMultiLine.exec(fileContent);

    if (match && match[2]) {
      // If a comment block is found directly before the function, return it
      return match[2].trim();
    }
  }

  // If no comment is found, return an empty string
  return "";
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
    `\nComment for ${functionName}: `,
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
