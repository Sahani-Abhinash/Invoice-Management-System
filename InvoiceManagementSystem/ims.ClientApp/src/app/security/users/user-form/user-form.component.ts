import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService, CreateUserDto, UserProfile, UserStatus } from '../user.service';
import { UserRoleService } from '../user-role.service';
import { RoleService, Role } from '../../roles/role.service';
import { AddressService } from '../../../Master/geography/address/address.service';
import { AddressManagerComponent } from '../../../shared/components/address-manager/address-manager.component';
import { forkJoin, Observable, of } from 'rxjs';
import { finalize, switchMap, tap, catchError, map } from 'rxjs/operators';

interface AddressWithType {
  id: string;
  address: any;
  type: number;
  isPrimary: boolean;
}

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AddressManagerComponent],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private usersSvc = inject(UserService);
  private userRoleSvc = inject(UserRoleService);
  private roleSvc = inject(RoleService);
  private addressSvc = inject(AddressService);
  private cdr = inject(ChangeDetectorRef);

  private getBaseUrl(): string {
    const baseUrl = 'https://localhost:7276';
    return baseUrl;
  }

  private resolveProfilePictureUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    return url.startsWith('http') ? url : `${this.getBaseUrl()}${url}`;
  }

  id?: string;
  loading = false;
  error?: string;
  user?: UserProfile;
  availableRoles: Role[] = [];
  selectedRoleIds: Set<string> = new Set();
  managedAddresses: AddressWithType[] = [];
  profilePreview?: string;
  selectedProfilePictureFile: File | null = null;
  isUploading = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    password: [''],
    mobile: [''],
    gender: [''],
    profilePictureUrl: [''],
    status: [UserStatus.Active, [Validators.required]],
  });

  get isEdit(): boolean { return !!this.id; }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') ?? undefined;
    console.log('UserForm ngOnInit - id:', this.id);
    this.loading = true;

    // Load roles first
    this.roleSvc.getAll().subscribe({
      next: (roles) => {
        this.availableRoles = roles;
        
        if (this.id) {
          // Load user data and their roles
          forkJoin({
            user: this.usersSvc.getById(this.id),
            userRoles: this.userRoleSvc.getRolesForUser(this.id)
          }).pipe(
            finalize(() => {
              this.loading = false;
              this.cdr.detectChanges();
            })
          ).subscribe({
            next: ({ user, userRoles }) => {
              console.log('User data received:', user);
              console.log('User roles received:', userRoles);
              this.user = user;
              this.form.patchValue({
                email: user.email ?? '',
                firstName: user.firstName ?? user.given_name ?? '',
                lastName: user.lastName ?? user.family_name ?? '',
                mobile: user.mobile ?? '',
                gender: user.gender ?? '',
                profilePictureUrl: user.profilePictureUrl ?? '',
                status: user.status ?? UserStatus.Active,
              });
              this.profilePreview = this.resolveProfilePictureUrl(user.profilePictureUrl) ?? undefined;
              
              // Mark assigned roles
              userRoles.forEach((role: any) => {
                const roleId = role?.roleId || role?.RoleId || role?.id || role?.Id;
                if (roleId) this.selectedRoleIds.add(roleId);
              });
            },
            error: (err) => {
              this.error = 'Failed to load user';
              console.error('Error loading user:', err);
            }
          });
        } else {
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.error = 'Failed to load roles';
        this.loading = false;
        console.error('Error loading roles:', err);
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const dto: CreateUserDto = {
      email: raw.email?.trim() ?? '',
      firstName: raw.firstName?.trim() ?? '',
      lastName: raw.lastName?.trim() ?? '',
      password: raw.password ?? '',
      status: raw.status ?? UserStatus.Active,
      mobile: raw.mobile?.trim() || undefined,
      gender: raw.gender || undefined,
      profilePictureUrl: raw.profilePictureUrl?.trim() || undefined,
    };
    this.loading = true;
    
    const saveUser$ = this.isEdit && this.id
      ? this.usersSvc.update(this.id, dto)
      : this.usersSvc.create(dto);

    saveUser$
      .pipe(
        switchMap((savedUser) => {
          const userId = this.id || savedUser?.id || (savedUser as any)?.Id;
          if (!userId) {
            throw new Error('User ID missing after save');
          }

          const addressFlow$ = this.isEdit
            ? this.unlinkAllAddresses(userId).pipe(switchMap(() => this.linkAddressesToUser(userId)))
            : this.linkAddressesToUser(userId);

          return addressFlow$.pipe(
            switchMap(() => this.updateUserRoles(userId)),
            tap(() => console.log('User, addresses, and roles saved'))
          );
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => this.onSaved(),
        error: (err) => this.onError(err)
      });
  }

  updateUserRoles(userId: string): Observable<void> {
    const getCurrentRoles$ = this.isEdit
      ? this.userRoleSvc.getRolesForUser(userId)
      : of<any[]>([]);

    return getCurrentRoles$.pipe(
      switchMap((currentRoles) => {
        const currentRoleIds = new Set(
          currentRoles.map((r: any) => r?.roleId || r?.RoleId || r?.id || r?.Id)
        );

        const rolesToAdd = Array.from(this.selectedRoleIds).filter(id => !currentRoleIds.has(id));
        const rolesToRemove = Array.from(currentRoleIds).filter(id => !this.selectedRoleIds.has(id));

        const operations: Observable<any>[] = [];

        rolesToAdd.forEach(roleId => {
          operations.push(this.userRoleSvc.assignRole({ userId, roleId }));
        });

        rolesToRemove.forEach(roleId => {
          operations.push(this.userRoleSvc.removeRole({ userId, roleId }));
        });

        if (operations.length === 0) {
          return of(void 0);
        }

        return forkJoin(operations).pipe(
          map(() => void 0),
          catchError(err => {
            console.error('Error updating roles:', err);
            return of(void 0); // Do not block save on role update errors
          })
        );
      }),
      catchError(err => {
        console.error('Error getting current roles:', err);
        return of(void 0);
      })
    );
  }

  onAddressesUpdated(addresses: AddressWithType[]): void {
    console.log('User form - addresses updated:', addresses.map(a => ({ id: a.id, isPrimary: a.isPrimary })));
    this.managedAddresses = addresses;
    this.cdr.detectChanges();
  }

  private unlinkAllAddresses(userId: string) {
    console.log('Unlinking all addresses from user:', userId);

    return this.addressSvc.getForOwner('User', userId).pipe(
      switchMap(addresses => {
        if (!addresses || addresses.length === 0) {
          console.log('No addresses to unlink');
          return of(null);
        }

        const unlinkObservables = addresses.map(addr =>
          this.addressSvc.unlink(addr.id, 'User', userId).pipe(
            tap(() => console.log('✓ Address unlinked:', addr.id)),
            catchError(err => {
              console.error('✗ Error unlinking address:', addr.id, err);
              return of(null);
            })
          )
        );

        return forkJoin(unlinkObservables);
      })
    );
  }

  private linkAddressesToUser(userId: string) {
    console.log('Linking addresses to user:', userId);

    if (!this.managedAddresses || this.managedAddresses.length === 0) {
      console.log('No addresses selected for linking');
      return of(null);
    }

    const linkObservables = this.managedAddresses.map((managed, index) => {
      console.log(`--- Linking Address ${index + 1} ---`, managed.address.id, 'Primary:', managed.isPrimary);
      return this.addressSvc.link(
        managed.address.id,
        'User',
        userId,
        managed.isPrimary,
        true // allow multiple addresses for users
      ).pipe(
        tap(() => console.log(`✓ Address ${managed.address.id} linked`)),
        catchError(err => {
          console.error(`✗ Error linking address ${managed.address.id}:`, err);
          throw err;
        })
      );
    });

    return forkJoin(linkObservables).pipe(
      tap(() => console.log('All addresses linked for user')),
      catchError(err => {
        console.error('Error linking addresses to user:', err);
        throw err;
      })
    );
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedProfilePictureFile = input.files[0];
      
      // Show preview
      const reader = new FileReader();
      reader.onload = () => {
        this.profilePreview = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(this.selectedProfilePictureFile);
    }
  }

  clearProfilePicture(): void {
    this.profilePreview = undefined;
    this.selectedProfilePictureFile = null;
    this.cdr.detectChanges();
  }

  uploadProfilePicture(): void {
    if (!this.selectedProfilePictureFile || !this.id) return;

    this.isUploading = true;
    const formData = new FormData();
    formData.append('file', this.selectedProfilePictureFile);

    this.usersSvc.uploadProfilePicture(this.id, formData).subscribe({
      next: (response: any) => {
        const resolvedUrl = this.resolveProfilePictureUrl(response.profilePictureUrl);
        this.profilePreview = resolvedUrl ?? undefined;
        this.form.patchValue({ profilePictureUrl: response.profilePictureUrl });
        this.selectedProfilePictureFile = null;
        this.isUploading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Profile picture upload failed:', error);
        this.isUploading = false;
        alert('Failed to upload profile picture');
        this.cdr.detectChanges();
      }
    });
  }

  toggleRole(roleId: string): void {
    if (this.selectedRoleIds.has(roleId)) {
      this.selectedRoleIds.delete(roleId);
    } else {
      this.selectedRoleIds.add(roleId);
    }
  }

  isRoleSelected(roleId: string): boolean {
    return this.selectedRoleIds.has(roleId);
  }

  onSaved(): void {
    this.loading = false;
    this.router.navigate(['/users']);
  }

  onError(err: unknown): void {
    console.error(err);
    this.error = 'Save failed. Please verify the fields.';
    this.loading = false;
  }
}
