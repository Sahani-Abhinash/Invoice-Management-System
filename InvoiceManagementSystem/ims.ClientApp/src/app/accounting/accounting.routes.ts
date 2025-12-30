import { Routes } from '@angular/router';
import { FinancialDashboardComponent } from './financial-dashboard/financial-dashboard.component';
import { AccountListComponent } from './ManageAccount/account-list.component';
import { AccountFormComponent } from './ManageAccount/account-form.component';
import { CategoryListComponent } from './ManageCategory/category-list.component';
import { CategoryFormComponent } from './ManageCategory/category-form.component';
import { TransactionListComponent } from './ManageTransaction/transaction-list.component';
import { TransactionFormComponent } from './ManageTransaction/transaction-form.component';

export const ACCOUNTING_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: FinancialDashboardComponent },
  
  // Accounts (Chart of Accounts)
  { path: 'accounts', component: AccountListComponent },
  { path: 'accounts/create', component: AccountFormComponent },
  { path: 'accounts/edit/:id', component: AccountFormComponent },
  { path: 'accounts/:id', component: AccountListComponent }, // Could create account detail view later
  
  // Income/Expense Categories
  { path: 'categories', component: CategoryListComponent },
  { path: 'categories/create', component: CategoryFormComponent },
  { path: 'categories/edit/:id', component: CategoryFormComponent },
  
  // Income/Expense Transactions
  { path: 'transactions', component: TransactionListComponent },
  { path: 'transactions/create', component: TransactionFormComponent },
  { path: 'transactions/:id', component: TransactionFormComponent },
  
  // Future routes:
  // { path: 'balance-sheet', component: BalanceSheetComponent },
  // { path: 'income-statement', component: IncomeStatementComponent },
  // { path: 'trial-balance', component: TrialBalanceComponent },
];

export default ACCOUNTING_ROUTES;

