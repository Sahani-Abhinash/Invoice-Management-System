import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CustomerService, CreateCustomerDto } from '../customer.service';
import { BranchService, Branch } from '../../branch/branch.service';
import { AddressService, Address, OwnerType } from '../../../Master/geography/address/address.service';
import { of, forkJoin, catchError, map, concatMap } from 'rxjs';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FormsModule],
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.css']
})
export class CustomerFormComponent implements OnInit {
  form!: FormGroup;
  id: string | null = null;
  branches: Branch[] = [];
  addresses: Address[] = [];
  currentAddressId: string | null = null;
  isLoading = true;
  isSaving = false;
  isEdit = false;
  private cdr = inject(ChangeDetectorRef);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private customerService: CustomerService,
    private branchService: BranchService,
    private addressService: AddressService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      contactName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      taxNumber: [''],
      branchId: [''],
      addressId: ['']
    });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;
    this.isLoading = false; // Show form immediately
    this.loadBranches();
  }

  loadBranches() {
    this.branchService.getAll().subscribe({
      next: data => {
        this.cdr.detectChanges();
        this.branches = data;
        this.loadAddresses();
      },
      error: err => {
        console.error('Error loading branches:', err);
        this.branches = [];
        this.loadAddresses();
      }
    });
  }

  loadAddresses() {
    this.addressService.getAll().subscribe({
      next: data => {
        this.cdr.detectChanges();
        this.addresses = data; // keep original IDs for API calls
        if (this.id) {
          this.loadCustomer();
        }
      },
      error: err => {
        console.error('Error loading addresses:', err);
        this.addresses = [];
        if (this.id) {
          this.loadCustomer();
        }
      }
    });
  }

  loadCustomer() {
    if (!this.id) return;
    
    this.customerService.getById(this.id).subscribe({
      next: customer => {
        this.form.patchValue({
          name: customer.name,
          contactName: customer.contactName,
          email: customer.email,
          phone: customer.phone,
          taxNumber: customer.taxNumber,
          branchId: customer.branchId || ''
        });
        // Load linked addresses to get the primary address
        this.loadCustomerAddress();
      },
      error: err => {
        console.error('Error loading customer:', err);
        alert('Failed to load customer');
        this.router.navigate(['/customers']);
      }
    });
  }

  loadCustomerAddress() {
    if (!this.id) return;
    
    this.addressService.getForOwner('Customer', this.id).subscribe({
      next: addresses => {
        // Set the first (primary) address if exists
        if (addresses && addresses.length > 0) {
          const primary = addresses.find((a: any) => a.isPrimary) || addresses[0];
          this.currentAddressId = primary.id;
          this.form.patchValue({ addressId: primary.id });
        }
      },
      error: err => {
        console.error('Error loading customer addresses:', err);
      }
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const dto: CreateCustomerDto = {
      name: this.form.value.name,
      contactName: this.form.value.contactName,
      email: this.form.value.email,
      phone: this.form.value.phone,
      taxNumber: this.form.value.taxNumber || '',
      branchId: this.form.value.branchId || undefined
    };

    const request = this.isEdit && this.id
      ? this.customerService.update(this.id, dto)
      : this.customerService.create(dto);

    request.subscribe({
      next: (customer) => {
        if (!customer.id) {
          this.isSaving = false;
          this.router.navigate(['/customers']);
          return;
        }

        const selectedAddressId = (this.form.value.addressId || '').toString();
        const hasSelection = !!selectedAddressId;

        // Server-side LinkToOwnerAsync now handles cleanup of old links for customers automatically
        // Just call link if we have a selection, or unlink all if none
        let workflow$: any;
        
        if (hasSelection) {
          // Link the selected address as primary; server will clean up any existing links
          workflow$ = this.addressService.link(selectedAddressId, 'Customer', customer.id, true);
        } else {
          // No address selected: unlink all existing addresses
          workflow$ = this.addressService.getForOwner('Customer', customer.id).pipe(
            concatMap(existing => {
              if (!existing.length) return of(null);
              return forkJoin(
                existing.map(a =>
                  this.addressService.unlink(a.id, 'Customer', customer.id).pipe(catchError(() => of(null)))
                )
              ).pipe(map(() => null));
            })
          );
        }

        workflow$
          .pipe(
            catchError((err: any) => {
              console.error('Error managing customer address:', err);
              return of(null);
            })
          )
          .subscribe(() => {
            this.currentAddressId = hasSelection ? selectedAddressId : null;
            this.isSaving = false;
            this.router.navigate(['/customers']);
          });
      },
      error: err => {
        console.error('Error saving customer:', err);
        alert('Failed to save customer');
        this.isSaving = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/customers']);
  }

  formatAddressDisplay(addr: Address): string {
    const parts = [] as string[];
    if (addr.line1) parts.push(addr.line1);
    if (addr.line2) parts.push(addr.line2);
    if (addr.city?.name) parts.push(addr.city.name);
    if (addr.state?.name) parts.push(addr.state.name);
    if (addr.country?.name) parts.push(addr.country.name);
    if (addr.postalCode?.code) parts.push(addr.postalCode.code);
    return parts.length ? parts.join(', ') : 'Address';
  }
}
