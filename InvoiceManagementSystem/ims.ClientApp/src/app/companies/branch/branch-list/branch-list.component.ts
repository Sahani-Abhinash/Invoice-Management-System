import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { BranchService, Branch } from '../branch.service';
import { AddressService, Address } from '../../../Master/geography/address/address.service';
import { TableDataManagerService } from '../../../shared/services/table-data-manager.service';
import { TableControlsComponent } from '../../../shared/components/table-controls/table-controls.component';
import { TablePaginationComponent } from '../../../shared/components/table-pagination/table-pagination.component';

@Component({
  selector: 'app-branch-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableControlsComponent, TablePaginationComponent],
  templateUrl: './branch-list.component.html',
  styleUrls: ['./branch-list.component.scss'],
  providers: [TableDataManagerService]
})
export class BranchListComponent implements OnInit {
  branchAddresses: Map<string, Address> = new Map();
  
  // Expose properties for template
  Math = Math;
  pageSizeOptions = [5, 10, 25, 50];

  constructor(
    private branchService: BranchService,
    private addressService: AddressService,
    public tableManager: TableDataManagerService<Branch>,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadData();
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.loadData();
    });
  }

  loadData() {
    console.log('BranchList: Loading branches...');
    this.branchService.getAll().subscribe(branches => {
      console.log('BranchList: Branches loaded:', branches.length, branches);
      this.tableManager.setData(branches);
      
      branches.forEach(branch => {
        console.log('BranchList: Loading addresses for branch:', branch.id, branch.name);
        this.addressService.getForOwner('Branch', branch.id).subscribe(addresses => {
          console.log(`BranchList: Addresses for branch ${branch.name}:`, addresses.length, addresses);
          const primaryAddress = addresses.find(a => (a as any).isPrimary) || addresses[0];
          if (primaryAddress) {
            this.branchAddresses.set(branch.id, primaryAddress);
            console.log(`BranchList: Set primary address for ${branch.name}:`, primaryAddress);
          }
        }, error => {
          console.error(`BranchList: Error loading addresses for branch ${branch.name}:`, error);
        });
      });
      
      this.cdr.detectChanges();
    }, error => {
      console.error('BranchList: Error loading branches:', error);
    });
  }

  onSearch(searchText: string) {
    this.tableManager.applySearch(searchText, (branch, search) => {
      return branch.name.toLowerCase().includes(search) ||
             (this.branchAddresses.get(branch.id)?.line1 || '').toLowerCase().includes(search) ||
             (this.branchAddresses.get(branch.id)?.city?.name || '').toLowerCase().includes(search);
    });
  }

  onSort(column: string) {
    this.tableManager.sortBy(column, (a, b, col) => {
      let aValue: any;
      let bValue: any;

      switch (col) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'address':
          aValue = this.branchAddresses.get(a.id)?.line1 || '';
          bValue = this.branchAddresses.get(b.id)?.line1 || '';
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
      return 0;
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
    const addr = this.branchAddresses.get(branch.id);
    if (!addr) return '—';
    
    const parts = [];
    if (addr.line1) parts.push(addr.line1);
    if (addr.line2) parts.push(addr.line2);
    if (addr.city?.name) parts.push(addr.city.name);
    if (addr.state?.name) parts.push(addr.state.name);
    if (addr.country?.name) parts.push(addr.country.name);
    if (addr.postalCode?.code) parts.push(addr.postalCode.code);
    
    return parts.length > 0 ? parts.join(', ') : '—';
  }
}
