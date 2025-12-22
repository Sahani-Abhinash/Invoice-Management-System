import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RoleService, Role } from '../role.service';
import { RolePermissionService } from '../role-permission.service';
import { PermissionService } from '../../permissions/permission.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.css']
})
export class RoleListComponent implements OnInit {
  roles: Role[] = [];
  loading = false;
  error?: string;
  rolePermissionsMap: Map<string, string[]> = new Map();

  constructor(
    private rolesSvc: RoleService,
    private rolePermissionSvc: RolePermissionService,
    private permissionSvc: PermissionService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading = true;
    forkJoin({
      roles: this.rolesSvc.getAll(),
      permissions: this.permissionSvc.getAll()
    }).subscribe({
      next: ({ roles, permissions }) => {
        console.log('Fetched roles:', roles);
        console.log('Fetched permissions:', permissions);
        this.roles = roles ?? [];
        
        // Create permission ID to name map
        const permMap = new Map(permissions.map(p => [p.id, p.name]));
        console.log('Permission map:', permMap);
        
        // Load permissions for each role
        const rolePermReqs = this.roles.map(r => 
          this.rolePermissionSvc.getPermissionsForRole(r.id)
        );
        
        if (rolePermReqs.length > 0) {
          forkJoin(rolePermReqs).subscribe({
            next: (allRolePerms) => {
              console.log('All role permissions:', allRolePerms);
              this.roles.forEach((role, index) => {
                const rolePerms = allRolePerms[index] || [];
                console.log(`Permissions for role ${role.name}:`, rolePerms);
                const permNames = rolePerms
                  .map((rp: any) => {
                    const permId = rp?.permissionId || rp?.PermissionId || rp?.id || rp?.Id;
                    return permMap.get(permId) || '';
                  })
                  .filter(Boolean);
                console.log(`Permission names for role ${role.name}:`, permNames);
                this.rolePermissionsMap.set(role.id, permNames);
              });
              console.log('Final rolePermissionsMap:', this.rolePermissionsMap);
              this.loading = false;
              this.cdr.detectChanges();
            },
            error: (err) => {
              console.error('Error loading role permissions:', err);
              this.loading = false;
              this.cdr.detectChanges();
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
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  getRolePermissions(roleId: string): string {
    const perms = this.rolePermissionsMap.get(roleId) || [];
    return perms.length > 0 ? perms.join(', ') : '-';
  }

  edit(id: string): void {
    this.router.navigate(['/roles/edit', id]);
  }

  remove(r: Role): void {
    if (!r?.id) return;
    const ok = confirm('Delete this role? This cannot be undone.');
    if (!ok) return;
    this.loading = true;
    this.rolesSvc.delete(r.id).subscribe({
      next: () => this.fetch(),
      error: (err) => {
        this.error = 'Failed to delete role';
        this.loading = false;
        console.error(err);
      }
    });
  }

  trackById(index: number, item: Role): string {
    return item.id;
  }
}
