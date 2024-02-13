const getCommentAboveFunction = (fileContent: string, functionName: string) => {
  // Regex to capture everything before the function definition
  const regexBeforeFunction = new RegExp(
    `([\\s\\S]*?)\\s*(?:export\\s+)?const\\s+${functionName}\\s*=`,
    "m"
  );

  const beforeFunctionMatch = regexBeforeFunction.exec(fileContent);

  if (beforeFunctionMatch) {
    const textBeforeFunction = beforeFunctionMatch[1];

    // Check for single-line comment at the end
    const singleLineCommentMatch = textBeforeFunction.match(/\/\/[^\n]*$/);
    if (singleLineCommentMatch) {
      return singleLineCommentMatch[0].trim();
    }

    // If no single-line comment is found, look for the last occurrence of a multi-line comment
    const multiLineCommentMatches =
      textBeforeFunction.match(/\/\*\*[\s\S]*?\*\//g);
    if (multiLineCommentMatches && multiLineCommentMatches.length > 0) {
      return multiLineCommentMatches[multiLineCommentMatches.length - 1].trim(); // Return the last match
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
