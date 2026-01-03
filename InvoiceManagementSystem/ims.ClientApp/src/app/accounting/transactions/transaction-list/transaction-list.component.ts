import { Component, OnInit, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TransactionService } from '../../../services/transaction.service';
import { Transaction, TransactionSummary, TransactionType } from '../../../models/transaction.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.css'
})
export class TransactionListComponent implements OnInit, OnDestroy {
  private transactionService = inject(TransactionService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  summary: TransactionSummary | null = null;
  loading = false;
  error: string | null = null;
  activeTab: 'all' | 'debit' | 'credit' = 'all';
  TransactionType = TransactionType;

  ngOnInit(): void {
    this.loadTransactions();
    this.loadSummary();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTransactions(): void {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();

    this.transactionService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('Transactions loaded:', data);
          this.transactions = data;
          this.filterByTab();
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load transactions:', err);
          this.error = err.error?.message || err.message || 'Failed to load transactions. Please check if the API is running.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  loadSummary(): void {
    this.transactionService.getSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.summary = data;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load summary:', err);
        }
      });
  }

  setActiveTab(tab: 'all' | 'debit' | 'credit'): void {
    this.activeTab = tab;
    this.filterByTab();
  }

  filterByTab(): void {
    if (this.activeTab === 'all') {
      this.filteredTransactions = this.transactions;
    } else if (this.activeTab === 'debit') {
      this.filteredTransactions = this.transactions.filter(t => t.type === TransactionType.Debit);
    } else {
      this.filteredTransactions = this.transactions.filter(t => t.type === TransactionType.Credit);
    }
  }

  addTransaction(): void {
    this.router.navigate(['/transactions/new']);
  }

  editTransaction(transaction: Transaction): void {
    this.router.navigate(['/transactions/edit', transaction.id]);
  }

  deleteTransaction(transaction: Transaction): void {
    if (transaction.sourceType !== 'Manual') {
      alert('Only manual transactions can be deleted');
      return;
    }

    if (confirm('Are you sure you want to delete this transaction?')) {
      this.transactionService.delete(transaction.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadTransactions();
            this.loadSummary();
          },
          error: (err) => {
            alert('Failed to delete transaction');
            console.error(err);
          }
        });
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  getTypeClass(type: TransactionType): string {
    return type === TransactionType.Debit ? 'text-danger' : 'text-success';
  }
}
