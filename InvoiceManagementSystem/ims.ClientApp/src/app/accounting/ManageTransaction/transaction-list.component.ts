import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  AccountingService, 
  IncomeExpenseTransaction, 
  IncomeExpenseType,
  IncomeExpenseCategory
} from '../accounting.service';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h4 class="mb-0">Income/Expense Transactions</h4>
              <button class="btn btn-primary" (click)="createTransaction()">
                <i class="bi bi-plus-circle"></i> New Transaction
              </button>
            </div>
            <div class="card-body">
              <!-- Filters -->
              <div class="row mb-3">
                <div class="col-md-3">
                  <label class="form-label">Type</label>
                  <select class="form-select" [(ngModel)]="filters.type" (change)="applyFilters()">
                    <option [value]="null">All</option>
                    <option [value]="incomeType">Income</option>
                    <option [value]="expenseType">Expense</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Start Date</label>
                  <input type="date" class="form-control" [(ngModel)]="filters.startDate" (change)="applyFilters()">
                </div>
                <div class="col-md-3">
                  <label class="form-label">End Date</label>
                  <input type="date" class="form-control" [(ngModel)]="filters.endDate" (change)="applyFilters()">
                </div>
                <div class="col-md-3">
                  <label class="form-label">Category</label>
                  <select class="form-select" [(ngModel)]="filters.categoryId" (change)="applyFilters()">
                    <option value="">All Categories</option>
                    <option *ngFor="let cat of categories()" [value]="cat.id">
                      {{ cat.name }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Loading Spinner -->
              <div *ngIf="loading()" class="text-center my-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>

              <!-- Error Message -->
              <div *ngIf="error()" class="alert alert-danger">
                {{ error() }}
              </div>

              <!-- Transactions Table -->
              <div *ngIf="!loading() && !error()" class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Reference</th>
                      <th>Type</th>
                      <th>Category</th>
                      <th>Account</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let transaction of transactions()">
                      <td>{{ transaction.transactionDate | date:'shortDate' }}</td>
                      <td>{{ transaction.reference }}</td>
                      <td>
                        <span *ngIf="transaction.type === incomeType" class="badge bg-success">
                          <i class="bi bi-arrow-down-circle"></i> Income
                        </span>
                        <span *ngIf="transaction.type === expenseType" class="badge bg-danger">
                          <i class="bi bi-arrow-up-circle"></i> Expense
                        </span>
                      </td>
                      <td>{{ transaction.categoryName }}</td>
                      <td>{{ transaction.accountName || '-' }}</td>
                      <td>{{ transaction.description }}</td>
                      <td class="text-end">
                        <span [class]="transaction.type === incomeType ? 'text-success' : 'text-danger'">
                          {{ transaction.currency }} {{ transaction.amount | number:'1.2-2' }}
                        </span>
                      </td>
                      <td>
                        <span [class]="getStatusClass(transaction.status)">
                          {{ transaction.status }}
                        </span>
                      </td>
                      <td>
                        <button *ngIf="transaction.status === 'Draft'" 
                                class="btn btn-sm btn-outline-success me-2" 
                                (click)="postTransaction(transaction)"
                                title="Post Transaction">
                          <i class="bi bi-check-circle"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-info" 
                                (click)="viewTransaction(transaction.id)"
                                title="View Details">
                          <i class="bi bi-eye"></i>
                        </button>
                      </td>
                    </tr>
                    <tr *ngIf="transactions().length === 0">
                      <td colspan="8" class="text-center text-muted py-4">
                        No transactions found. Click "New Transaction" to create one.
                      </td>
                    </tr>
                  </tbody>
                  <tfoot *ngIf="transactions().length > 0">
                    <tr class="fw-bold">
                      <td colspan="5" class="text-end">Total:</td>
                      <td class="text-end">
                        <div class="text-success">
                          Income: {{ getTotalIncome() | number:'1.2-2' }}
                        </div>
                        <div class="text-danger">
                          Expense: {{ getTotalExpense() | number:'1.2-2' }}
                        </div>
                        <div class="border-top pt-1">
                          Net: {{ getNetTotal() | number:'1.2-2' }}
                        </div>
                      </td>
                      <td colspan="2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table th {
      white-space: nowrap;
    }
  `]
})
export class TransactionListComponent implements OnInit {
  transactions = signal<IncomeExpenseTransaction[]>([]);
  categories = signal<IncomeExpenseCategory[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  
  filters = {
    type: null as IncomeExpenseType | null,
    startDate: '',
    endDate: '',
    categoryId: ''
  };

  readonly incomeType = IncomeExpenseType.Income;
  readonly expenseType = IncomeExpenseType.Expense;

  constructor(
    private accountingService: AccountingService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadTransactions();
  }

  loadCategories() {
    this.accountingService.getCategories().subscribe({
      next: (data) => {
        this.categories.set(data);
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
      }
    });
  }

  loadTransactions() {
    this.loading.set(true);
    this.error.set(null);
    
    this.accountingService.getTransactions(
      this.filters.type ?? undefined,
      this.filters.startDate || undefined,
      this.filters.endDate || undefined,
      this.filters.categoryId || undefined
    ).subscribe({
      next: (data) => {
        this.transactions.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load transactions: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  applyFilters() {
    this.loadTransactions();
  }

  createTransaction() {
    this.router.navigate(['/accounting/transactions/create']);
  }

  viewTransaction(id: string) {
    this.router.navigate(['/accounting/transactions', id]);
  }

  postTransaction(transaction: IncomeExpenseTransaction) {
    if (confirm(`Post transaction "${transaction.reference}"? This action cannot be undone.`)) {
      this.accountingService.postTransaction(transaction.id).subscribe({
        next: () => {
          this.loadTransactions();
        },
        error: (err) => {
          alert('Failed to post transaction: ' + err.message);
        }
      });
    }
  }

  getStatusClass(status: string): string {
    return status === 'Posted' ? 'badge bg-success' : 'badge bg-warning text-dark';
  }

  getTotalIncome(): number {
    return this.transactions()
      .filter(t => t.type === IncomeExpenseType.Income && t.status === 'Posted')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getTotalExpense(): number {
    return this.transactions()
      .filter(t => t.type === IncomeExpenseType.Expense && t.status === 'Posted')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getNetTotal(): number {
    return this.getTotalIncome() - this.getTotalExpense();
  }
}
