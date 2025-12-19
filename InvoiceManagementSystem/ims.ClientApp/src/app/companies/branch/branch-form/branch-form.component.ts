import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BranchService } from '../branch.service';
import { Company, CompanyService } from '../../company/company.service';

@Component({
  selector: 'app-branch-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './branch-form.component.html',
  styleUrls: ['./branch-form.component.css']
})
export class BranchFormComponent implements OnInit {
  form!: FormGroup;
  id: string | null = null;
  companies: Company[] = [];
  private pendingCompanyId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private branchService: BranchService,
    private companyService: CompanyService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      companyId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.loadCompanies();

    if (this.id) {
      this.branchService.getById(this.id).subscribe(data => {
        this.pendingCompanyId = this.extractCompanyId(data);
        this.form.patchValue({
          name: data.name,
          companyId: this.pendingCompanyId ?? ''
        });
        // If companies already loaded, ensure the value is applied after normalization.
        this.applyPendingCompanyId();
      });
    }
  }

  loadCompanies() {
    this.companyService.getAll().subscribe(data => {
      this.companies = data.map(c => ({ ...c, id: String((c as any).id) } as Company));
      this.applyPendingCompanyId();
    }, error => {
      console.error('Error loading companies:', error);
    });
  }

  private extractCompanyId(data: any): string | null {
    const idCandidate = data?.companyId ?? data?.companyID ?? data?.CompanyId ?? data?.company?.id;
    if (idCandidate === undefined || idCandidate === null || idCandidate === '') return null;
    return String(idCandidate);
  }

  private applyPendingCompanyId() {
    if (this.pendingCompanyId && this.companies.length) {
      this.form.patchValue({ companyId: this.pendingCompanyId });
      this.pendingCompanyId = null;
    }
  }

  save() {
    if (this.form.invalid) return;

    if (this.id) {
      this.branchService.update(this.id, this.form.value).subscribe(() => this.router.navigate(['/branches']));
    } else {
      this.branchService.create(this.form.value).subscribe(() => this.router.navigate(['/branches']));
    }
  }
}
