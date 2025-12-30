import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CustomerService, Customer } from '../customer.service';
import { Branch } from '../../branch/branch.service';
import { Address, AddressService } from '../../../Master/geography/address/address.service';
import { filter } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit {
  customers: Customer[] = [];
  isLoading = true;

  constructor(
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
        this.customers = [...data];
        // Load addresses for each customer
        if (this.customers.length > 0) {
          this.loadCustomerAddresses();
        } else {
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

  loadCustomerAddresses() {
    const addressRequests = this.customers.map(customer =>
      this.addressService.getForOwner('Customer', customer.id)
    );

    forkJoin(addressRequests).subscribe({
      next: addressArrays => {
        addressArrays.forEach((addresses, index) => {
          this.customers[index].addresses = addresses;
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

  formatAddress(addresses?: Address[]): string {
    if (!addresses || addresses.length === 0) return '—';
    const addr = addresses[0]; // Show primary/first address
    const parts = [] as string[];
    if (addr.line1) parts.push(addr.line1);
    if (addr.city?.name) parts.push(addr.city.name);
    if (addr.state?.name) parts.push(addr.state.name);
    if (addr.country?.name) parts.push(addr.country.name);
    return parts.length ? parts.join(', ') : '—';
  }
}
