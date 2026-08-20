import { gql, TypedDocumentNode } from "@apollo/client";

export interface ReportSaleItem {
  quantity: number;
  costPrice: number;
  subtotal: number;
}

export interface ReportSale {
  id: string;
  saleDate: string;
  paymentStatus: string;
  discount: number;
  total: number;
  debt: number;
  items: ReportSaleItem[];
}

export interface SalesReportData {
  sales: ReportSale[];
}

// By default every sale counts toward revenue/cost/profit regardless of payment
// status — a debt sale still moved stock and cost the shop money, it just hasn't
// been collected yet. The page offers a toggle to exclude sales that still carry
// debt (debt > 0) entirely, for a "money actually collected" view.
export const SALES_REPORT_DATA: TypedDocumentNode<SalesReportData, Record<string, never>> = gql`
  query SalesReportData {
    sales {
      id
      saleDate
      paymentStatus
      discount
      total
      debt
      items {
        quantity
        costPrice
        subtotal
      }
    }
  }
`;
