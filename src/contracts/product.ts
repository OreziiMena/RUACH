export interface ProductContract {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock_count: number;
  sales_count: number;
  imageUrl: string;
  thumbnails: string[];
  sizes: string[];

  category: string;

  createdAt: Date;
  updatedAt: Date;
}