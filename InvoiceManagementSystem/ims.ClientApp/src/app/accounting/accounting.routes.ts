import { Routes } from '@angular/router';
import { FinancialDashboardComponent } from './financial-dashboard/financial-dashboard.component';
import { CurrencyListComponent } from './ManageCurrency/currency-list.component';
import { CurrencyFormComponent } from './ManageCurrency/currency-form.component';

export const ACCOUNTING_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: FinancialDashboardComponent },
  
  // Currency Management
  { path: 'currencies', component: CurrencyListComponent },
  { path: 'currencies/create', component: CurrencyFormComponent },
  { path: 'currencies/edit/:id', component: CurrencyFormComponent },
  
  // Future routes:
  // { path: 'balance-sheet', component: BalanceSheetComponent },
  // { path: 'income-statement', component: IncomeStatementComponent },
  // { path: 'trial-balance', component: TrialBalanceComponent },
];

export default ACCOUNTING_ROUTES;

