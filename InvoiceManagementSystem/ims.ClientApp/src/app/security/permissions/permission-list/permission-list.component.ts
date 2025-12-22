import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PermissionService, Permission } from '../permission.service';

@Component({
  selector: 'app-permission-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './permission-list.component.html',
  styleUrls: ['./permission-list.component.css']
})
export class PermissionListComponent implements OnInit {
  permissions: Permission[] = [];
  loading = false;
  error?: string;

  constructor(
    private permissionSvc: PermissionService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading = true;
    this.permissionSvc.getAll().subscribe({
      next: (res) => {
        console.log('Fetched permissions:', res);
        this.permissions = res ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load permissions';
        this.loading = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  edit(id: string): void {
    this.router.navigate(['/permissions/edit', id]);
  }

  remove(p: Permission): void {
    if (!p?.id) return;
    const ok = confirm(`Delete permission "${p.name}"? This cannot be undone.`);
    if (!ok) return;
    this.loading = true;
    this.permissionSvc.delete(p.id).subscribe({
      next: () => this.fetch(),
      error: (err) => {
        this.error = 'Failed to delete permission';
        this.loading = false;
        console.error(err);
      }
    });
  }

  trackById(index: number, item: Permission): string {
    return item.id;
  }
}
