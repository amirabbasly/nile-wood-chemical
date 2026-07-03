export type Role = "user" | "admin";

export type ProductCategory = {
  id: string;
  title: string;
  slug: string;
  description: string;
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  price: number;
  oldPrice?: number;
  stock: number;
  category: string;
  image: string;
  summary: string;
  description: string;
  features: string[];
  published: boolean;
  brand: string;
};

export type BlogCategory = {
  id: string;
  title: string;
  slug: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  image: string;
  publishedAt: string;
  published: boolean;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type OrderStatus =
  | "در انتظار پرداخت"
  | "پرداخت موفق"
  | "پرداخت ناموفق"
  | "در حال پردازش"
  | "تکمیل شده";
