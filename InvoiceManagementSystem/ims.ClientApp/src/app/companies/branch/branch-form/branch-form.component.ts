import { Component, OnInit, inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BranchService } from '../branch.service';
import { AddressManagerComponent } from '../../../shared/components/address-manager/address-manager.component';
import { AddressService } from '../../../Master/geography/address/address.service';
import { forkJoin, of } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';

interface AddressWithType {
  id: string;
  address: any;
  type: number;
  isPrimary: boolean;
}

@Component({
  selector: 'app-branch-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AddressManagerComponent],
  templateUrl: './branch-form.component.html',
  styleUrls: ['./branch-form.component.css']
})
export class BranchFormComponent implements OnInit {
  @ViewChild(AddressManagerComponent) addressManager!: AddressManagerComponent;
  
  form!: FormGroup;
  id: string | null = null;
  managedAddresses: AddressWithType[] = [];
  private cdr = inject(ChangeDetectorRef);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private branchService: BranchService,
    private addressService: AddressService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');

    if (this.id) {
      this.branchService.getById(this.id).subscribe(data => {
        this.form.patchValue({
          name: data.name
        });
        // TODO: Load associated addresses from API
      });
    }
  }

  onAddressesUpdated(addresses: AddressWithType[]) {
    console.log('Branch form - addresses updated:', addresses.map(a => ({ id: a.id, isPrimary: a.isPrimary })));
    this.managedAddresses = addresses;
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

    console.log('Saving branch with addresses:', this.managedAddresses);

    if (this.id) {
      // Update existing branch
      this.branchService.update(this.id, this.form.value).pipe(
        switchMap(branch => {
          console.log('Branch updated, now unlinking old addresses and relinking with updated flags...');
          return this.unlinkAllAddresses(this.id!).pipe(
            switchMap(() => this.linkAddressesToBranch(this.id!))
          );
        })
      ).subscribe({
        next: () => {
          console.log('Branch and addresses updated successfully');
          this.router.navigate(['/branches']);
        },
        error: err => {
          console.error('Error updating branch:', err);
          alert('Failed to update branch and addresses');
        }
      });
    } else {
      // Create new branch
      this.branchService.create(this.form.value).pipe(
        switchMap(branch => {
          console.log('Branch created:', branch);
          console.log('Now linking addresses to branch:', branch.id);
          return this.linkAddressesToBranch(branch.id);
        })
      ).subscribe({
        next: () => {
          console.log('Branch created and addresses linked successfully');
          this.router.navigate(['/branches']);
        },
        error: err => {
          console.error('Error creating branch:', err);
          alert('Failed to create branch or link addresses');
        }
      });
    }
  }

  private unlinkAllAddresses(branchId: string) {
    console.log('Unlinking all addresses from branch:', branchId);
    
    return this.addressService.getForOwner('Branch', branchId).pipe(
      switchMap(addresses => {
        console.log('Found addresses to unlink:', addresses.length);
        
        if (addresses.length === 0) {
          return of(null);
        }

        const unlinkObservables = addresses.map(addr => {
          console.log('Unlinking address:', addr.id);
          return this.addressService.unlink(addr.id, 'Branch', branchId).pipe(
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

  private linkAddressesToBranch(branchId: string) {
    console.log('=== START LINKING ADDRESSES ===');
    console.log('Branch ID:', branchId);
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
      console.log('Branch ID:', branchId);
      
      return this.addressService.link(
        managed.address.id,
        'Branch',
        branchId,
        managed.isPrimary,
        true // allowMultiple = true for branches
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
}
