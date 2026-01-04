import { Component, OnInit, inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CustomerService, CreateCustomerDto } from '../customer.service';
import { BranchService, Branch } from '../../branch/branch.service';
import { AddressService } from '../../../Master/geography/address/address.service';
import { AddressManagerComponent } from '../../../shared/components/address-manager/address-manager.component';
import { forkJoin, of } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';

interface AddressWithType {
  id: string;
  address: any;
  type: number;
  isPrimary: boolean;
}

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FormsModule, AddressManagerComponent],
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.css']
})
export class CustomerFormComponent implements OnInit {
  @ViewChild(AddressManagerComponent) addressManager!: AddressManagerComponent;
  
  form!: FormGroup;
  id: string | null = null;
  branches: Branch[] = [];
  managedAddresses: AddressWithType[] = [];
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
      branchId: ['']
    });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;
    this.isLoading = false;
    this.loadBranches();
  }

  loadBranches() {
    this.branchService.getAll().subscribe({
      next: data => {
        this.cdr.detectChanges();
        this.branches = data;
        this.cdr.detectChanges();
        if (this.id) {
          this.loadCustomer();
        }
      },
      error: err => {
        console.error('Error loading branches:', err);
        this.branches = [];
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
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error loading customer:', err);
        alert('Failed to load customer');
        this.router.navigate(['/customers']);
      }
    });
  }

  onAddressesUpdated(addresses: AddressWithType[]) {
    console.log('Customer form - addresses updated:', addresses.map(a => ({ id: a.id, isPrimary: a.isPrimary })));
    this.managedAddresses = addresses;
    this.cdr.detectChanges();
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    if (this.managedAddresses.length === 0) {
      alert('Please add at least one address');
      return;
    }

    this.isSaving = true;
    console.log('Saving customer with addresses:', this.managedAddresses);

    const dto: CreateCustomerDto = {
      name: this.form.value.name,
      contactName: this.form.value.contactName,
      email: this.form.value.email,
      phone: this.form.value.phone,
      taxNumber: this.form.value.taxNumber || '',
      branchId: this.form.value.branchId || undefined
    };

    const request = this.isEdit && this.id
      ? this.customerService.update(this.id!, dto)
      : this.customerService.create(dto);

    request.pipe(
      switchMap((customer: any) => {
        console.log('Customer saved:', customer.id);
        
        if (this.id) {
          // Update existing customer - unlink old addresses and relink
          return this.unlinkAllAddresses(this.id).pipe(
            switchMap(() => this.linkAddressesToCustomer(this.id!))
          );
        } else {
          // Create new customer - just link addresses
          return this.linkAddressesToCustomer(customer.id);
        }
      })
    ).subscribe({
      next: () => {
        console.log('Customer and addresses saved successfully');
        this.isSaving = false;
        this.cdr.detectChanges();
        this.router.navigate(['/customers']);
      },
      error: (err: any) => {
        console.error('Error saving customer:', err);
        alert('Failed to save customer and addresses');
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  private unlinkAllAddresses(customerId: string) {
    console.log('Unlinking all addresses from customer:', customerId);
    
    return this.addressService.getForOwner('Customer', customerId).pipe(
      switchMap(addresses => {
        console.log('Found addresses to unlink:', addresses.length);
        
        if (addresses.length === 0) {
          return of(null);
        }

        const unlinkObservables = addresses.map(addr => {
          console.log('Unlinking address:', addr.id);
          return this.addressService.unlink(addr.id, 'Customer', customerId).pipe(
            tap(() => console.log('✓ Address unlinked:', addr.id)),
            catchError(err => {
              console.error('✗ Error unlinking address:', addr.id, err);
              return of(null); // Continue even if one fails
            })
          );
        });

        return forkJoin(unlinkObservables);
      }),
      tap(() => console.log('All addresses unlinked'))
    );
  }

  private linkAddressesToCustomer(customerId: string) {
    console.log('=== START LINKING ADDRESSES ===');
    console.log('Customer ID:', customerId);
    console.log('Managed Addresses Count:', this.managedAddresses.length);
    console.log('Managed Addresses:', JSON.stringify(this.managedAddresses, null, 2));
    
    if (this.managedAddresses.length === 0) {
      console.log('No addresses to link, returning...');
      return of(null);
    }

    const linkObservables = this.managedAddresses.map((managed, index) => {
      console.log(`\n--- Linking Address ${index + 1} ---`);
      console.log('Address ID:', managed.address.id);
      console.log('Address Details:', managed.address);
      console.log('Is Primary:', managed.isPrimary);
      console.log('Customer ID:', customerId);
      
      return this.addressService.link(
        managed.address.id,
        'Customer',
        customerId,
        managed.isPrimary,
        true // allowMultiple = true for customers
      ).pipe(
        tap(() => console.log(`✓ Address ${managed.address.id} linked successfully`)),
        catchError(err => {
          console.error(`✗ Error linking address ${managed.address.id}:`, err);
          console.error('Error details:', err.error);
          throw err;
        })
      );
    });

    return forkJoin(linkObservables).pipe(
      tap(() => console.log('=== ALL ADDRESSES LINKED SUCCESSFULLY ===')),
      catchError(err => {
        console.error('=== ERROR IN LINK PROCESS ===', err);
        throw err;
      })
    );
  }
  cancel() {
    this.router.navigate(['/customers']);
  }}