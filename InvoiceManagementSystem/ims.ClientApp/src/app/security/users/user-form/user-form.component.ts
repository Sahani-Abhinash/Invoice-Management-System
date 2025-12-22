import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService, CreateUserDto, UserProfile, UserStatus } from '../user.service';
import { UserRoleService } from '../user-role.service';
import { RoleService, Role } from '../../roles/role.service';
import { forkJoin, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
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
  private cdr = inject(ChangeDetectorRef);

  id?: string;
  loading = false;
  error?: string;
  user?: UserProfile;
  availableRoles: Role[] = [];
  selectedRoleIds: Set<string> = new Set();

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    password: [''],
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
                status: (user as any).status ?? UserStatus.Active,
              });
              
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
    const raw = this.form.getRawValue();
    const dto: CreateUserDto = {
      email: raw.email ?? '',
      firstName: raw.firstName ?? '',
      lastName: raw.lastName ?? '',
      password: raw.password ?? '',
      status: raw.status ?? UserStatus.Active,
    };
    this.loading = true;
    
    const saveUser$ = this.isEdit && this.id
      ? this.usersSvc.update(this.id, dto)
      : this.usersSvc.create(dto);

    saveUser$.subscribe({
      next: (savedUser) => {
        const userId = this.id || savedUser?.id || (savedUser as any)?.Id;
        if (userId) {
          this.updateUserRoles(userId);
        } else {
          this.onSaved();
        }
      },
      error: (err) => this.onError(err)
    });
  }

  updateUserRoles(userId: string): void {
    // Get current roles if editing
    const getCurrentRoles$ = this.isEdit
      ? this.userRoleSvc.getRolesForUser(userId)
      : new Observable<any[]>(observer => { observer.next([]); observer.complete(); });

    getCurrentRoles$.subscribe({
      next: (currentRoles) => {
        const currentRoleIds = new Set(
          currentRoles.map((r: any) => r?.roleId || r?.RoleId || r?.id || r?.Id)
        );

        // Find roles to add and remove
        const rolesToAdd = Array.from(this.selectedRoleIds).filter(id => !currentRoleIds.has(id));
        const rolesToRemove = Array.from(currentRoleIds).filter(id => !this.selectedRoleIds.has(id));

        const operations: Observable<any>[] = [];

        rolesToAdd.forEach(roleId => {
          operations.push(this.userRoleSvc.assignRole({ userId, roleId }));
        });

        rolesToRemove.forEach(roleId => {
          operations.push(this.userRoleSvc.removeRole({ userId, roleId }));
        });

        if (operations.length > 0) {
          forkJoin(operations).subscribe({
            next: () => this.onSaved(),
            error: (err) => {
              console.error('Error updating roles:', err);
              this.onSaved(); // Still navigate even if role update fails
            }
          });
        } else {
          this.onSaved();
        }
      },
      error: (err) => {
        console.error('Error getting current roles:', err);
        this.onSaved(); // Still navigate
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
