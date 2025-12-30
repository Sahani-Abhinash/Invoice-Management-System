import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { InvoiceService, Invoice } from '../invoice.service';
import { forkJoin } from 'rxjs';
import { BranchService } from '../../companies/branch/branch.service';

@Component({
    selector: 'app-invoice-list',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './invoice-list.component.html',
    styleUrls: ['./invoice-list.component.css']
})
export class InvoiceListComponent implements OnInit {
    invoices: Invoice[] = [];
    isLoading = true;
    branchesMap: Map<string, string> = new Map();

    constructor(
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
                this.invoices = data.invoices;
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
