import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BranchService, Branch } from '../branch.service';
import { CompanyService, Company } from '../../company/company.service';

@Component({
  selector: 'app-branch-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './branch-list.component.html',
  styleUrls: ['./branch-list.component.scss']
})
export class BranchListComponent implements OnInit {
  branches: Branch[] = [];
  companies: Company[] = [];
  private companyMap = new Map<string, string>();

  constructor(
    private branchService: BranchService,
    private companyService: CompanyService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    forkJoin({
      branches: this.branchService.getAll(),
      companies: this.companyService.getAll()
    }).subscribe(({ branches, companies }) => {
      this.branches = branches;
      this.companies = companies;
      this.companyMap = new Map(companies.map(c => [String(c.id), c.name]));
      console.log(this.branches);
      this.cdr.detectChanges();
    }, error => {
      console.error('Error loading branches or companies:', error);
    });
  }

  deleteBranch(id: string) {
    if (confirm('Are you sure to delete this branch?')) {
      this.branchService.delete(id).subscribe(() => this.loadData());
    }
  }

  editBranch(id: string) {
    this.router.navigate(['/branches/edit', id]);
  }

  createBranch() {
    this.router.navigate(['/branches/create']);
  }

  companyName(branch: Branch): string {
    if (!branch) return '—';

    const nameFromBranch = (branch as any).company?.name;

    return nameFromBranch ?? '—';
  }
}
