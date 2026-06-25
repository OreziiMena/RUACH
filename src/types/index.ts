export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  avatar?: string;
}

export type ShippingMethod = 'within_port_harcourt' | 'outside_port_harcourt_doors' | 'outside_port_harcourt_pickup';
