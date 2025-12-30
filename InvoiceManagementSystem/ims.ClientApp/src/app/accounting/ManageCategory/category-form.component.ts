import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  AccountingService, 
  IncomeExpenseCategory, 
  CreateIncomeExpenseCategory,
  IncomeExpenseType,
  Account
} from '../accounting.service';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12 col-lg-8">
          <div class="card">
            <div class="card-header">
              <h4 class="mb-0">{{ isEditMode() ? 'Edit' : 'Create' }} Category</h4>
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

              <!-- Form -->
              <form *ngIf="!loading()" (ngSubmit)="save()" #categoryForm="ngForm">
                <div class="mb-3">
                  <label class="form-label">Type <span class="text-danger">*</span></label>
                  <div class="btn-group w-100" role="group">
                    <input type="radio" class="btn-check" name="type" 
                           id="typeIncome" 
                           [value]="incomeType"
                           [(ngModel)]="category.type" 
                           required
                           (change)="onTypeChange()">
                    <label class="btn btn-outline-success" for="typeIncome">
                      <i class="bi bi-arrow-down-circle"></i> Income
                    </label>

                    <input type="radio" class="btn-check" name="type" 
                           id="typeExpense" 
                           [value]="expenseType"
                           [(ngModel)]="category.type" 
                           required
                           (change)="onTypeChange()">
                    <label class="btn btn-outline-danger" for="typeExpense">
                      <i class="bi bi-arrow-up-circle"></i> Expense
                    </label>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="code" class="form-label">Code <span class="text-danger">*</span></label>
                  <input type="text" 
                         class="form-control" 
                         id="code" 
                         name="code"
                         [(ngModel)]="category.code" 
                         required
                         maxlength="20"
                         placeholder="e.g., SAL-001, OFF-EXP">
                </div>

                <div class="mb-3">
                  <label for="name" class="form-label">Name <span class="text-danger">*</span></label>
                  <input type="text" 
                         class="form-control" 
                         id="name" 
                         name="name"
                         [(ngModel)]="category.name" 
                         required
                         maxlength="100"
                         placeholder="e.g., Sales Revenue, Office Supplies">
                </div>

                <!-- <div class="mb-3">
                  <label for="glAccountId" class="form-label">GL Account <span class="text-danger">*</span></label>
                  <select class="form-select" 
                          id="glAccountId" 
                          name="glAccountId"
                          [(ngModel)]="category.glAccountId" 
                          required>
                    <option value="">-- Select GL Account --</option>
                    <option *ngFor="let account of filteredAccounts()" [value]="account.id">
                      {{ account.code }} - {{ account.name }}
                    </option>
                  </select>
                  <small class="form-text text-muted">
                    Select the General Ledger account for posting transactions
                  </small>
                </div> -->

                <div class="mb-3 form-check">
                  <input type="checkbox" 
                         class="form-check-input" 
                         id="isActive" 
                         name="isActive"
                         [(ngModel)]="category.isActive">
                  <label class="form-check-label" for="isActive">
                    Active
                  </label>
                </div>

                <div class="d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-secondary" (click)="cancel()">
                    Cancel
                  </button>
                  <button type="submit" 
                          class="btn btn-primary" 
                          [disabled]="!categoryForm.form.valid || saving()">
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
export class CategoryFormComponent implements OnInit {
  category: CreateIncomeExpenseCategory = {
    name: '',
    code: '',
    type: IncomeExpenseType.Expense,
    glAccountId: '',
    isActive: true
  };

  accounts = signal<Account[]>([]);
  filteredAccounts = signal<Account[]>([]);
  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  isEditMode = signal(false);
  categoryId: string | null = null;

  readonly incomeType = IncomeExpenseType.Income;
  readonly expenseType = IncomeExpenseType.Expense;

  constructor(
    private accountingService: AccountingService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.categoryId = this.route.snapshot.paramMap.get('id');
    this.isEditMode.set(!!this.categoryId);
    
    this.loadAccounts();
    
    if (this.isEditMode() && this.categoryId) {
      this.loadCategory(this.categoryId);
    } else {
      this.filterAccounts();
    }
  }

  loadAccounts() {
    this.accountingService.getAllAccounts().subscribe({
      next: (data) => {
        this.accounts.set(data);
        this.filterAccounts();
      },
      error: (err) => {
        this.error.set('Failed to load accounts: ' + err.message);
      }
    });
  }

  loadCategory(id: string) {
    this.loading.set(true);
    this.accountingService.getCategoryById(id).subscribe({
      next: (data) => {
        this.category = {
          name: data.name,
          code: data.code,
          type: data.type,
          glAccountId: data.glAccountId,
          isActive: data.isActive
        };
        this.filterAccounts();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load category: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  onTypeChange() {
    this.filterAccounts();
    this.category.glAccountId = ''; // Reset selected account when type changes
  }

  filterAccounts() {
    // Filter accounts based on selected type
    // Income categories should use Revenue/Income accounts (400-499)
    // Expense categories should use Expense accounts (500-599)
    // const filtered = this.accounts().filter(account => {
    //   if (this.category.type === IncomeExpenseType.Income) {
    //     return account.accountType === AccountType.Revenue;
    //   } else {
    //     return account.accountType === AccountType.Expense;
    //   }
    // });
    // this.filteredAccounts.set(filtered);
  }

  save() {
    this.saving.set(true);
    this.error.set(null);
    console.log('Saving category:', this.category);
    const operation = this.isEditMode() && this.categoryId
      ? this.accountingService.updateCategory(this.categoryId, this.category)
      : this.accountingService.createCategory(this.category);

    operation.subscribe({
      next: () => {
        this.router.navigate(['/accounting/categories']);
      },
      error: (err) => {
        this.error.set('Failed to save category: ' + err.message);
        this.saving.set(false);
      }
    });
  }

  cancel() {
    this.router.navigate(['/accounting/categories']);
  }
}
