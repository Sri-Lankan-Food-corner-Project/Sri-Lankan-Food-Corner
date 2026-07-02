export type Product = {
	id: string;
	categoryId: string | null;
	name: string;
	slug: string;
	description: string | null;
	price: number;
	unit: string | null;
	stockQuantity: number;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
};

export type ProductImage = {
	id: string;
	productId: string;
	imageUrl: string;
	sortOrder: number;
};

export type Category = {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	imageUrl: string | null;
	sortOrder: number;
};
