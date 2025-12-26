import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VendorService, Vendor } from '../vendor.service';
import { Address, AddressService } from '../../../Master/geography/address/address.service';

@Component({
  selector: 'app-vendor-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './vendor-form.component.html',
  styleUrls: ['./vendor-form.component.css']
})
export class VendorFormComponent implements OnInit {
  form!: FormGroup;
  id: string | null = null;
  addresses: Address[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private vendorService: VendorService,
    private addressService: AddressService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      contactName: [''],
      email: ['', Validators.email],
      phone: [''],
      taxNumber: [''],
      addressId: ['']
    });
  }

  ngOnInit(): void {
    this.loadAddresses();
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.vendorService.getById(this.id).subscribe(vendor => {
        this.form.patchValue({
          name: vendor.name,
          contactName: vendor.contactName,
          email: vendor.email,
          phone: vendor.phone,
          taxNumber: vendor.taxNumber,
          addressId: vendor.addressId ?? vendor.address?.id ?? ''
        });
      });
    }
  }

  loadAddresses() {
    this.addressService.getAll().subscribe({
      next: data => (this.addresses = data),
      error: err => console.error('Error loading addresses:', err)
    });
  }

  formatAddress(addr: Address): string {
    const parts = [] as string[];
    if (addr.country?.name) parts.push(addr.country.name);
    if (addr.state?.name) parts.push(addr.state.name);
    if (addr.city?.name) parts.push(addr.city.name);
    if (addr.postalCode?.code) parts.push(addr.postalCode.code);
    if (addr.line1) parts.push(addr.line1);
    if (addr.line2) parts.push(addr.line2);
    return parts.length ? parts.join(', ') : 'Unknown Address';
  }

  save() {
    if (this.form.invalid) return;

    if (this.id) {
      this.vendorService.update(this.id, this.form.value).subscribe(() => this.router.navigate(['/vendors']));
    } else {
      this.vendorService.create(this.form.value).subscribe(() => this.router.navigate(['/vendors']));
    }
  }
}
