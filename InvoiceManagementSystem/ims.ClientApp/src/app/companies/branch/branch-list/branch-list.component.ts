import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BranchService, Branch } from '../branch.service';

@Component({
  selector: 'app-branch-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './branch-list.component.html',
  styleUrls: ['./branch-list.component.scss']
})
export class BranchListComponent implements OnInit {
  branches: Branch[] = [];
  

  constructor(
    private branchService: BranchService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadData();
    // Ensure data refresh when navigating back from create/edit
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.loadData();
    });
  }

  loadData() {
    this.branchService.getAll().subscribe(branches => {
      // Assign new array reference to help view updates
      this.branches = [...branches];
      this.cdr.detectChanges();
    }, error => {
      console.error('Error loading branches:', error);
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

  address(branch: Branch): string {
    console.log(branch);
    const addr = (branch as any).address;
    console.log(addr);
    if (!addr) return '—';
    
    const parts = [];
    if (addr.country?.name) parts.push(addr.country.name);
    if (addr.state?.name) parts.push(addr.state.name);
    if (addr.city?.name) parts.push(addr.city.name);
    if (addr.postalCode?.code) parts.push(addr.postalCode.code);
    if (addr.line1) parts.push(addr.line1);
    if (addr.line2) parts.push(addr.line2);
    
    return parts.length > 0 ? parts.join(', ') : '—';
  }
}
