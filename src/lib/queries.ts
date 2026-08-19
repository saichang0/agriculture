import { gql, TypedDocumentNode } from "@apollo/client";

export interface AuthPayload {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

export interface LoginData {
  login: AuthPayload;
}

export interface LoginVariables {
  username: string;
  password: string;
}

export const LOGIN: TypedDocumentNode<LoginData, LoginVariables> = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      refreshToken
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

export interface RefreshTokenData {
  refreshToken: AuthPayload;
}

export interface RefreshTokenVariables {
  refreshToken: string;
}

export const REFRESH_TOKEN: TypedDocumentNode<RefreshTokenData, RefreshTokenVariables> = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      token
      refreshToken
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

export interface LogoutData {
  logout: boolean;
}

export interface LogoutVariables {
  refreshToken: string;
}

export const LOGOUT: TypedDocumentNode<LogoutData, LogoutVariables> = gql`
  mutation Logout($refreshToken: String!) {
    logout(refreshToken: $refreshToken)
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
