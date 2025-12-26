import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AddressService, Address, AddressType } from '../address.service';

@Component({
  selector: 'app-address-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './address-list.component.html',
  styleUrls: []
})
export class AddressListComponent implements OnInit {
  addresses: Address[] = [];
  loading = false;
  error: string | null = null;

  AddressType = AddressType;

  constructor(
    private addressService: AddressService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAddresses();
  }

  loadAddresses() {
    this.loading = true;
    this.addressService.getAll().subscribe({
      next: data => { this.addresses = data; this.loading = false; this.cdr.detectChanges(); },
      error: err => { this.error = 'Failed to load addresses'; this.loading = false; console.error(err); }
    });
  }

  deleteAddress(id: string) {
    if (!confirm('Delete this address?')) return;
    this.addressService.delete(id).subscribe({ next: () => this.loadAddresses() });
  }

  editAddress(id: string) { this.router.navigate(['/geography/addresses/edit', id]); }
  createAddress() { this.router.navigate(['/geography/addresses/create']); }
}
