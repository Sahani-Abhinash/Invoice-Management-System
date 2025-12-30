import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { VendorService, Vendor } from '../vendor.service';
import { Address } from '../../../Master/geography/address/address.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-vendor-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vendor-list.component.html',
  styleUrls: ['./vendor-list.component.scss']
})
export class VendorListComponent implements OnInit {
  vendors: Vendor[] = [];

  constructor(
    private vendorService: VendorService,
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
    this.vendorService.getAll().subscribe({
      next: data => {
        // Assign new array reference to ensure view updates
        this.vendors = [...data];
        this.cdr.detectChanges();
      },
      error: err => console.error('Error loading vendors:', err)
    });
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

  formatAddress(addr?: Address): string {
    if (!addr) return '—';
    const parts = [] as string[];
    if (addr.country?.name) parts.push(addr.country.name);
    if (addr.state?.name) parts.push(addr.state.name);
    if (addr.city?.name) parts.push(addr.city.name);
    if (addr.postalCode?.code) parts.push(addr.postalCode.code);
    if (addr.line1) parts.push(addr.line1);
    if (addr.line2) parts.push(addr.line2);
    return parts.length ? parts.join(', ') : '—';
  }
}
