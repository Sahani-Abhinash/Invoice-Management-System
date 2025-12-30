import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CompanyService } from '../company.service';
import { Address, AddressService } from '../../../Master/geography/address/address.service';

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './company-form.component.html',
  styleUrls: ['./company-form.component.css']
})
export class CompanyFormComponent implements OnInit {
  form!: FormGroup;
  id: string | null = null;
  addresses: Address[] = [];
  selectedAddressId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private companyService: CompanyService,
    private addressService: AddressService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      taxNumber: ['', Validators.required],
      email: [''],
      phone: [''],
      logoUrl: [''],
      addressId: ['']
    });
  }

  ngOnInit(): void {
    this.loadAddresses();
    this.id = this.route.snapshot.paramMap.get('id');
    if(this.id){
      this.companyService.getById(this.id).subscribe(data => {
        this.form.patchValue({
          name: data.name,
          taxNumber: data.taxNumber,
          email: (data as any).email || '',
          phone: (data as any).phone || '',
          logoUrl: (data as any).logoUrl || ''
        });
      });
      // Load addresses for this company
      this.addressService.getForOwner('Company', this.id).subscribe(addrs => {
        if (addrs.length > 0) {
          this.selectedAddressId = addrs[0].id;
          this.form.patchValue({ addressId: addrs[0].id });
        }
      });
    }
  }

  loadAddresses() {
    this.addressService.getAll().subscribe(
      data => {
        this.addresses = data;
      },
      error => {
        console.error('Error loading addresses:', error);
      }
    );
  }

  formatAddress(addr: Address): string {
    const parts = [];
    if (addr.country?.name) parts.push(addr.country.name);
    if (addr.state?.name) parts.push(addr.state.name);
    if (addr.city?.name) parts.push(addr.city.name);
    if (addr.postalCode?.code) parts.push(addr.postalCode.code);
    if (addr.line1) parts.push(addr.line1);
    if (addr.line2) parts.push(addr.line2);
    
    return parts.length > 0 ? parts.join(', ') : 'Unknown Address';
  }

  save() {
    if(this.form.invalid) return;

    const formData = {
      name: this.form.get('name')?.value,
      taxNumber: this.form.get('taxNumber')?.value,
      email: this.form.get('email')?.value,
      phone: this.form.get('phone')?.value,
      logoUrl: this.form.get('logoUrl')?.value
    };

    const addressId = this.form.get('addressId')?.value;

    if(this.id){
      this.companyService.update(this.id, formData).subscribe(() => {
        // If address is selected, link it via entityAddress
        if (addressId) {
          this.addressService.link(addressId, 'Company', this.id!, false).subscribe(
            () => this.router.navigate(['/companies']),
            error => {
              console.error('Error linking address:', error);
              this.router.navigate(['/companies']);
            }
          );
        } else {
          this.router.navigate(['/companies']);
        }
      });
    } else {
      this.companyService.create(formData).subscribe(createdCompany => {
        // If address is selected, link it via entityAddress
        if (addressId) {
          this.addressService.link(addressId, 'Company', createdCompany.id, false).subscribe(
            () => this.router.navigate(['/companies']),
            error => {
              console.error('Error linking address:', error);
              this.router.navigate(['/companies']);
            }
          );
        } else {
          this.router.navigate(['/companies']);
        }
      });
    }
  }
}
