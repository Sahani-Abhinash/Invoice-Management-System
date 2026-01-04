import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableDataManagerService } from '../../services/table-data-manager.service';

@Component({
  selector: 'app-table-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card-footer bg-light d-flex justify-content-between align-items-center" *ngIf="tableManager.getTotalPages() > 1">
      <div>
        <small class="text-muted">
          Showing <strong>{{ (tableManager.getCurrentPage() - 1) * tableManager.getPageSize() + 1 }}</strong> to 
          <strong>{{ Math.min(tableManager.getCurrentPage() * tableManager.getPageSize(), tableManager.getTotalRecords()) }}</strong> of 
          <strong>{{ tableManager.getTotalRecords() }}</strong> results
        </small>
      </div>
      <nav>
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" [class.disabled]="tableManager.getCurrentPage() === 1">
            <button class="page-link" (click)="tableManager.goToPage(tableManager.getCurrentPage() - 1)" 
              [disabled]="tableManager.getCurrentPage() === 1">
              <i class="las la-angle-left"></i>
            </button>
          </li>

          <li class="page-item" *ngIf="tableManager.getPaginationNumbers()[0] > 1">
            <button class="page-link" (click)="tableManager.goToPage(1)">1</button>
          </li>

          <li class="page-item disabled" *ngIf="tableManager.getPaginationNumbers()[0] > 2">
            <span class="page-link">...</span>
          </li>

          <li class="page-item" *ngFor="let page of tableManager.getPaginationNumbers()" 
            [class.active]="tableManager.getCurrentPage() === page">
            <button class="page-link" (click)="tableManager.goToPage(page)" 
              [class.active]="tableManager.getCurrentPage() === page">
              {{ page }}
            </button>
          </li>

          <li class="page-item disabled" *ngIf="tableManager.getPaginationNumbers()[tableManager.getPaginationNumbers().length - 1] < tableManager.getTotalPages() - 1">
            <span class="page-link">...</span>
          </li>

          <li class="page-item" *ngIf="tableManager.getPaginationNumbers()[tableManager.getPaginationNumbers().length - 1] < tableManager.getTotalPages()">
            <button class="page-link" (click)="tableManager.goToPage(tableManager.getTotalPages())">{{ tableManager.getTotalPages() }}</button>
          </li>

          <li class="page-item" [class.disabled]="tableManager.getCurrentPage() === tableManager.getTotalPages()">
            <button class="page-link" (click)="tableManager.goToPage(tableManager.getCurrentPage() + 1)" 
              [disabled]="tableManager.getCurrentPage() === tableManager.getTotalPages()">
              <i class="las la-angle-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  `
})
export class TablePaginationComponent {
  @Input() tableManager!: TableDataManagerService<any>;
  Math = Math;
}
