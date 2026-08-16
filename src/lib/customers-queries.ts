import { gql, TypedDocumentNode } from "@apollo/client";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  debt: number;
  status: string;
}

export interface CustomersPageData {
  customers: Customer[];
}

export const CUSTOMERS_PAGE_DATA: TypedDocumentNode<CustomersPageData, Record<string, never>> = gql`
  query CustomersPageData {
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

export interface CustomerByIdData {
  customer: Customer | null;
}

export interface CustomerByIdVariables {
  id: string;
}

export const CUSTOMER_BY_ID: TypedDocumentNode<CustomerByIdData, CustomerByIdVariables> = gql`
  query CustomerById($id: ID!) {
    customer(id: $id) {
      id
      name
      phone
      address
      debt
      status
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

export interface UpdateCustomerData {
  updateCustomer: Customer;
}

export interface UpdateCustomerVariables {
  id: string;
  input: { name?: string; phone?: string; address?: string | null; status?: string };
}

export const UPDATE_CUSTOMER: TypedDocumentNode<UpdateCustomerData, UpdateCustomerVariables> = gql`
  mutation UpdateCustomer($id: ID!, $input: UpdateCustomer!) {
    updateCustomer(id: $id, input: $input) {
      id
      name
      phone
      address
      debt
      status
    }
  }
`;

export interface DeleteCustomerData {
  deleteCustomer: boolean;
}

export interface DeleteCustomerVariables {
  id: string;
}

export const DELETE_CUSTOMER: TypedDocumentNode<DeleteCustomerData, DeleteCustomerVariables> = gql`
  mutation DeleteCustomer($id: ID!) {
    deleteCustomer(id: $id)
  }
`;

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
  saleDate: string;
  total: number;
  paid: number;
  debt: number;
  paymentStatus: string;
  dueDate: string | null;
  paymentMethod: string | null;
  items: SaleItem[];
}

export interface SalesByCustomerData {
  salesByCustomer: Sale[];
}

export interface SalesByCustomerVariables {
  customerId: string;
}

export const SALES_BY_CUSTOMER: TypedDocumentNode<SalesByCustomerData, SalesByCustomerVariables> = gql`
  query SalesByCustomer($customerId: ID!) {
    salesByCustomer(customerId: $customerId) {
      id
      code
      customerId
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

export interface DebtPayment {
  id: string;
  saleId: string;
  customerId: string;
  amountPaid: number;
  paymentDate: string;
  note: string | null;
}

export interface DebtPaymentsByCustomerData {
  debtPaymentsByCustomer: DebtPayment[];
}

export interface DebtPaymentsByCustomerVariables {
  customerId: string;
}

export const DEBT_PAYMENTS_BY_CUSTOMER: TypedDocumentNode<
  DebtPaymentsByCustomerData,
  DebtPaymentsByCustomerVariables
> = gql`
  query DebtPaymentsByCustomer($customerId: ID!) {
    debtPaymentsByCustomer(customerId: $customerId) {
      id
      saleId
      customerId
      amountPaid
      paymentDate
      note
    }
  }
`;

export interface CreateDebtPaymentData {
  createDebtPayment: DebtPayment;
}

export interface CreateDebtPaymentVariables {
  input: { saleId: string; amountPaid: number; note?: string | null };
}

export const CREATE_DEBT_PAYMENT: TypedDocumentNode<CreateDebtPaymentData, CreateDebtPaymentVariables> = gql`
  mutation CreateDebtPayment($input: NewDebtPayment!) {
    createDebtPayment(input: $input) {
      id
      saleId
      customerId
      amountPaid
      paymentDate
      note
    }
  }
`;
