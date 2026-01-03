import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CompanyService } from '../company.service';
import { Address, AddressService } from '../../../Master/geography/address/address.service';
import { CurrencyService, Currency } from '../../../accounting/currency.service';

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './company-form.component.html',
  styleUrls: ['./company-form.component.css']
})
export class CompanyFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private companyService = inject(CompanyService);
  private addressService = inject(AddressService);
  private currencyService = inject(CurrencyService);
  private cdr = inject(ChangeDetectorRef);
  private sanitizer = inject(DomSanitizer);
  private resolveLogoUrl(url: string): SafeUrl {
    const absolute = url && url.startsWith('http') ? url : `${this.companyService.getBaseUrl()}${url ?? ''}`;
    return this.sanitizer.bypassSecurityTrustUrl(absolute);
  }

  form!: FormGroup;
  id: string | null = null;
  addresses: Address[] = [];
  currencies: Currency[] = [];
  selectedAddressId: string | null = null;
  selectedLogoFile: File | null = null;
  logoUrl: SafeUrl | null = null;
  isUploading = false;

  constructor() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      taxNumber: ['', Validators.required],
      email: [''],
      phone: [''],
      logoUrl: [''],
      addressId: [''],
      defaultCurrencyId: ['']
    });
  }

  ngOnInit(): void {
    this.loadAddresses();
    this.loadCurrencies();
    this.id = this.route.snapshot.paramMap.get('id');
    if(this.id){
      this.companyService.getById(this.id).subscribe(data => {
        this.form.patchValue({
          name: data.name,
          taxNumber: data.taxNumber,
          email: (data as any).email || '',
          phone: (data as any).phone || '',
          logoUrl: (data as any).logoUrl || '',
          defaultCurrencyId: (data as any).defaultCurrencyId || ''
        });
        if ((data as any).logoUrl) {
          this.logoUrl = this.resolveLogoUrl((data as any).logoUrl);
        }
      });
      // Load addresses for this company
      this.addressService.getForOwner('Company', this.id).subscribe(addrs => {
        if (addrs.length > 0) {
          this.selectedAddressId = addrs[0].id;
          this.form.patchValue({ addressId: addrs[0].id });
        }
        this.cdr.detectChanges();
      });
    }
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedLogoFile = input.files[0];
    }
  }

  uploadLogo(): void {
    if (!this.selectedLogoFile || !this.id) return;

    this.isUploading = true;
    const formData = new FormData();
    formData.append('file', this.selectedLogoFile);

    // Call your API endpoint to upload the logo
    this.companyService.uploadLogo(this.id, formData).subscribe({
      next: (response: any) => {
        this.logoUrl = this.resolveLogoUrl(response.logoUrl);
        this.form.patchValue({ logoUrl: response.logoUrl });
        this.selectedLogoFile = null;
        this.isUploading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Logo upload failed:', error);
        this.isUploading = false;
        alert('Failed to upload logo');
        this.cdr.detectChanges();
      }
    });
  }

  removeLogo(): void {
    this.logoUrl = null;
    this.form.patchValue({ logoUrl: '' });
    this.selectedLogoFile = null;
  }

  loadAddresses() {
    this.addressService.getAll().subscribe(
      data => {
        this.addresses = data;
        this.cdr.detectChanges();
      },
      error => {
        console.error('Error loading addresses:', error);
      }
    );
  }

  loadCurrencies() {
    this.currencyService.getActiveCurrencies().subscribe(
      data => {
        this.currencies = data;
        this.cdr.detectChanges();
      },
      error => {
        console.error('Error loading currencies:', error);
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
      logoUrl: this.form.get('logoUrl')?.value,
      defaultCurrencyId: this.form.get('defaultCurrencyId')?.value || null
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
