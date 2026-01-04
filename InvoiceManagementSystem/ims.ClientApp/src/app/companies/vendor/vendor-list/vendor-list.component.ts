import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { VendorService, Vendor } from '../vendor.service';
import { Address, AddressService } from '../../../Master/geography/address/address.service';
import { filter } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { TableDataManagerService } from '../../../shared/services/table-data-manager.service';
import { TableControlsComponent } from '../../../shared/components/table-controls/table-controls.component';
import { TablePaginationComponent } from '../../../shared/components/table-pagination/table-pagination.component';

@Component({
  selector: 'app-vendor-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableControlsComponent, TablePaginationComponent],
  providers: [TableDataManagerService],
  templateUrl: './vendor-list.component.html',
  styleUrls: ['./vendor-list.component.scss']
})
export class VendorListComponent implements OnInit {
  isLoading = true;
  vendorAddresses = new Map<string, Address>();
  Math = Math;

  constructor(
    public tableManager: TableDataManagerService<Vendor>,
    private vendorService: VendorService,
    private addressService: AddressService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
    // Refresh list when navigating back from create/edit
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.load();
    });
  }

  load() {
    this.isLoading = true;
    this.vendorService.getAll().subscribe({
      next: data => {
        const vendors = [...data];
        this.vendorAddresses.clear();
        // Load addresses for each vendor
        if (vendors.length > 0) {
          this.loadVendorAddresses(vendors);
        } else {
          this.tableManager.setData([]);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: err => {
        console.error('Error loading vendors:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadVendorAddresses(vendors: Vendor[]) {
    const addressRequests = vendors.map(vendor =>
      this.addressService.getForOwner('Vendor', vendor.id)
    );

    forkJoin(addressRequests).subscribe({
      next: addressArrays => {
        addressArrays.forEach((addresses, index) => {
          const vendor = vendors[index];
          // Find and store primary address
          if (addresses && addresses.length > 0) {
            const primaryAddress = addresses.find((a: any) => a.isPrimary) || addresses[0];
            this.vendorAddresses.set(vendor.id, primaryAddress);
          }
        });
        this.tableManager.setData(vendors);
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

  onSearch(searchText: string) {
    this.tableManager.applySearch(searchText, (vendor, search) => {
      const name = vendor.name?.toLowerCase() || '';
      const contactName = vendor.contactName?.toLowerCase() || '';
      const email = vendor.email?.toLowerCase() || '';
      const phone = vendor.phone?.toLowerCase() || '';
      const address = this.formatAddress(this.address(vendor.id)).toLowerCase();
      return name.includes(search) || contactName.includes(search) || 
             email.includes(search) || phone.includes(search) || address.includes(search);
    });
  }

  onSort(column: string) {
    this.tableManager.sortBy(column, (a, b, col) => {
      let aValue = '';
      let bValue = '';
      switch (col) {
        case 'name': aValue = a.name || ''; bValue = b.name || ''; break;
        case 'contactName': aValue = a.contactName || ''; bValue = b.contactName || ''; break;
        case 'email': aValue = a.email || ''; bValue = b.email || ''; break;
        case 'phone': aValue = a.phone || ''; bValue = b.phone || ''; break;
        case 'address': 
          aValue = this.formatAddress(this.address(a.id));
          bValue = this.formatAddress(this.address(b.id));
          break;
      }
      return aValue.toLowerCase() < bValue.toLowerCase() ? -1 : 1;
    });
  }

  address(vendorId: string): Address | undefined {
    return this.vendorAddresses.get(vendorId);
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

  edit(id: string) {
    this.router.navigate(['/vendors/edit', id]);
  }

  create() {
    this.router.navigate(['/vendors/create']);
  }

  delete(id: string) {
    if (!confirm('Are you sure you want to delete this vendor?')) return;
    this.vendorService.delete(id).subscribe(() => this.load());
  }
}
