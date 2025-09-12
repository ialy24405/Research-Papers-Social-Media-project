import Joi from "joi";

// Auth validation schemas
export const registerSchema = Joi.object({
	fullName: Joi.string().min(2).max(255).required(),
	email: Joi.string().email().required(),
	password: Joi.string().min(6).required(),
	birthDate: Joi.date().iso().required(),
	collegeName: Joi.string().min(2).max(255).required(),
	country: Joi.string().min(2).max(255).required(),
	ssn: Joi.string().min(5).max(255).required(),
});

export const loginSchema = Joi.object({
	email: Joi.string().email().required(),
	password: Joi.string().required(),
});

// Paper validation schemas
export const paperUploadSchema = Joi.object({
	title: Joi.string().min(3).max(255).required(),
	description: Joi.string().min(10).required(),
	categoryId: Joi.string().required(),
});

export const paperStatusSchema = Joi.object({
	status: Joi.string().valid("approved", "rejected").required(),
	reason: Joi.when("status", {
		is: "rejected",
		then: Joi.string().required(),
		otherwise: Joi.string().optional(),
	}),
});

// Category validation schemas
export const categorySchema = Joi.object({
	id: Joi.string().alphanum().min(2).max(100).required(),
	name: Joi.string().min(2).max(255).required(),
	description: Joi.string().optional(),
	imageUrl: Joi.string().uri().optional(),
	imageHint: Joi.string().max(255).optional(),
});

// Query validation schemas
export const paginationSchema = Joi.object({
	limit: Joi.number().integer().min(1).max(100).default(10),
	offset: Joi.number().integer().min(0).default(0),
});

export const papersQuerySchema = Joi.object({
	status: Joi.string()
		.valid("pending", "approved", "rejected")
		.default("approved"),
	categoryId: Joi.string().optional(),
	authorId: Joi.number().integer().optional(),
	sortBy: Joi.string()
		.valid("createdAt:desc", "createdAt:asc", "title:asc", "title:desc")
		.default("createdAt:desc"),
	limit: Joi.number().integer().min(1).max(100).default(10),
});
