import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { WarehouseService, CreateWarehouse } from '../warehouse.service';
import { Branch, BranchService } from '../../companies/branch/branch.service';

@Component({
  selector: 'app-warehouse-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './warehouse-form.component.html',
  styleUrls: []
})
export class WarehouseFormComponent implements OnInit {
  form!: FormGroup;
  id: string | null = null;
  branches: Branch[] = [];
  private pendingBranchId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private warehouseService: WarehouseService,
    private branchService: BranchService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      branchId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.loadBranches();

    if (this.id) {
      this.warehouseService.getById(this.id).subscribe(data => {
        this.pendingBranchId = this.extractBranchId(data);
        this.form.patchValue({
          name: (data as any)?.name ?? '',
          branchId: this.pendingBranchId ?? ''
        });
        this.applyPendingBranchId();
      });
    }
  }

  loadBranches() {
    this.branchService.getAll().subscribe(data => {
      this.branches = data.map(b => ({ ...b, id: String((b as any).id) } as Branch));
      this.applyPendingBranchId();
    }, error => {
      console.error('Error loading branches:', error);
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

  save() {
    if (this.form.invalid) return;

    const dto: CreateWarehouse = {
      name: this.form.value.name,
      branchId: String(this.form.value.branchId)
    };

    if (this.id) {
      this.warehouseService.update(this.id, dto).subscribe(() => this.router.navigate(['/warehouses']));
    } else {
      this.warehouseService.create(dto).subscribe(() => this.router.navigate(['/warehouses']));
    }
  }
}
