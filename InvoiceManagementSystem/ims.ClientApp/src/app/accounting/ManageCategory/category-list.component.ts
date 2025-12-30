import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AccountingService, IncomeExpenseCategory, IncomeExpenseType } from '../accounting.service';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h4 class="mb-0">Income/Expense Categories</h4>
              <button class="btn btn-primary" (click)="createCategory()">
                <i class="bi bi-plus-circle"></i> New Category
              </button>
            </div>
            <div class="card-body">
              <!-- Filter Tabs -->
              <ul class="nav nav-tabs mb-3">
                <li class="nav-item">
                  <a class="nav-link" 
                     [class.active]="selectedType() === null"
                     (click)="filterByType(null)">
                    All Categories
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" 
                     [class.active]="selectedType() === incomeType"
                     (click)="filterByType(incomeType)">
                    <i class="bi bi-arrow-down-circle text-success"></i> Income
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" 
                     [class.active]="selectedType() === expenseType"
                     (click)="filterByType(expenseType)">
                    <i class="bi bi-arrow-up-circle text-danger"></i> Expense
                  </a>
                </li>
              </ul>

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

              <!-- Categories Table -->
              <div *ngIf="!loading() && !error()" class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Type</th>
                      <th>GL Account</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let category of categories()">
                      <td>{{ category.code }}</td>
                      <td>{{ category.name }}</td>
                      <td>
                        <span *ngIf="category.type === incomeType" class="badge bg-success">
                          <i class="bi bi-arrow-down-circle"></i> Income
                        </span>
                        <span *ngIf="category.type === expenseType" class="badge bg-danger">
                          <i class="bi bi-arrow-up-circle"></i> Expense
                        </span>
                      </td>
                      <td>{{ category.glAccountName }}</td>
                      <td>
                        <span [class]="category.isActive ? 'badge bg-success' : 'badge bg-secondary'">
                          {{ category.isActive ? 'Active' : 'Inactive' }}
                        </span>
                      </td>
                      <td>
                        <button class="btn btn-sm btn-outline-primary me-2" 
                                (click)="editCategory(category.id)">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" 
                                (click)="deleteCategory(category)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                    <tr *ngIf="categories().length === 0">
                      <td colspan="6" class="text-center text-muted py-4">
                        No categories found. Click "New Category" to create one.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .nav-link {
      cursor: pointer;
    }
  `]
})
export class CategoryListComponent implements OnInit {
  categories = signal<IncomeExpenseCategory[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  selectedType = signal<IncomeExpenseType | null>(null);
  
  readonly incomeType = IncomeExpenseType.Income;
  readonly expenseType = IncomeExpenseType.Expense;

  constructor(
    private accountingService: AccountingService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading.set(true);
    this.error.set(null);
    
    this.accountingService.getCategories(this.selectedType() ?? undefined).subscribe({
      next: (data) => {
        this.categories.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load categories: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  filterByType(type: IncomeExpenseType | null) {
    this.selectedType.set(type);
    this.loadCategories();
  }

  createCategory() {
    this.router.navigate(['/accounting/categories/create']);
  }

  editCategory(id: string) {
    this.router.navigate(['/accounting/categories/edit', id]);
  }

  deleteCategory(category: IncomeExpenseCategory) {
    if (confirm(`Are you sure you want to delete category "${category.name}"?`)) {
      this.accountingService.deleteCategory(category.id).subscribe({
        next: () => {
          this.loadCategories();
        },
        error: (err) => {
          alert('Failed to delete category: ' + err.message);
        }
      });
    }
  }
}
