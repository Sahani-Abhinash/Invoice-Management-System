import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CurrencyService, Currency } from '../currency.service';

@Component({
  selector: 'app-currency-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h4 class="mb-0">Currency Management</h4>
              <button class="btn btn-primary" (click)="createCurrency()">
                <i class="bi bi-plus-circle"></i> New Currency
              </button>
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

              <!-- Currencies Table -->
              <div *ngIf="!loading() && !error()" class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Symbol</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let currency of currencies()">
                      <td><strong>{{ currency.code }}</strong></td>
                      <td>{{ currency.name }}</td>
                      <td>{{ currency.symbol }}</td>
                      <td>
                        <span [class]="currency.isActive ? 'badge bg-success' : 'badge bg-secondary'">
                          {{ currency.isActive ? 'Active' : 'Inactive' }}
                        </span>
                      </td>
                      <td>
                        <button class="btn btn-sm btn-outline-primary me-2" 
                                (click)="editCurrency(currency.id)"
                                title="Edit">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" 
                                (click)="deleteCurrency(currency)"
                                title="Delete">
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                    <tr *ngIf="currencies().length === 0">
                      <td colspan="5" class="text-center text-muted py-4">
                        No currencies found. Click "New Currency" to create one.
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
    .table th {
      white-space: nowrap;
    }
  `]
})
export class CurrencyListComponent implements OnInit {
  currencies = signal<Currency[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private currencyService: CurrencyService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCurrencies();
  }

  loadCurrencies() {
    this.loading.set(true);
    this.error.set(null);
    
    this.currencyService.getCurrencies().subscribe({
      next: (data) => {
        this.currencies.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load currencies: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  createCurrency() {
    this.router.navigate(['/accounting/currencies/create']);
  }

  editCurrency(id: string) {
    this.router.navigate(['/accounting/currencies/edit', id]);
  }

  deleteCurrency(currency: Currency) {
    if (confirm(`Delete currency "${currency.code} - ${currency.name}"? This action cannot be undone.`)) {
      this.currencyService.deleteCurrency(currency.id).subscribe({
        next: () => {
          this.loadCurrencies();
        },
        error: (err) => {
          alert('Failed to delete currency: ' + err.message);
        }
      });
    }
  }
}
