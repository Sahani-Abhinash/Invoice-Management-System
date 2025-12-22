import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserService, UserProfile } from '../../security/users/user.service';
import { UserRoleService } from '../../security/users/user-role.service';
import { RoleService } from '../../security/roles/role.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: '../../security/users/user-list/user-list.component.html',
  styleUrls: ['../../security/users/user-list/user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: UserProfile[] = [];
  loading = false;
  error?: string;
  userRolesMap: Map<string, string[]> = new Map();

  constructor(
    private usersSvc: UserService,
    private userRoleSvc: UserRoleService,
    private roleSvc: RoleService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading = true;
    forkJoin({
      users: this.usersSvc.getAll(),
      roles: this.roleSvc.getAll()
    }).subscribe({
      next: ({ users, roles }) => {
        console.log('Fetched users:', users);
        this.users = users ?? [];
        
        // Create role ID to name map
        const roleMap = new Map(roles.map(r => [r.id, r.name]));
        
        // Load roles for each user
        const userRoleRequests = this.users.map(u => 
          this.userRoleSvc.getRolesForUser(u.id)
        );
        
        if (userRoleRequests.length > 0) {
          forkJoin(userRoleRequests).subscribe({
            next: (allUserRoles) => {
              this.users.forEach((user, index) => {
                const userRoles = allUserRoles[index] || [];
                const roleNames = userRoles
                  .map((ur: any) => {
                    const roleId = ur?.roleId || ur?.RoleId || ur?.id || ur?.Id;
                    return roleMap.get(roleId) || '';
                  })
                  .filter(Boolean);
                this.userRolesMap.set(user.id, roleNames);
              });
              this.loading = false;
              this.cdr.detectChanges();
            },
            error: (err) => {
              console.error('Error loading user roles:', err);
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
        this.error = 'Failed to load users';
        this.loading = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  getUserRoles(userId: string): string {
    const roles = this.userRolesMap.get(userId) || [];
    return roles.length > 0 ? roles.join(', ') : '-';
  }

  displayName(u: UserProfile): string {
    return (
      u.fullName ||
      u.fullname ||
      [u.firstName ?? u.given_name, u.lastName ?? u.family_name].filter(Boolean).join(' ') ||
      u.name ||
      ''
    );
  }

  edit(id: string): void {
    this.router.navigate(['/users/edit', id]);
  }

  remove(u: UserProfile): void {
    if (!u?.id) return;
    const ok = confirm('Delete this user? This cannot be undone.');
    if (!ok) return;
    this.loading = true;
    this.usersSvc.delete(u.id).subscribe({
      next: () => this.fetch(),
      error: (err) => {
        this.error = 'Failed to delete user';
        this.loading = false;
        console.error(err);
      }
    });
  }

  trackById(index: number, item: UserProfile): string {
    return item.id;
  }
}
