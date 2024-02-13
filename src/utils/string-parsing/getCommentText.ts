/**
 * Get a description as the text in a single line comment,
 * or the first line of a multi-line comment.
 * @param {string} comment - The comment string to parse.
 * @returns {string}
 */
export const getCommentText = (comment: string) => {
  // Single line comment
  if (comment.startsWith("//")) {
    // Trim the "//" and any leading or trailing spaces
    return comment.replace(/^\/\/\s*/, "").trim();
  }

  // Multi-line comment
  if (comment.startsWith("/**")) {
    // Split the comment block into lines
    const lines = comment.split("\n");
    // Find the first line of text that doesn't start with a "* @"
    const descriptionLine = lines.find(
      (line) =>
        !line.trim().startsWith("* @") &&
        line.trim() !== "/**" &&
        line.trim() !== "*/"
    );
    // Return the description line if found, trimming any leading "*" and spaces
    if (descriptionLine) {
      return descriptionLine
        .trim()
        .replace(/^\*\s*/, "")
        .trim();
    }
  }

  return ""; // Return empty string if no description is found
};
