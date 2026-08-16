import { gql, TypedDocumentNode } from "@apollo/client";

export interface Expense {
  id: string;
  userId: string;
  title: string;
  type: "EXPENSE" | "INCOME";
  amount: number;
  date: string; // Unix seconds, stringified — same as Sale.saleDate
}

export interface ExpensesData {
  expenses: Expense[];
}

export const EXPENSES_DATA: TypedDocumentNode<ExpensesData, Record<string, never>> = gql`
  query ExpensesData {
    expenses {
      id
      userId
      title
      type
      amount
      date
    }
  }
`;

export interface CreateExpenseData {
  createExpense: Expense;
}

export interface CreateExpenseVariables {
  input: { title: string; type: "EXPENSE" | "INCOME"; amount: number };
}

export const CREATE_EXPENSE: TypedDocumentNode<CreateExpenseData, CreateExpenseVariables> = gql`
  mutation CreateExpense($input: NewExpense!) {
    createExpense(input: $input) {
      id
      userId
      title
      type
      amount
      date
    }
  }
`;

export interface UpdateExpenseData {
  updateExpense: Expense;
}

export interface UpdateExpenseVariables {
  id: string;
  input: { title?: string; type?: "EXPENSE" | "INCOME"; amount?: number };
}

export const UPDATE_EXPENSE: TypedDocumentNode<UpdateExpenseData, UpdateExpenseVariables> = gql`
  mutation UpdateExpense($id: ID!, $input: UpdateExpense!) {
    updateExpense(id: $id, input: $input) {
      id
      userId
      title
      type
      amount
      date
    }
  }
`;

export interface DeleteExpenseData {
  deleteExpense: boolean;
}

export interface DeleteExpenseVariables {
  id: string;
}

export const DELETE_EXPENSE: TypedDocumentNode<DeleteExpenseData, DeleteExpenseVariables> = gql`
  mutation DeleteExpense($id: ID!) {
    deleteExpense(id: $id)
  }
`;
