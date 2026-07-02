import { z } from 'zod';

export const categorySchema = z.object({
	id: z.string().uuid().optional(),
	name: z.string().trim().min(1, 'Name is required').max(100, 'Too long'),
	slug: z
		.string()
		.trim()
		.min(1, 'Slug is required')
		.max(100, 'Too long')
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Only lowercase letters, digits, and dashes'),
	description: z.string().trim().max(1000).optional().nullable(),
	sortOrder: z.coerce.number().int('Must be a whole number').default(0)
});

export type CategoryInput = z.infer<typeof categorySchema>;
