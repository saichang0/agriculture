import { gql, TypedDocumentNode } from "@apollo/client";

export interface SaleItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  priceType: string;
  subtotal: number;
}

export interface Sale {
  id: string;
  code: string;
  customerId: string | null;
  userId: string;
  saleDate: string;
  total: number;
  paid: number;
  debt: number;
  paymentStatus: string;
  dueDate: string | null;
  paymentMethod: string | null;
  items: SaleItem[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
}

export interface SalesHistoryData {
  sales: Sale[];
  customers: Customer[];
}

export const SALES_HISTORY_DATA: TypedDocumentNode<SalesHistoryData, Record<string, never>> = gql`
  query SalesHistoryData {
    sales {
      id
      code
      customerId
      userId
      saleDate
      total
      paid
      debt
      paymentStatus
      dueDate
      paymentMethod
      items {
        id
        productId
        quantity
        unitPrice
        priceType
        subtotal
      }
    }
    customers {
      id
      name
      phone
    }
  }
`;

export interface SaleByIdData {
  sale: Sale | null;
}

export interface SaleByIdVariables {
  id: string;
}

export const SALE_BY_ID: TypedDocumentNode<SaleByIdData, SaleByIdVariables> = gql`
  query SaleById($id: ID!) {
    sale(id: $id) {
      id
      code
      customerId
      userId
      saleDate
      total
      paid
      debt
      paymentStatus
      dueDate
      paymentMethod
      items {
        id
        productId
        quantity
        unitPrice
        priceType
        subtotal
      }
    }
  }
`;

export interface SalesUser {
  id: string;
  firstName: string;
  lastName: string;
}

export interface UserByIdData {
  user: SalesUser | null;
}

export interface UserByIdVariables {
  id: string;
}

export const USER_BY_ID: TypedDocumentNode<UserByIdData, UserByIdVariables> = gql`
  query UserById($id: ID!) {
    user(id: $id) {
      id
      firstName
      lastName
    }
  }
`;

export interface UpdateSaleItemInput {
  productId: string;
  quantity: number;
}

export interface UpdateSaleData {
  updateSale: Sale;
}

export interface UpdateSaleVariables {
  id: string;
  input: { items: UpdateSaleItemInput[] };
}

export const UPDATE_SALE: TypedDocumentNode<UpdateSaleData, UpdateSaleVariables> = gql`
  mutation UpdateSale($id: ID!, $input: UpdateSale!) {
    updateSale(id: $id, input: $input) {
      id
      code
      customerId
      userId
      saleDate
      total
      paid
      debt
      paymentStatus
      dueDate
      paymentMethod
      items {
        id
        productId
        quantity
        unitPrice
        priceType
        subtotal
      }
    }
  }
`;
