export interface Transaction {
  id: string;
  transactionDate: Date;
  type: TransactionType;
  typeName: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  description: string;
  reference: string;
  sourceType: string;
  sourceId?: string;
  companyId?: string;
}

export interface CreateTransactionDto {
  transactionDate: Date;
  type: TransactionType;
  amount: number;
  categoryId: string;
  description: string;
  reference: string;
  companyId?: string;
}

export interface TransactionSummary {
  totalDebits: number;
  totalCredits: number;
  balance: number;
  totalTransactions: number;
}

export enum TransactionType {
  Debit = 1,
  Credit = 2
}
