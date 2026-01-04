import { Component, OnInit, inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { WarehouseService, CreateWarehouse } from '../warehouse.service';
import { Branch, BranchService } from '../../companies/branch/branch.service';
import { AddressService } from '../../Master/geography/address/address.service';
import { AddressManagerComponent } from '../../shared/components/address-manager/address-manager.component';
import { forkJoin, of } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';

interface AddressWithType {
  id: string;
  address: any;
  type: number;
  isPrimary: boolean;
}

@Component({
  selector: 'app-warehouse-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FormsModule, AddressManagerComponent],
  templateUrl: './warehouse-form.component.html',
  styleUrls: []
})
export class WarehouseFormComponent implements OnInit {
  @ViewChild(AddressManagerComponent) addressManager!: AddressManagerComponent;
  
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private warehouseService = inject(WarehouseService);
  private branchService = inject(BranchService);
  private addressService = inject(AddressService);
  private cdr = inject(ChangeDetectorRef);

  form!: FormGroup;
  id: string | null = null;
  branches: Branch[] = [];
  managedAddresses: AddressWithType[] = [];
  isLoading = true;
  isSaving = false;
  isEdit = false;
  private pendingBranchId: string | null = null;

  constructor() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      branchId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;
    this.loadBranches();

    if (this.id) {
      this.loadWarehouse();
    } else {
      this.isLoading = false;
    }
  }

  loadBranches() {
    this.branchService.getAll().subscribe({
      next: data => {
        this.branches = data.map(b => ({ ...b, id: String((b as any).id) } as Branch));
        this.cdr.detectChanges();
        this.applyPendingBranchId();
      },
      error: err => {
        console.error('Error loading branches:', err);
        this.branches = [];
      }
    });
  }

  loadWarehouse() {
    if (!this.id) return;
    
    this.warehouseService.getById(this.id).subscribe({
      next: data => {
        this.pendingBranchId = this.extractBranchId(data);
        this.form.patchValue({
          name: (data as any)?.name ?? '',
          branchId: this.pendingBranchId ?? ''
        });
        this.applyPendingBranchId();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error loading warehouse:', err);
        alert('Failed to load warehouse');
        this.router.navigate(['/warehouses']);
      }
    });
  }

  private extractBranchId(data: any): string | null {
    const idCandidate = data?.branchId ?? data?.branchID ?? data?.BranchId ?? data?.branch?.id;
    if (!idCandidate) return null;
    return String(idCandidate);
  }

  private applyPendingBranchId() {
    if (this.pendingBranchId && this.branches.length) {
      this.form.patchValue({ branchId: this.pendingBranchId });
      this.pendingBranchId = null;
    }
  }

  onAddressesUpdated(addresses: AddressWithType[]) {
    console.log('Warehouse form - addresses updated:', addresses.map(a => ({ id: a.id, isPrimary: a.isPrimary })));
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
    console.log('Saving warehouse with addresses:', this.managedAddresses);

    const dto: CreateWarehouse = {
      name: this.form.value.name,
      branchId: String(this.form.value.branchId)
    };

    const request = this.isEdit && this.id
      ? this.warehouseService.update(this.id!, dto)
      : this.warehouseService.create(dto);

    request.pipe(
      switchMap((warehouse: any) => {
        console.log('Warehouse saved - full response:', warehouse);
        console.log('Warehouse ID:', warehouse.id);
        console.log('Warehouse ID type:', typeof warehouse.id);
        
        const warehouseId = this.id || warehouse.id;
        console.log('Using warehouse ID:', warehouseId);
        
        if (this.id) {
          // Update existing warehouse - unlink old addresses and relink
          return this.unlinkAllAddresses(this.id).pipe(
            switchMap(() => this.linkAddressesToWarehouse(this.id!))
          );
        } else {
          // Create new warehouse - just link addresses
          return this.linkAddressesToWarehouse(warehouseId);
        }
      })
    ).subscribe({
      next: () => {
        console.log('Warehouse and addresses saved successfully');
        this.isSaving = false;
        this.cdr.detectChanges();
        this.router.navigate(['/warehouses']);
      },
      error: (err: any) => {
        console.error('Error saving warehouse - Full error object:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        console.error('Error response:', err.error);
        alert('Failed to save warehouse and addresses. Check console for details.');
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  private unlinkAllAddresses(warehouseId: string) {
    console.log('Unlinking all addresses from warehouse:', warehouseId);
    
    return this.addressService.getForOwner('Warehouse', warehouseId).pipe(
      switchMap(addresses => {
        console.log('Found addresses to unlink:', addresses.length);
        
        if (addresses.length === 0) {
          return of(null);
        }

        const unlinkObservables = addresses.map(addr => {
          console.log('Unlinking address:', addr.id);
          return this.addressService.unlink(addr.id, 'Warehouse', warehouseId).pipe(
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

  private linkAddressesToWarehouse(warehouseId: string) {
    console.log('=== START LINKING ADDRESSES ===');
    console.log('Warehouse ID:', warehouseId);
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
        'Warehouse',
        warehouseId,
        managed.isPrimary,
        true // allowMultiple = true for warehouses
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
    this.router.navigate(['/warehouses']);
  }
}
