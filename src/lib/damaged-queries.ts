import { gql, TypedDocumentNode } from "@apollo/client";

export interface DamagedProduct {
  id: string;
  productId: string;
  userId: string;
  quantity: number;
  costPrice: number;
  reason: string;
  note: string | null;
  date: string; // Unix seconds, stringified
}

export interface DamagedProductsData {
  damagedProducts: DamagedProduct[];
}

export const DAMAGED_PRODUCTS_DATA: TypedDocumentNode<DamagedProductsData, Record<string, never>> = gql`
  query DamagedProductsData {
    damagedProducts {
      id
      productId
      userId
      quantity
      costPrice
      reason
      note
      date
    }
  }
`;

export interface CreateDamagedProductData {
  createDamagedProduct: DamagedProduct;
}

export interface CreateDamagedProductVariables {
  input: { productId: string; quantity: number; reason: string; note?: string | null };
}

export const CREATE_DAMAGED_PRODUCT: TypedDocumentNode<
  CreateDamagedProductData,
  CreateDamagedProductVariables
> = gql`
  mutation CreateDamagedProduct($input: NewDamagedProduct!) {
    createDamagedProduct(input: $input) {
      id
      productId
      userId
      quantity
      costPrice
      reason
      note
      date
    }
  }
`;

export interface DeleteDamagedProductData {
  deleteDamagedProduct: boolean;
}

export interface DeleteDamagedProductVariables {
  id: string;
}

export const DELETE_DAMAGED_PRODUCT: TypedDocumentNode<
  DeleteDamagedProductData,
  DeleteDamagedProductVariables
> = gql`
  mutation DeleteDamagedProduct($id: ID!) {
    deleteDamagedProduct(id: $id)
  }
`;
