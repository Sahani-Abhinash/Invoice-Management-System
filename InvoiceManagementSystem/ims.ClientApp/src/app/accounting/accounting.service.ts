import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum TransactionType {
  InvoiceCreated = 1,
  PaymentReceived = 2,
  PurchaseOrderCreated = 3,
  GoodsReceived = 4,
  PaymentMade = 5,
  Adjustment = 7,
  Opening = 8,
  Closing = 9
}

export interface Account {
  id: string;
  name: string;
  description: string;
}

export interface CreateAccount {
  name: string;
  description: string;
}

export interface AccountBalance {
  accountId: string;
  accountName: string;
  debitTotal: number;
  creditTotal: number;
  balance: number;
}

export interface BalanceSheet {
  asOfDate: string;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  assets: AccountBalance[];
  liabilities: AccountBalance[];
  equity: AccountBalance[];
}

export interface IncomeStatement {
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  revenue: AccountBalance[];
  expenses: AccountBalance[];
}

export interface TrialBalance {
  asOfDate: string;
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
  accounts: AccountBalance[];
}

export interface FinancialSummary {
  asOfDate: string;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  cash: number;
  accountsReceivable: number;
  accountsPayable: number;
  inventory: number;
}

@Injectable({
  providedIn: 'root'
})
export class AccountingService {
  private http = inject(HttpClient);
  private apiUrl = '/api/accounting';

  // ===== ACCOUNTS =====

  getAllAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.apiUrl}/accounts`);
  }

  getAccountById(id: string): Observable<Account> {
    return this.http.get<Account>(`${this.apiUrl}/accounts/${id}`);
  }

  createAccount(account: CreateAccount): Observable<Account> {
    
    return this.http.post<Account>(`${this.apiUrl}/accounts`, account);
  }

  updateAccount(id: string, account: CreateAccount): Observable<Account> {
    return this.http.put<Account>(`${this.apiUrl}/accounts/${id}`, account);
  }

  deleteAccount(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/accounts/${id}`);
  }

  // ===== FINANCIAL REPORTS =====

  getBalanceSheet(asOfDate?: string): Observable<BalanceSheet> {
    const params = asOfDate ? new HttpParams().set('asOfDate', asOfDate) : undefined;
    return this.http.get<BalanceSheet>(`${this.apiUrl}/reports/balance-sheet`, { params });
  }

  getIncomeStatement(startDate?: string, endDate?: string): Observable<IncomeStatement> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<IncomeStatement>(`${this.apiUrl}/reports/income-statement`, { params: Object.keys(params).length ? params : undefined });
  }

  getTrialBalance(asOfDate?: string): Observable<TrialBalance> {
    const params = asOfDate ? new HttpParams().set('asOfDate', asOfDate) : undefined;
    return this.http.get<TrialBalance>(`${this.apiUrl}/reports/trial-balance`, { params });
  }

  getFinancialSummary(asOfDate?: string): Observable<FinancialSummary> {
    const params = asOfDate ? new HttpParams().set('asOfDate', asOfDate) : undefined;
    return this.http.get<FinancialSummary>(`${this.apiUrl}/reports/financial-summary`, { params });
  }

  // ===== SETUP =====

  initializeChartOfAccounts(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/setup/initialize-chart-of-accounts`, {});
  }

  // ===== HELPER METHODS =====

  getTransactionTypeName(type: TransactionType): string {
    return TransactionType[type] || 'Unknown';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}
