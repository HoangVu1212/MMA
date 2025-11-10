export type RootStackParamList = {
  HomeScreen: undefined;
  CreateProduct: undefined;
  UpdateProduct: { product: Product };
};

// Định nghĩa kiểu Product
export type Product = {
  id: number;
  name: string;
  scent: string;
  description: string;
  ingredients: string;
  image: string;
  volume: string;
  concentration: string;
  sizes: Array<{ size: string; price: number; stock: number }>;
};
