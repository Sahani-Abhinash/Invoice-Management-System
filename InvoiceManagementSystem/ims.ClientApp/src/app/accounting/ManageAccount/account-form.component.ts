import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AccountingService, CreateAccount } from '../accounting.service';

@Component({
  selector: 'app-account-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './account-form.component.html',
  styleUrls: ['./account-form.component.css']
})
export class AccountFormComponent implements OnInit {
  accountForm: FormGroup;
  isEditMode = false;
  accountId: string | null = null;
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private accountingService: AccountingService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.accountForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.accountId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.accountId;

    if (this.isEditMode && this.accountId) {
      this.loadAccount(this.accountId);
    }
  }

  loadAccount(id: string): void {
    this.isLoading = true;
    this.accountingService.getAccountById(id).subscribe({
      next: (account) => {
        this.accountForm.patchValue({
          name: account.name,
          description: account.description
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading account:', err);
        this.errorMessage = 'Failed to load account';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (!this.accountForm.valid) {
      this.accountForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.accountForm.value;
    const accountData: CreateAccount = {
      name: formValue.name,
      description: formValue.description || ''
    };

    const request = this.isEditMode && this.accountId
      ? this.accountingService.updateAccount(this.accountId, accountData)
      : this.accountingService.createAccount(accountData);

    request.subscribe({
      next: (account) => {
        this.successMessage = `Account ${this.isEditMode ? 'updated' : 'created'} successfully!`;
        this.isSaving = false;
        setTimeout(() => {
          this.router.navigate(['/accounting/accounts']);
        }, 1500);
      },
      error: (err) => {
        console.error('Error saving account:', err);
        this.errorMessage = err.error?.message || 'Failed to save account';
        this.isSaving = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/accounting/accounts']);
  }
}
