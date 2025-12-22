import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoleService, Role, CreateRoleDto } from '../role.service';
import { RolePermissionService } from '../role-permission.service';
import { PermissionService, Permission } from '../../permissions/permission.service';
import { forkJoin, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './role-form.component.html',
  styleUrls: ['./role-form.component.css']
})
export class RoleFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private rolesSvc = inject(RoleService);
  private rolePermissionSvc = inject(RolePermissionService);
  private permissionSvc = inject(PermissionService);
  private cdr = inject(ChangeDetectorRef);

  id?: string;
  loading = false;
  error?: string;
  role?: Role;
  availablePermissions: Permission[] = [];
  selectedPermissionIds: Set<string> = new Set();
  groupedPermissions: Map<string, Permission[]> = new Map();

  form = this.fb.group({
    name: ['', [Validators.required]],
    description: ['']
  });

  get isEdit(): boolean { return !!this.id; }
  
  get moduleNames(): string[] {
    return Array.from(this.groupedPermissions.keys()).sort();
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') ?? undefined;
    console.log('RoleForm ngOnInit - id:', this.id);
    this.loading = true;

    // Load permissions first
    this.permissionSvc.getAll().subscribe({
      next: (permissions) => {
        console.log('Permissions loaded:', permissions);
        console.log('Permissions count:', permissions?.length);
        this.availablePermissions = permissions;
        this.groupPermissionsByModule(permissions);
        console.log('availablePermissions set to:', this.availablePermissions);
        console.log('groupedPermissions:', this.groupedPermissions);
        
        if (this.id) {
          // Load role data and their permissions
          forkJoin({
            role: this.rolesSvc.getById(this.id),
            rolePermissions: this.rolePermissionSvc.getPermissionsForRole(this.id)
          }).pipe(
            finalize(() => {
              this.loading = false;
              this.cdr.detectChanges();
            })
          ).subscribe({
            next: ({ role, rolePermissions }) => {
              console.log('Role data received:', role);
              console.log('Role permissions received:', rolePermissions);
              this.role = role;
              this.form.patchValue({
                name: role.name ?? '',
                description: role.description ?? ''
              });
              
              // Mark assigned permissions
              rolePermissions.forEach((perm: any) => {
                const permId = perm?.permissionId || perm?.PermissionId || perm?.id || perm?.Id;
                if (permId) this.selectedPermissionIds.add(permId);
              });
            },
            error: (err) => {
              this.error = 'Failed to load role';
              console.error('Error loading role:', err);
            }
          });
        } else {
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.error = 'Failed to load permissions';
        this.loading = false;
        console.error('Error loading permissions:', err);
      }
    });
  }

  submit(): void {
    const raw = this.form.getRawValue();
    const dto: CreateRoleDto = {
      name: raw.name ?? '',
      description: raw.description ?? undefined,
    };
    this.loading = true;
    
    const saveRole$ = this.isEdit && this.id
      ? this.rolesSvc.update(this.id, dto)
      : this.rolesSvc.create(dto);

    saveRole$.subscribe({
      next: (savedRole) => {
        const roleId = this.id || savedRole?.id || (savedRole as any)?.Id;
        if (roleId) {
          this.updateRolePermissions(roleId);
        } else {
          this.onSaved();
        }
      },
      error: (err) => this.onError(err)
    });
  }

  updateRolePermissions(roleId: string): void {
    // Get current permissions if editing
    const getCurrentPermissions$ = this.isEdit
      ? this.rolePermissionSvc.getPermissionsForRole(roleId)
      : new Observable<any[]>(observer => { observer.next([]); observer.complete(); });

    getCurrentPermissions$.subscribe({
      next: (currentPerms) => {
        const currentPermIds = new Set(
          currentPerms.map((p: any) => p?.permissionId || p?.PermissionId || p?.id || p?.Id)
        );

        // Find permissions to add and remove
        const permsToAdd = Array.from(this.selectedPermissionIds).filter(id => !currentPermIds.has(id));
        const permsToRemove = Array.from(currentPermIds).filter(id => !this.selectedPermissionIds.has(id));

        const operations: Observable<any>[] = [];

        permsToAdd.forEach(permId => {
          operations.push(this.rolePermissionSvc.assignPermission({ roleId, permissionId: permId }));
        });

        permsToRemove.forEach(permId => {
          operations.push(this.rolePermissionSvc.removePermission({ roleId, permissionId: permId }));
        });

        if (operations.length > 0) {
          forkJoin(operations).subscribe({
            next: () => this.onSaved(),
            error: (err) => {
              console.error('Error updating permissions:', err);
              this.onSaved(); // Still navigate even if permission update fails
            }
          });
        } else {
          this.onSaved();
        }
      },
      error: (err) => {
        console.error('Error getting current permissions:', err);
        this.onSaved(); // Still navigate
      }
    });
  }

  togglePermission(permissionId: string): void {
    if (this.selectedPermissionIds.has(permissionId)) {
      this.selectedPermissionIds.delete(permissionId);
    } else {
      this.selectedPermissionIds.add(permissionId);
    }
  }

  isPermissionSelected(permissionId: string): boolean {
    return this.selectedPermissionIds.has(permissionId);
  }

  groupPermissionsByModule(permissions: Permission[]): void {
    this.groupedPermissions.clear();
    
    permissions.forEach(perm => {
      console.log('Processing permission:', perm);
      // Extract module from name (e.g., "Branches.Manage" -> "Branches")
      const module = perm.name?.split('.')[0] || 'Other';
      console.log('Extracted module:', module, 'from permission:', perm.name);
      
      if (!this.groupedPermissions.has(module)) {
        this.groupedPermissions.set(module, []);
      }
      this.groupedPermissions.get(module)!.push(perm);
    });
    
    console.log('Grouped permissions:', this.groupedPermissions);
    
    // Sort permissions within each module
    this.groupedPermissions.forEach(perms => {
      perms.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    });
  }

  onSaved(): void {
    this.loading = false;
    this.router.navigate(['/roles']);
  }

  onError(err: unknown): void {
    console.error(err);
    this.error = 'Save failed. Please verify the fields.';
    this.loading = false;
  }
}
