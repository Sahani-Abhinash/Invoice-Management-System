import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-table-controls',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card mb-3">
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <!-- Search -->
          <div class="col-lg-6">
            <label class="form-label fw-semibold">Search</label>
            <input type="text" class="form-control" [placeholder]="searchPlaceholder" 
              [ngModel]="searchText" (ngModelChange)="onSearchChange($event)">
          </div>

          <!-- Page Size -->
          <div class="col-lg-3">
            <label class="form-label fw-semibold">Page Size</label>
            <select class="form-select" [ngModel]="pageSize" 
              (ngModelChange)="onPageSizeChange($event)">
              <option [value]="5">5 per page</option>
              <option [value]="10">10 per page</option>
              <option [value]="25">25 per page</option>
              <option [value]="50">50 per page</option>
            </select>
          </div>

          <!-- Total Records -->
          <div class="col-lg-3">
            <div class="alert alert-info mb-0">
              <small><strong>Total:</strong> {{ totalRecords }} record(s)</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TableControlsComponent {
  @Input() searchText = '';
  @Input() searchPlaceholder = 'Search...';
  @Input() pageSize = 10;
  @Input() totalRecords = 0;
  
  @Output() searchChange = new EventEmitter<string>();
  @Output() pageSizeChange = new EventEmitter<number>();

  onSearchChange(value: string) {
    this.searchChange.emit(value);
  }

  onPageSizeChange(value: number) {
    this.pageSizeChange.emit(value);
  }
}
