import { z } from 'zod';

const emptyToNull = (v: unknown) => (v === '' || v === null || v === undefined ? null : v);

export const productSchema = z
	.object({
		name: z.string().trim().min(1, 'Name is required').max(200, 'Too long'),
		slug: z
			.string()
			.trim()
			.min(1, 'Slug is required')
			.max(200)
			.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Only lowercase letters, digits, and dashes'),
		categoryId: z.preprocess(emptyToNull, z.string().uuid().nullable()),
		price: z.coerce.number().int().min(0, 'Price must be ≥ 0'),
		compareAtPrice: z.preprocess(
			(v) => (v === '' || v === null || v === undefined ? null : Number(v)),
			z.number().int().min(0).nullable()
		),
		unit: z.preprocess(emptyToNull, z.string().trim().max(50).nullable()),
		stockQuantity: z.coerce.number().int().min(0, 'Stock must be ≥ 0'),
		description: z.preprocess(emptyToNull, z.string().trim().max(5000).nullable()),
		isActive: z.preprocess(
			(v) => v === 'on' || v === true || v === 'true',
			z.boolean().default(true)
		)
	})
	.refine((data) => data.compareAtPrice === null || data.compareAtPrice >= data.price, {
		message: 'Compare-at price should be higher than the sale price',
		path: ['compareAtPrice']
	});

export type ProductInput = z.infer<typeof productSchema>;
