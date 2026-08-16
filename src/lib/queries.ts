import { gql, TypedDocumentNode } from "@apollo/client";

export interface LoginData {
  login: {
    token: string;
    user: {
      id: string;
      username: string;
      role: string;
      firstName: string;
      lastName: string;
    };
  };
}

export interface LoginVariables {
  username: string;
  password: string;
}

export const LOGIN: TypedDocumentNode<LoginData, LoginVariables> = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        id
        username
        role
        firstName
        lastName
      }
    }
  }
`;

export interface MeData {
  me: {
    id: string;
    username: string;
    role: string;
    firstName: string;
    lastName: string;
  } | null;
}

export const ME: TypedDocumentNode<MeData, Record<string, never>> = gql`
  query Me {
    me {
      id
      username
      role
      firstName
      lastName
    }
  }
`;
