import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WarehouseService, Warehouse } from '../warehouse.service';

@Component({
  selector: 'app-warehouse-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './warehouse-list.component.html',
  styleUrls: []
})
export class WarehouseListComponent implements OnInit {
  warehouses: Warehouse[] = [];

  constructor(
    private warehouseService: WarehouseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadWarehouses();
  }

  loadWarehouses() {
    this.warehouseService.getAll().subscribe(
      data => {
        this.warehouses = data;
        this.cdr.detectChanges();
      },
      error => {
        console.error('Error loading warehouses:', error);
      }
    );
  }

  deleteWarehouse(id: string) {
    if (confirm('Are you sure to delete this warehouse?')) {
      this.warehouseService.delete(id).subscribe(() => this.loadWarehouses());
    }
  }

  editWarehouse(id: string) {
    this.router.navigate(['/warehouses/edit', id]);
  }

  createWarehouse() {
    this.router.navigate(['/warehouses/create']);
  }

  branchName(w: Warehouse): string {
    return (w as any)?.branch?.name ?? '—';
  }
}
