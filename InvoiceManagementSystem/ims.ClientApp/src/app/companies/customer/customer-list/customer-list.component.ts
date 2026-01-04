import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CustomerService, Customer } from '../customer.service';
import { Branch } from '../../branch/branch.service';
import { Address, AddressService } from '../../../Master/geography/address/address.service';
import { filter } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { TableDataManagerService } from '../../../shared/services/table-data-manager.service';
import { TableControlsComponent } from '../../../shared/components/table-controls/table-controls.component';
import { TablePaginationComponent } from '../../../shared/components/table-pagination/table-pagination.component';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TableControlsComponent, TablePaginationComponent],
  providers: [TableDataManagerService],
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit {
  isLoading = true;
  customerAddresses = new Map<string, Address>();
  Math = Math;

  constructor(
    public tableManager: TableDataManagerService<Customer>,
    private customerService: CustomerService,
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
    this.customerService.getAll().subscribe({
      next: data => {
        const customers = [...data];
        this.customerAddresses.clear();
        // Load addresses for each customer
        if (customers.length > 0) {
          this.loadCustomerAddresses(customers);
        } else {
          this.tableManager.setData([]);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: err => {
        console.error('Error loading customers:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadCustomerAddresses(customers: Customer[]) {
    const addressRequests = customers.map(customer =>
      this.addressService.getForOwner('Customer', customer.id)
    );

    forkJoin(addressRequests).subscribe({
      next: addressArrays => {
        addressArrays.forEach((addresses, index) => {
          const customer = customers[index];
          // Find and store primary address
          if (addresses && addresses.length > 0) {
            const primaryAddress = addresses.find((a: any) => a.isPrimary) || addresses[0];
            this.customerAddresses.set(customer.id, primaryAddress);
          }
        });
        this.tableManager.setData(customers);
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
    this.tableManager.applySearch(searchText, (customer, search) => {
      const name = customer.name?.toLowerCase() || '';
      const contactName = customer.contactName?.toLowerCase() || '';
      const email = customer.email?.toLowerCase() || '';
      const phone = customer.phone?.toLowerCase() || '';
      const taxNumber = customer.taxNumber?.toLowerCase() || '';
      const branchName = customer.branch?.name?.toLowerCase() || '';
      const address = this.formatAddress(this.address(customer.id)).toLowerCase();
      return name.includes(search) || contactName.includes(search) || 
             email.includes(search) || phone.includes(search) || 
             taxNumber.includes(search) || branchName.includes(search) || 
             address.includes(search);
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
        case 'taxNumber': aValue = a.taxNumber || ''; bValue = b.taxNumber || ''; break;
        case 'branch': aValue = a.branch?.name || ''; bValue = b.branch?.name || ''; break;
        case 'address': 
          aValue = this.formatAddress(this.address(a.id));
          bValue = this.formatAddress(this.address(b.id));
          break;
      }
      return aValue.toLowerCase() < bValue.toLowerCase() ? -1 : 1;
    });
  }

  address(customerId: string): Address | undefined {
    return this.customerAddresses.get(customerId);
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
    this.router.navigate(['/customers/edit', id]);
  }

  create() {
    this.router.navigate(['/customers/create']);
  }

  delete(id: string) {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    this.customerService.delete(id).subscribe({
      next: () => this.load(),
      error: err => {
        console.error('Error deleting customer:', err);
        alert('Failed to delete customer');
      }
    });
  }

  getBranchName(branch?: Branch): string {
    return branch?.name || '—';
  }
}
