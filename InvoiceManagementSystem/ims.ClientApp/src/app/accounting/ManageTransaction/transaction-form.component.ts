import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  AccountingService, 
  Account,
  CreateIncomeExpenseTransaction,
  IncomeExpenseType,
  IncomeExpenseCategory,
  IncomeExpenseTransaction
} from '../accounting.service';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12 col-lg-8">
          <div class="card">
            <div class="card-header">
              <h4 class="mb-0">{{ isViewMode() ? 'View' : 'Create' }} Transaction</h4>
            </div>
            <div class="card-body">
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

              <!-- View Mode -->
              <div *ngIf="isViewMode() && viewTransaction()">
                <div class="row mb-3">
                  <div class="col-md-6">
                    <label class="form-label fw-bold">Type</label>
                    <div>
                      <span *ngIf="viewTransaction()!.type === incomeType" class="badge bg-success">
                        <i class="bi bi-arrow-down-circle"></i> Income
                      </span>
                      <span *ngIf="viewTransaction()!.type === expenseType" class="badge bg-danger">
                        <i class="bi bi-arrow-up-circle"></i> Expense
                      </span>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-bold">Status</label>
                    <div>
                      <span [class]="viewTransaction()!.status === 'Posted' ? 'badge bg-success' : 'badge bg-warning text-dark'">
                        {{ viewTransaction()!.status }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="row mb-3">
                  <div class="col-md-6">
                    <label class="form-label fw-bold">Reference</label>
                    <div>{{ viewTransaction()!.reference }}</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-bold">Date</label>
                    <div>{{ viewTransaction()!.transactionDate | date:'fullDate' }}</div>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-bold">Category</label>
                  <div>{{ viewTransaction()!.categoryName }}</div>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-bold">Account</label>
                  <div>{{ viewTransaction()!.accountName || '—' }}</div>
                </div>
                <div class="row mb-3">
                  <div class="col-md-6">
                    <label class="form-label fw-bold">Amount</label>
                    <div class="fs-5" [class]="viewTransaction()!.type === incomeType ? 'text-success' : 'text-danger'">
                      {{ viewTransaction()!.currency }} {{ viewTransaction()!.amount | number:'1.2-2' }}
                    </div>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-bold">Description</label>
                  <div>{{ viewTransaction()!.description }}</div>
                </div>
                <div *ngIf="viewTransaction()!.sourceModule" class="row mb-3">
                  <div class="col-md-6">
                    <label class="form-label fw-bold">Source Module</label>
                    <div>{{ viewTransaction()!.sourceModule }}</div>
                  </div>
                  <div class="col-md-6" *ngIf="viewTransaction()!.sourceId">
                    <label class="form-label fw-bold">Source ID</label>
                    <div>{{ viewTransaction()!.sourceId }}</div>
                  </div>
                </div>
                <div class="d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-secondary" (click)="cancel()">
                    Back to List
                  </button>
                </div>
              </div>

              <!-- Create Form -->
              <form *ngIf="!isViewMode() && !loading()" (ngSubmit)="save()" #transactionForm="ngForm">
                <div class="mb-3">
                  <label class="form-label">Type <span class="text-danger">*</span></label>
                  <div class="btn-group w-100" role="group">
                    <input type="radio" class="btn-check" name="type" 
                           id="typeIncome" 
                           [value]="incomeType"
                           [(ngModel)]="transaction.type" 
                           required
                           (change)="onTypeChange()">
                    <label class="btn btn-outline-success" for="typeIncome">
                      <i class="bi bi-arrow-down-circle"></i> Income
                    </label>

                    <input type="radio" class="btn-check" name="type" 
                           id="typeExpense" 
                           [value]="expenseType"
                           [(ngModel)]="transaction.type" 
                           required
                           (change)="onTypeChange()">
                    <label class="btn btn-outline-danger" for="typeExpense">
                      <i class="bi bi-arrow-up-circle"></i> Expense
                    </label>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="categoryId" class="form-label">Category <span class="text-danger">*</span></label>
                  <select class="form-select" 
                          id="categoryId" 
                          name="categoryId"
                          [(ngModel)]="transaction.categoryId" 
                          required
                          (change)="onCategoryChange()">
                    <option value="">-- Select Category --</option>
                    <option *ngFor="let cat of filteredCategories()" [value]="cat.id">
                      {{ cat.name }}
                    </option>
                  </select>
                </div>

                <div class="mb-3">
                  <label for="accountId" class="form-label">Account <span class="text-danger">*</span></label>
                  <select class="form-select"
                          id="accountId"
                          name="accountId"
                          [(ngModel)]="transaction.accountId"
                          required>
                    <option value="">-- Select Account --</option>
                    <option *ngFor="let acc of accounts" [value]="acc.id">
                      {{ acc.name }}
                    </option>
                  </select>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="amount" class="form-label">Amount <span class="text-danger">*</span></label>
                    <input type="number" 
                           class="form-control" 
                           id="amount" 
                           name="amount"
                           [(ngModel)]="transaction.amount" 
                           required
                           min="0.01"
                           step="0.01"
                           placeholder="0.00">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="currency" class="form-label">Currency <span class="text-danger">*</span></label>
                    <input type="text" 
                           class="form-control" 
                           id="currency" 
                           name="currency"
                           [(ngModel)]="transaction.currency" 
                           required
                           maxlength="3"
                           placeholder="USD">
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="transactionDate" class="form-label">Date <span class="text-danger">*</span></label>
                    <input type="date" 
                           class="form-control" 
                           id="transactionDate" 
                           name="transactionDate"
                           [(ngModel)]="transaction.transactionDate" 
                           required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="reference" class="form-label">Reference <span class="text-danger">*</span></label>
                    <input type="text" 
                           class="form-control" 
                           id="reference" 
                           name="reference"
                           [(ngModel)]="transaction.reference" 
                           required
                           maxlength="50"
                           placeholder="e.g., TXN-001">
                  </div>
                </div>

                <div class="mb-3">
                  <label for="description" class="form-label">Description</label>
                  <textarea class="form-control" 
                            id="description" 
                            name="description"
                            [(ngModel)]="transaction.description" 
                            rows="3"
                            maxlength="500"
                            placeholder="Transaction details..."></textarea>
                </div>

                <div class="mb-3">
                  <label for="sourceModule" class="form-label">Source Module <span class="text-danger">*</span></label>
                  <input type="text" 
                         class="form-control" 
                         id="sourceModule" 
                         name="sourceModule"
                         [(ngModel)]="transaction.sourceModule" 
                         required
                         maxlength="50"
                         placeholder="Manual">
                  <small class="form-text text-muted">
                    Module that created this transaction (e.g., Manual, Invoice, PurchaseOrder)
                  </small>
                </div>

                <div class="mb-3 form-check">
                  <input type="checkbox" 
                         class="form-check-input" 
                         id="postNow" 
                         name="postNow"
                         [(ngModel)]="transaction.postNow">
                  <label class="form-check-label" for="postNow">
                    Post Immediately
                  </label>
                  <small class="form-text text-muted d-block">
                    If unchecked, transaction will be saved as Draft and can be posted later
                  </small>
                </div>

                <div class="d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-secondary" (click)="cancel()">
                    Cancel
                  </button>
                  <button type="submit" 
                          class="btn btn-primary" 
                          [disabled]="!transactionForm.form.valid || saving()">
                    <span *ngIf="saving()" class="spinner-border spinner-border-sm me-2"></span>
                    {{ saving() ? 'Saving...' : 'Save' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TransactionFormComponent implements OnInit {
  transaction: CreateIncomeExpenseTransaction = {
    type: IncomeExpenseType.Expense,
    categoryId: '',
    accountId: '',
    amount: 0,
    currency: 'USD',
    transactionDate: new Date().toISOString().split('T')[0],
    reference: '',
    description: '',
    sourceModule: 'Manual',
    postNow: false
  };

  categories = signal<IncomeExpenseCategory[]>([]);
  filteredCategories = signal<IncomeExpenseCategory[]>([]);
  accounts: Account[] = [];
  viewTransaction = signal<IncomeExpenseTransaction | null>(null);
  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  isViewMode = signal(false);
  transactionId: string | null = null;

  readonly incomeType = IncomeExpenseType.Income;
  readonly expenseType = IncomeExpenseType.Expense;

  constructor(
    private accountingService: AccountingService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.transactionId = this.route.snapshot.paramMap.get('id');
    this.isViewMode.set(!!this.transactionId);

    this.loadAccounts();
    this.loadCategories();
    
    if (this.isViewMode() && this.transactionId) {
      this.loadTransaction(this.transactionId);
    } else {
      this.filterCategories();
    }
  }

  loadCategories() {
    this.accountingService.getCategories().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.filterCategories();
      },
      error: (err) => {
        this.error.set('Failed to load categories: ' + err.message);
      }
    });
  }

  loadAccounts() {
    this.accountingService.getAllAccounts().subscribe({
      next: (data) => {
        this.accounts = data;
      },
      error: (err) => {
        this.error.set('Failed to load accounts: ' + err.message);
      }
    });
  }

  loadTransaction(id: string) {
    this.loading.set(true);
    this.accountingService.getTransactionById(id).subscribe({
      next: (data) => {
        this.viewTransaction.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load transaction: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  onTypeChange() {
    this.filterCategories();
    this.transaction.categoryId = ''; // Reset selected category when type changes
    this.transaction.accountId = '';
  }

  onCategoryChange() {
    const selected = this.categories().find(cat => cat.id === this.transaction.categoryId);
    if (selected?.glAccountId) {
      this.transaction.accountId = selected.glAccountId;
    }
  }

  filterCategories() {
    const filtered = this.categories().filter(cat => cat.type === this.transaction.type);
    this.filteredCategories.set(filtered);
  }

  save() {
    this.saving.set(true);
    this.error.set(null);

    const payload: CreateIncomeExpenseTransaction = {
      ...this.transaction,
      accountId: this.transaction.accountId || undefined
    };

    this.accountingService.createTransaction(payload).subscribe({
      next: () => {
        this.router.navigate(['/accounting/transactions']);
      },
      error: (err) => {
        this.error.set('Failed to save transaction: ' + err.message);
        this.saving.set(false);
      }
    });
  }

  cancel() {
    this.router.navigate(['/accounting/transactions']);
  }
}
