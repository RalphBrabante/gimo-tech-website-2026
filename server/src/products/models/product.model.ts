export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  description: string;
  price: number;
  rating: number;
  accent: string;
  imageUrl: string | null;
  imageUrls: string[];
  images: { id: number; url: string }[];
  isActive: boolean;
}
