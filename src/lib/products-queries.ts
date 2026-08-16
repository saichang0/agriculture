import { gql, TypedDocumentNode } from "@apollo/client";

export interface Product {
  id: string;
  barcode: string | null;
  name: string;
  imageUrl: string | null;
  categoryId: string;
  unitId: string;
  costPrice: number;
  retailPrice: number;
  wholesalePrice: number;
  wholesaleMinQty: number;
  stockQty: number;
  minStockAlert: number;
  status: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Unit {
  id: string;
  name: string;
}

export interface ProductsPageData {
  products: Product[];
  categories: Category[];
  units: Unit[];
}

export const PRODUCTS_PAGE_DATA: TypedDocumentNode<ProductsPageData, Record<string, never>> = gql`
  query ProductsPageData {
    products {
      id
      barcode
      name
      imageUrl
      categoryId
      unitId
      costPrice
      retailPrice
      wholesalePrice
      wholesaleMinQty
      stockQty
      minStockAlert
      status
    }
    categories {
      id
      name
    }
    units {
      id
      name
    }
  }
`;

export interface NewProductInput {
  barcode?: string | null;
  name: string;
  imageUrl?: string | null;
  categoryId: string;
  unitId: string;
  costPrice: number;
  retailPrice: number;
  wholesalePrice: number;
  wholesaleMinQty: number;
  stockQty: number;
  minStockAlert: number;
}

export interface CreateProductData {
  createProduct: Product;
}

export interface CreateProductVariables {
  input: NewProductInput;
}

export const CREATE_PRODUCT: TypedDocumentNode<CreateProductData, CreateProductVariables> = gql`
  mutation CreateProduct($input: NewProduct!) {
    createProduct(input: $input) {
      id
      barcode
      name
      imageUrl
      categoryId
      unitId
      costPrice
      retailPrice
      wholesalePrice
      wholesaleMinQty
      stockQty
      minStockAlert
      status
    }
  }
`;

export interface DeleteProductData {
  deleteProduct: boolean;
}

export interface DeleteProductVariables {
  id: string;
}

export const DELETE_PRODUCT: TypedDocumentNode<DeleteProductData, DeleteProductVariables> = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

export interface UpdateProductInput {
  barcode?: string | null;
  name?: string;
  imageUrl?: string | null;
  categoryId?: string;
  unitId?: string;
  costPrice?: number;
  retailPrice?: number;
  wholesalePrice?: number;
  wholesaleMinQty?: number;
  stockQty?: number;
  minStockAlert?: number;
  status?: string;
}

export interface UpdateProductData {
  updateProduct: Product;
}

export interface UpdateProductVariables {
  id: string;
  input: UpdateProductInput;
}

export const UPDATE_PRODUCT: TypedDocumentNode<UpdateProductData, UpdateProductVariables> = gql`
  mutation UpdateProduct($id: ID!, $input: UpdateProduct!) {
    updateProduct(id: $id, input: $input) {
      id
      barcode
      name
      imageUrl
      categoryId
      unitId
      costPrice
      retailPrice
      wholesalePrice
      wholesaleMinQty
      stockQty
      minStockAlert
      status
    }
  }
`;

export interface ProductByIdData {
  product: Product | null;
}

export interface ProductByIdVariables {
  id: string;
}

export const PRODUCT_BY_ID: TypedDocumentNode<ProductByIdData, ProductByIdVariables> = gql`
  query ProductById($id: ID!) {
    product(id: $id) {
      id
      barcode
      name
      imageUrl
      categoryId
      unitId
      costPrice
      retailPrice
      wholesalePrice
      wholesaleMinQty
      stockQty
      minStockAlert
      status
    }
  }
`;

export interface CreateCategoryData {
  createCategory: Category;
}

export interface CreateCategoryVariables {
  input: { name: string };
}

export const CREATE_CATEGORY: TypedDocumentNode<CreateCategoryData, CreateCategoryVariables> = gql`
  mutation CreateCategory($input: NewCategory!) {
    createCategory(input: $input) {
      id
      name
    }
  }
`;

export interface CreateUnitData {
  createUnit: Unit;
}

export interface CreateUnitVariables {
  input: { name: string };
}

export const CREATE_UNIT: TypedDocumentNode<CreateUnitData, CreateUnitVariables> = gql`
  mutation CreateUnit($input: NewUnit!) {
    createUnit(input: $input) {
      id
      name
    }
  }
`;
