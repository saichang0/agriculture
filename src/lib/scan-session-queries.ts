import { gql, TypedDocumentNode } from "@apollo/client";

export interface CreateScanSessionData {
  createScanSession: string;
}

export const CREATE_SCAN_SESSION: TypedDocumentNode<CreateScanSessionData, Record<string, never>> = gql`
  mutation CreateScanSession {
    createScanSession
  }
`;

export interface SubmitScanData {
  submitScan: boolean;
}

export interface SubmitScanVariables {
  sessionId: string;
  code: string;
}

export const SUBMIT_SCAN: TypedDocumentNode<SubmitScanData, SubmitScanVariables> = gql`
  mutation SubmitScan($sessionId: ID!, $code: String!) {
    submitScan(sessionId: $sessionId, code: $code)
  }
`;

export interface ScanReceivedData {
  scanReceived: string;
}

export interface ScanReceivedVariables {
  sessionId: string;
}

export const SCAN_RECEIVED: TypedDocumentNode<ScanReceivedData, ScanReceivedVariables> = gql`
  subscription ScanReceived($sessionId: ID!) {
    scanReceived(sessionId: $sessionId)
  }
`;
