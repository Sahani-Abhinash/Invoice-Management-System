import { Component, OnInit, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CategoryService } from '../../../services/category.service';
import { Category, CategoryType } from '../../../models/category.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css'
})
export class CategoryListComponent implements OnInit, OnDestroy {
  private categoryService = inject(CategoryService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  categories: Category[] = [];
  filteredCategories: Category[] = [];
  loading = false;
  error: string | null = null;
  activeTab: CategoryType | 'all' = 'all';
  CategoryType = CategoryType;

  ngOnInit(): void {
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCategories(): void {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();
    
    this.categoryService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('Categories loaded:', data);
          this.categories = data;
          this.filterByTab();
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load categories:', err);
          this.error = err.error?.message || err.message || 'Failed to load categories. Please check if the API is running.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  setActiveTab(type: CategoryType | 'all'): void {
    this.activeTab = type;
    this.filterByTab();
  }

  filterByTab(): void {
    if (this.activeTab === 'all') {
      this.filteredCategories = this.categories;
    } else {
      this.filteredCategories = this.categories.filter(c => c.type === this.activeTab);
    }
  }

  addCategory(): void {
    this.router.navigate(['/categories/new']);
  }

  editCategory(id: string): void {
    this.router.navigate(['/categories/edit', id]);
  }

  deleteCategory(category: Category): void {
    if (category.isSystemCategory) {
      alert('System categories cannot be deleted');
      return;
    }

    if (confirm(`Are you sure you want to delete category "${category.name}"?`)) {
      this.categoryService.delete(category.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadCategories();
          },
          error: (err) => {
            alert('Failed to delete category');
            console.error(err);
          }
        });
    }
  }
}
