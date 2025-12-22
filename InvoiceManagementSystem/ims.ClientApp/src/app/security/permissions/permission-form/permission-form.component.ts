import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PermissionService, CreatePermissionDto, Permission } from '../permission.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-permission-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './permission-form.component.html',
  styleUrls: ['./permission-form.component.css']
})
export class PermissionFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private permissionSvc = inject(PermissionService);
  private cdr = inject(ChangeDetectorRef);

  id?: string;
  loading = false;
  error?: string;
  permission?: Permission;

  form = this.fb.group({
    name: ['', [Validators.required]],
    description: [''],
  });

  get isEdit(): boolean { return !!this.id; }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') ?? undefined;
    console.log('PermissionForm ngOnInit - id:', this.id);
    if (this.id) {
      this.loading = true;
      console.log('Calling getById for permission:', this.id);
      this.permissionSvc.getById(this.id).pipe(
        finalize(() => {
          console.log('getById finalized, setting loading = false');
          this.loading = false;
          this.cdr.detectChanges();
        })
      ).subscribe({
        next: (p) => {
          console.log('Permission data received:', p);
          this.permission = p;
          this.form.patchValue({
            name: p.name ?? '',
            description: p.description ?? '',
          });
          console.log('Form patched with values');
        },
        error: (err) => {
          this.error = 'Failed to load permission';
          console.error('Error loading permission:', err);
        }
      });
    }
  }

  submit(): void {
    const raw = this.form.getRawValue();
    const dto: CreatePermissionDto = {
      name: raw.name ?? '',
      description: raw.description ?? undefined,
    };
    this.loading = true;
    if (this.isEdit && this.id) {
      this.permissionSvc.update(this.id, dto).subscribe({
        next: () => this.onSaved(),
        error: (err) => this.onError(err)
      });
    } else {
      this.permissionSvc.create(dto).subscribe({
        next: () => this.onSaved(),
        error: (err) => this.onError(err)
      });
    }
  }

  onSaved(): void {
    this.loading = false;
    this.router.navigate(['/permissions']);
  }

  onError(err: unknown): void {
    console.error(err);
    this.error = 'Save failed. Please verify the fields.';
    this.loading = false;
  }
}
