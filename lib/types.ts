export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  subcategoryId: number;
  inStock: boolean;
  image: string;
  unit: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Store {
  name: string;
  tagline: string;
  location: string;
  currency: string;
}

export interface ProductData {
  store: Store;
  products: Product[];
}

export interface CheckoutForm {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  paymentMethod: 'momo' | 'cash';
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  deliveryFee: number;
  customer: CheckoutForm;
  createdAt: Date;
  status: 'pending' | 'confirmed' | 'processing' | 'delivered';
}
