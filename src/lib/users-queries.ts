import { gql, TypedDocumentNode } from "@apollo/client";

export interface User {
  id: string;
  username: string;
  role: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: string;
}

export interface UsersData {
  users: User[];
}

export const USERS_DATA: TypedDocumentNode<UsersData, Record<string, never>> = gql`
  query UsersData {
    users {
      id
      username
      role
      firstName
      lastName
      phone
      status
    }
  }
`;

export interface NewUserInput {
  username: string;
  password: string;
  role: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface CreateUserData {
  createUser: User;
}

export interface CreateUserVariables {
  input: NewUserInput;
}

export const CREATE_USER: TypedDocumentNode<CreateUserData, CreateUserVariables> = gql`
  mutation CreateUser($input: NewUser!) {
    createUser(input: $input) {
      id
      username
      role
      firstName
      lastName
      phone
      status
    }
  }
`;

export interface UpdateUserInput {
  role?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status?: string;
}

export interface UpdateUserData {
  updateUser: User;
}

export interface UpdateUserVariables {
  id: string;
  input: UpdateUserInput;
}

export const UPDATE_USER: TypedDocumentNode<UpdateUserData, UpdateUserVariables> = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUser!) {
    updateUser(id: $id, input: $input) {
      id
      username
      role
      firstName
      lastName
      phone
      status
    }
  }
`;

export interface DeleteUserData {
  deleteUser: boolean;
}

export interface DeleteUserVariables {
  id: string;
}

export const DELETE_USER: TypedDocumentNode<DeleteUserData, DeleteUserVariables> = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;
