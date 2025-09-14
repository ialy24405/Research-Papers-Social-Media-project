// Main API service exports
export { authService } from "./auth.service";
export { categoryService } from "./category.service";
export { paperService } from "./paper.service";
export { userService } from "./user.service";
export { adminService } from "./admin.service";

// HTTP client and config
export { httpClient } from "./client";
export { API_CONFIG, API_ENDPOINTS } from "./config";

// Types
export type { ApiResponse, ApiError } from "./client";
export type { PapersListParams, PaperDetails } from "./paper.service";
export type { AdminUser, AdminPaper } from "./admin.service";
