import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthChecker = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, "Status : OK"));
});

export { healthChecker };
