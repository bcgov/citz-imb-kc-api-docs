import { CustomResponseStatuses } from "../../types";

/**
 * Get status codes from a controller.
 * @param {string} functionCode - The function code to search.
 * @param {CustomResponseStatuses} customResponseStatuses - Custom response statuses to check.
 * @returns {number[]}
 */
export const getStatusCodes = (
  functionCode: string,
  customResponseStatuses: CustomResponseStatuses
): number[] => {
  const statusCodes: number[] = [];
  const statusRegex = /\.status\((\d+)\)/g;
  const customStatusRegex = new RegExp(
    `(${Object.keys(customResponseStatuses).join("|")})`,
    "g"
  );

  let match;

  // Find .status(<code>) instances
  while ((match = statusRegex.exec(functionCode)) !== null) {
    statusCodes.push(parseInt(match[1]));
  }

  // Find custom status codes
  while ((match = customStatusRegex.exec(functionCode)) !== null) {
    const customStatus = match[0];
    if (customResponseStatuses[customStatus] !== undefined) {
      statusCodes.push(customResponseStatuses[customStatus]);
    }
  }

  if (statusCodes.length === 0) return [200];
  return statusCodes;
};
