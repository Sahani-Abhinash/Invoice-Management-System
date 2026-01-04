import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { InvoiceService, Invoice } from '../invoice.service';
import { forkJoin } from 'rxjs';
import { BranchService } from '../../companies/branch/branch.service';
import { TableDataManagerService } from '../../shared/services/table-data-manager.service';
import { TableControlsComponent } from '../../shared/components/table-controls/table-controls.component';
import { TablePaginationComponent } from '../../shared/components/table-pagination/table-pagination.component';

@Component({
    selector: 'app-invoice-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, TableControlsComponent, TablePaginationComponent],
    providers: [TableDataManagerService],
    templateUrl: './invoice-list.component.html',
    styleUrls: ['./invoice-list.component.css']
})
export class InvoiceListComponent implements OnInit {
    isLoading = true;
    branchesMap: Map<string, string> = new Map();
    Math = Math;

    constructor(
        public tableManager: TableDataManagerService<Invoice>,
        private invoiceService: InvoiceService,
        private branchService: BranchService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.isLoading = true;
        forkJoin({
            invoices: this.invoiceService.getAll(),
            branches: this.branchService.getAll()
        }).subscribe({
            next: (data) => {
                this.tableManager.setData(data.invoices);
                data.branches.forEach(b => {
                    if (b.id) this.branchesMap.set(b.id.toLowerCase(), b.name);
                });
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading invoices:', err);
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    onSearch(searchText: string) {
        this.tableManager.applySearch(searchText, (invoice, search) => {
            const reference = invoice.reference?.toLowerCase() || '';
            const branchName = this.getBranchName(invoice.branchId || '').toLowerCase();
            const status = (invoice.isPaid ? 'paid' : 'unpaid');
            return reference.includes(search) || branchName.includes(search) || status.includes(search);
        });
    }

    onSort(column: string) {
        this.tableManager.sortBy(column, (a, b, col) => {
            let aValue: any = '';
            let bValue: any = '';
            switch (col) {
                case 'reference': aValue = a.reference || ''; bValue = b.reference || ''; break;
                case 'date': aValue = new Date(a.invoiceDate); bValue = new Date(b.invoiceDate); break;
                case 'dueDate': aValue = new Date(a.dueDate || 0); bValue = new Date(b.dueDate || 0); break;
                case 'branch': aValue = this.getBranchName(a.branchId || ''); bValue = this.getBranchName(b.branchId || ''); break;
                case 'amount': aValue = a.total || 0; bValue = b.total || 0; break;
                case 'status': aValue = a.isPaid ? 1 : 0; bValue = b.isPaid ? 1 : 0; break;
            }
            if (typeof aValue === 'string') {
                return aValue.toLowerCase() < bValue.toLowerCase() ? -1 : 1;
            }
            return aValue < bValue ? -1 : 1;
        });
    }

    getBranchName(id: string): string {
        return this.branchesMap.get(id.toLowerCase()) || 'Unknown Branch';
    }

    viewInvoice(id: string): void {
        this.router.navigate(['/invoices/view', id]);
    }

    editInvoice(id: string, event: Event): void {
        event.stopPropagation();
        this.router.navigate(['/invoices/edit', id]);
    }

    createInvoice(): void {
        this.router.navigate(['/invoices/create']);
    }

    payInvoice(id: string, event: Event): void {
        event.stopPropagation();
        if (confirm('Mark this invoice as paid?')) {
            this.invoiceService.markAsPaid(id).subscribe({
                next: () => {
                    this.loadData();
                },
                error: (err) => {
                    console.error('Error paying invoice:', err);
                    alert('Failed to pay invoice');
                }
            });
        }
    }

    deleteInvoice(id: string, event: Event): void {
        event.stopPropagation();
        if (confirm('Are you sure you want to delete this invoice?')) {
            this.invoiceService.delete(id).subscribe({
                next: () => {
                    this.loadData();
                },
                error: (err) => {
                    console.error('Error deleting invoice:', err);
                    alert('Failed to delete invoice');
                }
            });
        }
    }
}
