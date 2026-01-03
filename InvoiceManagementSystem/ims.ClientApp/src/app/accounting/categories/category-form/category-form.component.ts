import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CategoryService } from '../../../services/category.service';
import { Category, CategoryType } from '../../../models/category.model';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.css'
})
export class CategoryFormComponent implements OnInit {
  categoryForm: FormGroup;
  isEditMode = false;
  categoryId: string | null = null;
  loading = false;
  error: string | null = null;
  CategoryType = CategoryType;
  selectedType: CategoryType = CategoryType.Expense;
  private cdr = inject(ChangeDetectorRef);

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      type: [CategoryType.Expense, Validators.required]
    });
  }

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.paramMap.get('id');
    
    // Get type from query params if creating new
    const typeParam = this.route.snapshot.queryParamMap.get('type');
    if (typeParam && !this.categoryId) {
      const type = Number(typeParam);
      this.selectedType = type;
      this.categoryForm.patchValue({ type: type });
    }
    
    if (this.categoryId) {
      this.isEditMode = true;
      this.loadCategory();
    }
  }

  setType(type: CategoryType): void {
    this.selectedType = type;
    this.categoryForm.patchValue({ type: type });
  }

  loadCategory(): void {
    if (!this.categoryId) return;

    this.loading = true;
    this.categoryService.getById(this.categoryId).subscribe({
      next: (category: Category) => {
        this.selectedType = category.type;
        this.categoryForm.patchValue({
          name: category.name,
          description: category.description,
          type: category.type
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load category';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const dto = {
      name: this.categoryForm.value.name,
      description: this.categoryForm.value.description,
      type: Number(this.categoryForm.value.type)
    };

    console.log('Submitting category:', dto);

    const request = this.isEditMode && this.categoryId
      ? this.categoryService.update(this.categoryId, dto)
      : this.categoryService.create(dto);

    request.subscribe({
      next: (result) => {
        console.log('Category saved successfully:', result);
        this.router.navigate(['/categories']);
      },
      error: (err) => {
        console.error('Failed to save category:', err);
        this.error = err.error?.error || err.error?.message || 'Failed to save category';
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/categories']);
  }
}
