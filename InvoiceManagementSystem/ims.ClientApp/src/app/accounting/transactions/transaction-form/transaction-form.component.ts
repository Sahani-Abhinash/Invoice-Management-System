import { Component, OnInit, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TransactionService } from '../../../services/transaction.service';
import { CategoryService } from '../../../services/category.service';
import { Category, CategoryType } from '../../../models/category.model';
import { TransactionType } from '../../../models/transaction.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './transaction-form.component.html',
  styleUrl: './transaction-form.component.css'
})
export class TransactionFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  transactionForm: FormGroup;
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  loading = false;
  error: string | null = null;
  selectedType: TransactionType = TransactionType.Credit;
  TransactionType = TransactionType;

  constructor() {
    this.transactionForm = this.fb.group({
      transactionDate: [new Date().toISOString().split('T')[0], Validators.required],
      type: [TransactionType.Credit, Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      categoryId: ['', Validators.required],
      description: [''],
      reference: ['']
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    
    // Filter categories when transaction type changes
    this.transactionForm.get('type')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateSelectedType();
        this.filterCategories();
        // Reset category selection when type changes
        this.transactionForm.patchValue({ categoryId: '' });
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateSelectedType(): void {
    const typeValue = this.transactionForm.get('type')?.value;
    if (typeValue !== undefined) {
      this.selectedType = typeValue;
    }
  }

  setType(type: TransactionType): void {
    this.selectedType = type;
    this.transactionForm.patchValue({ type: type });
  }

  loadCategories(): void {
    this.categoryService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          // Filter out system categories for manual entry
          this.categories = data.filter(c => !c.isSystemCategory);
          this.filterCategories();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = 'Failed to load categories';
          console.error(err);
          this.cdr.detectChanges();
        }
      });
  }

  filterCategories(): void {
    const transactionType = this.transactionForm.get('type')?.value;
    if (transactionType === TransactionType.Credit) {
      // Credit = Income, so show Income categories
      this.filteredCategories = this.categories.filter(c => c.type === CategoryType.Income);
    } else {
      // Debit = Expense, so show Expense categories
      this.filteredCategories = this.categories.filter(c => c.type === CategoryType.Expense);
    }
  }

  onSubmit(): void {
    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();

    const formValue = this.transactionForm.value;
    const dto = {
      ...formValue,
      transactionDate: new Date(formValue.transactionDate),
      type: Number(formValue.type),
      amount: Number(formValue.amount)
    };

    console.log('Submitting transaction:', dto);

    this.transactionService.create(dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          console.log('Transaction created successfully:', result);
          this.router.navigate(['/transactions']);
        },
        error: (err) => {
          console.error('Failed to create transaction:', err);
          this.error = err.error?.message || err.message || 'Failed to create transaction';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  onCancel(): void {
    this.router.navigate(['/transactions']);
  }
}
