import { gql, TypedDocumentNode } from "@apollo/client";

export interface OverviewSaleItem {
  quantity: number;
  costPrice: number;
  subtotal: number;
}

export interface OverviewSale {
  id: string;
  saleDate: string;
  items: OverviewSaleItem[];
}

export interface OverviewExpense {
  id: string;
  type: "EXPENSE" | "INCOME";
  amount: number;
  date: string;
}

export interface OverviewDamagedProduct {
  id: string;
  quantity: number;
  costPrice: number;
  date: string;
}

export interface ReportsOverviewData {
  sales: OverviewSale[];
  expenses: OverviewExpense[];
  damagedProducts: OverviewDamagedProduct[];
}

// ກຳໄລສຸດທິ = (ຍອດຂາຍ - ຕົ້ນທຶນສິນຄ້າ) - ລາຍຈ່າຍ + ລາຍຮັບອື່ນ - ມູນຄ່າສິນຄ້າເສຍຫາຍ
// Every sale counts regardless of payment status, matching /reports/sales.
export const REPORTS_OVERVIEW_DATA: TypedDocumentNode<ReportsOverviewData, Record<string, never>> = gql`
  query ReportsOverviewData {
    sales {
      id
      saleDate
      items {
        quantity
        costPrice
        subtotal
      }
    }
    expenses {
      id
      type
      amount
      date
    }
    damagedProducts {
      id
      quantity
      costPrice
      date
    }
  }
`;
