/**
 * Get a single or multi-line comment directly above a function.
 * @param {string} fileContent - File content to search.
 * @param {string} functionName - Function to search for.
 * @returns {string}
 */
export const getCommentAboveFunction = (
  fileContent: string,
  functionName: string
) => {
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
