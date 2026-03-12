export interface LocationData {
  id: string;
  row: string;
  index: number;
  material: string;
  description?: string;
  quantity: number | string;
  weight: number | string;
  batch?: string;
  status: 'empty' | 'occupied' | 'ng';
  defaultMaterial?: string;
  customArea?: string;
}

export interface MaterialTotal {
  material: string;
  description: string;
  totalWeight: number;
  totalQuantity: number;
  locations: string[];
}
