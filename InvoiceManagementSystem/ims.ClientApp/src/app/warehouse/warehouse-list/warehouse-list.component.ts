import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { WarehouseService, Warehouse } from '../warehouse.service';
import { Address, AddressService } from '../../Master/geography/address/address.service';
import { filter } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-warehouse-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './warehouse-list.component.html',
  styleUrls: []
})
export class WarehouseListComponent implements OnInit {
  warehouses: Warehouse[] = [];
  isLoading = true;
  warehouseAddresses = new Map<string, Address>();

  constructor(
    private warehouseService: WarehouseService,
    private addressService: AddressService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadWarehouses();
    // Refresh list when navigating back from create/edit
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.loadWarehouses();
    });
  }

  loadWarehouses() {
    this.isLoading = true;
    this.warehouseService.getAll().subscribe({
      next: data => {
        this.warehouses = [...data];
        this.warehouseAddresses.clear();
        // Load addresses for each warehouse
        if (this.warehouses.length > 0) {
          this.loadWarehouseAddresses();
        } else {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: err => {
        console.error('Error loading warehouses:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadWarehouseAddresses() {
    const addressRequests = this.warehouses.map(warehouse =>
      this.addressService.getForOwner('Warehouse', warehouse.id)
    );

    forkJoin(addressRequests).subscribe({
      next: addressArrays => {
        addressArrays.forEach((addresses, index) => {
          const warehouse = this.warehouses[index];
          // Find and store primary address
          if (addresses && addresses.length > 0) {
            const primaryAddress = addresses.find((a: any) => a.isPrimary) || addresses[0];
            this.warehouseAddresses.set(warehouse.id, primaryAddress);
          }
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error loading addresses:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  address(warehouseId: string): Address | undefined {
    return this.warehouseAddresses.get(warehouseId);
  }

  formatAddress(addr?: Address): string {
    if (!addr) return '—';
    const parts = [] as string[];
    if (addr.line1) parts.push(addr.line1);
    if (addr.city?.name) parts.push(addr.city.name);
    if (addr.state?.name) parts.push(addr.state.name);
    if (addr.postalCode?.code) parts.push(addr.postalCode.code);
    return parts.length ? parts.join(', ') : '—';
  }

  branchName(w: Warehouse): string {
    return (w as any)?.branch?.name ?? '—';
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
}
