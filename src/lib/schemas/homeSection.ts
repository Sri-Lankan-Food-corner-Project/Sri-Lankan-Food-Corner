import { z } from 'zod';

export const HOME_SECTION_TYPES = ['manual', 'category', 'newest', 'discounted'] as const;
export type HomeSectionType = (typeof HOME_SECTION_TYPES)[number];

export const homeSectionSchema = z
	.object({
		id: z.string().uuid().optional(),
		title: z.string().trim().min(1, 'Title is required').max(120, 'Too long'),
		subtitle: z.string().trim().max(200).optional().nullable(),
		type: z.enum(HOME_SECTION_TYPES),
		categoryId: z.string().uuid().optional().nullable(),
		limit: z.coerce.number().int().min(1).max(50).default(12),
		sortOrder: z.coerce.number().int().default(0),
		isActive: z.coerce.boolean().default(true)
	})
	.refine((v) => v.type !== 'category' || !!v.categoryId, {
		message: 'Pick a category',
		path: ['categoryId']
	});

export type HomeSectionInput = z.infer<typeof homeSectionSchema>;
