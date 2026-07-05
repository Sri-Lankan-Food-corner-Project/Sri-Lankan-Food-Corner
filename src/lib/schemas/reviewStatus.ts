import { z } from 'zod';

// Moderation state for a customer product review.
// New reviews start as 'pending'. Only 'approved' reviews are shown publicly.
export const REVIEW_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
	pending: 'Pending',
	approved: 'Approved',
	rejected: 'Rejected'
};

// Shared client + server validation for the review form.
export const submitReviewSchema = z.object({
	rating: z.number().int().min(1, 'Rating is required').max(5),
	title: z.string().trim().max(80, 'Title is too long').optional(),
	body: z
		.string()
		.trim()
		.min(10, 'Please write at least 10 characters')
		.max(2000, 'Review is too long (max 2000 characters)')
});

export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;
