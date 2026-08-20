import { gql, TypedDocumentNode } from "@apollo/client";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  debt: number;
  status: string;
}

export interface SalesPageData {
  customers: Customer[];
}

export const SALES_PAGE_DATA: TypedDocumentNode<SalesPageData, Record<string, never>> = gql`
  query SalesPageData {
    customers {
      id
      name
      phone
      address
      debt
      status
    }
  }
`;

export interface NewSaleItemInput {
  productId: string;
  quantity: number;
  unitId?: string | null;
}

export interface NewSaleInput {
  customerId?: string | null;
  items: NewSaleItemInput[];
  paid: number;
  discount?: number | null;
  dueDate?: string | null;
  paymentMethod?: string | null;
}

export interface SaleItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  priceType: string;
  subtotal: number;
  unitId: string | null;
  factor: number;
}

export interface Sale {
  id: string;
  code: string;
  subtotal: number;
  discount: number;
  total: number;
  paid: number;
  debt: number;
  paymentStatus: string;
  items: SaleItem[];
}

export interface CreateSaleData {
  createSale: Sale;
}

export interface CreateSaleVariables {
  input: NewSaleInput;
}

export const CREATE_SALE: TypedDocumentNode<CreateSaleData, CreateSaleVariables> = gql`
  mutation CreateSale($input: NewSale!) {
    createSale(input: $input) {
      id
      code
      subtotal
      discount
      total
      paid
      debt
      paymentStatus
      items {
        id
        productId
        quantity
        unitPrice
        priceType
        subtotal
        unitId
        factor
      }
    }
  }
`;

export interface CreateCustomerData {
  createCustomer: Customer;
}

export interface CreateCustomerVariables {
  input: { name: string; phone: string; address?: string | null };
}

export const CREATE_CUSTOMER: TypedDocumentNode<CreateCustomerData, CreateCustomerVariables> = gql`
  mutation CreateCustomer($input: NewCustomer!) {
    createCustomer(input: $input) {
      id
      name
      phone
      address
      debt
      status
    }
  }
`;
