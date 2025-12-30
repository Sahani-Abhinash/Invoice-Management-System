import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AccountingService, Account } from '../accounting.service';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.css']
})
export class AccountListComponent implements OnInit {
  accounts: Account[] = [];
  filteredAccounts: Account[] = [];
  isLoading = true;
  errorMessage = '';
  searchTerm = '';

  constructor(
    private accountingService: AccountingService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.accountingService.getAllAccounts().subscribe({
      next: (data) => {
        this.accounts = data;
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading accounts:', err);
        this.errorMessage = 'Failed to load accounts';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    this.filteredAccounts = this.accounts.filter(account => {
      const matchesSearch = !this.searchTerm ||
        account.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (account.description || '').toLowerCase().includes(this.searchTerm.toLowerCase());

      return matchesSearch;
    });
  }

  onSearchChange(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  createAccount(): void {
    this.router.navigate(['/accounting/accounts/create']);
  }

  editAccount(id: string): void {
    this.router.navigate(['/accounting/accounts/edit', id]);
  }

  viewAccount(id: string): void {
    this.router.navigate(['/accounting/accounts', id]);
  }
}
