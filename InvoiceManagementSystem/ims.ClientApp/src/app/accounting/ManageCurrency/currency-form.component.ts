import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyService, CreateCurrency } from '../currency.service';

@Component({
  selector: 'app-currency-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12 col-lg-6">
          <div class="card">
            <div class="card-header">
              <h4 class="mb-0">{{ isEditMode() ? 'Edit' : 'Create' }} Currency</h4>
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
              <form *ngIf="!loading()" (ngSubmit)="save()" #currencyForm="ngForm">
                <div class="mb-3">
                  <label for="code" class="form-label">Code <span class="text-danger">*</span></label>
                  <input type="text" 
                         class="form-control" 
                         id="code" 
                         name="code"
                         [(ngModel)]="currency.code" 
                         required
                         maxlength="3"
                         placeholder="e.g., USD, EUR, GBP"
                         [disabled]="isEditMode()">
                  <small class="form-text text-muted">
                    3-letter ISO currency code (e.g., USD, EUR, GBP)
                  </small>
                </div>

                <div class="mb-3">
                  <label for="name" class="form-label">Name <span class="text-danger">*</span></label>
                  <input type="text" 
                         class="form-control" 
                         id="name" 
                         name="name"
                         [(ngModel)]="currency.name" 
                         required
                         maxlength="100"
                         placeholder="e.g., US Dollar, Euro, British Pound">
                </div>

                <div class="mb-3">
                  <label for="symbol" class="form-label">Symbol <span class="text-danger">*</span></label>
                  <input type="text" 
                         class="form-control" 
                         id="symbol" 
                         name="symbol"
                         [(ngModel)]="currency.symbol" 
                         required
                         maxlength="5"
                         placeholder="e.g., $, €, £">
                </div>

                <div class="mb-3 form-check">
                  <input type="checkbox" 
                         class="form-check-input" 
                         id="isActive" 
                         name="isActive"
                         [(ngModel)]="currency.isActive">
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
                          [disabled]="!currencyForm.form.valid || saving()">
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
export class CurrencyFormComponent implements OnInit {
  currency: CreateCurrency = {
    code: '',
    name: '',
    symbol: '',
    isActive: true
  };

  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  isEditMode = signal(false);
  currencyId: string | null = null;

  constructor(
    private currencyService: CurrencyService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.currencyId = this.route.snapshot.paramMap.get('id');
    this.isEditMode.set(!!this.currencyId);

    if (this.isEditMode() && this.currencyId) {
      this.loadCurrency(this.currencyId);
    }
  }

  loadCurrency(id: string) {
    this.loading.set(true);
    this.currencyService.getCurrencyById(id).subscribe({
      next: (data) => {
        this.currency = {
          code: data.code,
          name: data.name,
          symbol: data.symbol,
          isActive: data.isActive
        };
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load currency: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  save() {
    this.saving.set(true);
    this.error.set(null);

    if (this.isEditMode() && this.currencyId) {
      this.currencyService.updateCurrency(this.currencyId, this.currency).subscribe({
        next: () => {
          this.router.navigate(['/accounting/currencies']);
        },
        error: (err: any) => {
          this.error.set('Failed to save currency: ' + err.message);
          this.saving.set(false);
        }
      });
    } else {
      this.currencyService.createCurrency(this.currency).subscribe({
        next: () => {
          this.router.navigate(['/accounting/currencies']);
        },
        error: (err: any) => {
          this.error.set('Failed to save currency: ' + err.message);
          this.saving.set(false);
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/accounting/currencies']);
  }
}
