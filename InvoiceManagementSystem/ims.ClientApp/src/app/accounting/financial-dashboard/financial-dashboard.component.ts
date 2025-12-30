import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AccountingService, FinancialSummary } from '../accounting.service';

@Component({
  selector: 'app-financial-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './financial-dashboard.component.html',
  styleUrls: ['./financial-dashboard.component.css']
})
export class FinancialDashboardComponent implements OnInit {
  private accountingService = inject(AccountingService);
  private cdr = inject(ChangeDetectorRef);

  summary: FinancialSummary | null = null;
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.loadFinancialSummary();
  }

  loadFinancialSummary(): void {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();
    
    this.accountingService.getFinancialSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading financial summary:', err);
        this.error = 'Failed to load financial summary. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatCurrency(amount: number): string {
    return this.accountingService.formatCurrency(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  refresh(): void {
    this.loadFinancialSummary();
  }
}
