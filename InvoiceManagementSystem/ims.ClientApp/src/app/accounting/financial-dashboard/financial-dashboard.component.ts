import { Component, OnInit, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AccountingService, FinancialSummary } from '../accounting.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface AccountSummary {
  accountId: string;
  accountCode: string;
  accountName: string;
  balance: number;
  accountType: string;
}

@Component({
  selector: 'app-financial-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './financial-dashboard.component.html',
  styleUrls: ['./financial-dashboard.component.css']
})
export class FinancialDashboardComponent implements OnInit, OnDestroy {
  private accountingService = inject(AccountingService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  summary: FinancialSummary | null = null;
  keyAccounts: AccountSummary[] = [];
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    // Reset loading state when returning to this component
    if (this.loading && this.summary) {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = null;
    this.summary = null;
    this.cdr.detectChanges();
    
    // Load financial data
    this.loadFinancialSummary();
  }

  loadFinancialSummary(): void {
    this.accountingService.getFinancialSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('Financial summary loaded:', data);
          this.summary = data;
          this.loading = false;
          this.error = null;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading financial summary:', err);
          this.error = err?.error?.message || 'Failed to load financial summary. Please try again.';
          this.loading = false;
          this.summary = null;
          this.cdr.detectChanges();
        }
      });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  refresh(): void {
    this.loadDashboard();
  }

  getAccountTypeClass(type: string): string {
    switch(type?.toLowerCase()) {
      case 'asset': return 'asset';
      case 'liability': return 'liability';
      case 'equity': return 'equity';
      case 'revenue': return 'revenue';
      case 'expense': return 'expense';
      default: return '';
    }
  }
}
