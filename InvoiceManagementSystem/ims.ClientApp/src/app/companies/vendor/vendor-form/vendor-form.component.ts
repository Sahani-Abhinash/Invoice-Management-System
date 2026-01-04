import { Component, OnInit, inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VendorService, Vendor } from '../vendor.service';
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
  selector: 'app-vendor-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FormsModule, AddressManagerComponent],
  templateUrl: './vendor-form.component.html',
  styleUrls: ['./vendor-form.component.css']
})
export class VendorFormComponent implements OnInit {
  @ViewChild(AddressManagerComponent) addressManager!: AddressManagerComponent;
  
  form!: FormGroup;
  id: string | null = null;
  managedAddresses: AddressWithType[] = [];
  isLoading = true;
  isSaving = false;
  isEdit = false;
  private cdr = inject(ChangeDetectorRef);

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
      taxNumber: ['']
    });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;
    this.isLoading = false;
    
    if (this.id) {
      this.loadVendor();
    }
  }

  loadVendor() {
    if (!this.id) return;
    
    this.vendorService.getById(this.id).subscribe({
      next: vendor => {
        this.form.patchValue({
          name: vendor.name,
          contactName: vendor.contactName,
          email: vendor.email,
          phone: vendor.phone,
          taxNumber: vendor.taxNumber
        });
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error loading vendor:', err);
        alert('Failed to load vendor');
        this.router.navigate(['/vendors']);
      }
    });
  }

  onAddressesUpdated(addresses: AddressWithType[]) {
    console.log('Vendor form - addresses updated:', addresses.map(a => ({ id: a.id, isPrimary: a.isPrimary })));
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
    console.log('Saving vendor with addresses:', this.managedAddresses);

    const request = this.isEdit && this.id
      ? this.vendorService.update(this.id!, this.form.value)
      : this.vendorService.create(this.form.value);

    request.pipe(
      switchMap((vendor: any) => {
        console.log('Vendor saved:', vendor.id);
        
        if (this.id) {
          // Update existing vendor - unlink old addresses and relink
          return this.unlinkAllAddresses(this.id).pipe(
            switchMap(() => this.linkAddressesToVendor(this.id!))
          );
        } else {
          // Create new vendor - just link addresses
          return this.linkAddressesToVendor(vendor.id);
        }
      })
    ).subscribe({
      next: () => {
        console.log('Vendor and addresses saved successfully');
        this.isSaving = false;
        this.cdr.detectChanges();
        this.router.navigate(['/vendors']);
      },
      error: (err: any) => {
        console.error('Error saving vendor:', err);
        alert('Failed to save vendor and addresses');
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  private unlinkAllAddresses(vendorId: string) {
    console.log('Unlinking all addresses from vendor:', vendorId);
    
    return this.addressService.getForOwner('Vendor', vendorId).pipe(
      switchMap(addresses => {
        console.log('Found addresses to unlink:', addresses.length);
        
        if (addresses.length === 0) {
          return of(null);
        }

        const unlinkObservables = addresses.map(addr => {
          console.log('Unlinking address:', addr.id);
          return this.addressService.unlink(addr.id, 'Vendor', vendorId).pipe(
            tap(() => console.log('✓ Address unlinked:', addr.id)),
            catchError(err => {
              console.error('✗ Error unlinking address:', addr.id, err);
              return of(null);
            })
          );
        });

        return forkJoin(unlinkObservables);
      }),
      tap(() => console.log('All addresses unlinked'))
    );
  }

  private linkAddressesToVendor(vendorId: string) {
    console.log('=== START LINKING ADDRESSES ===');
    console.log('Vendor ID:', vendorId);
    console.log('Managed Addresses Count:', this.managedAddresses.length);
    
    if (this.managedAddresses.length === 0) {
      console.log('No addresses to link, returning...');
      return of(null);
    }

    const linkObservables = this.managedAddresses.map((managed, index) => {
      console.log(`\n--- Linking Address ${index + 1} ---`);
      console.log('Address ID:', managed.address.id);
      console.log('Is Primary:', managed.isPrimary);
      
      return this.addressService.link(
        managed.address.id,
        'Vendor',
        vendorId,
        managed.isPrimary,
        true // allowMultiple = true for vendors
      ).pipe(
        tap(() => console.log(`✓ Address ${managed.address.id} linked successfully`)),
        catchError(err => {
          console.error(`✗ Error linking address ${managed.address.id}:`, err);
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
    this.router.navigate(['/vendors']);
  }
}
