import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { GrnService, Grn } from '../grn.service';

@Component({
    selector: 'app-grn-list',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './grn-list.component.html',
    styleUrls: ['./grn-list.component.css']
})
export class GrnListComponent implements OnInit {
    grns: Grn[] = [];
    isLoading = true;
    error: string | null = null;

    constructor(
        private grnService: GrnService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadGrns();
    }

    loadGrns(): void {
        this.isLoading = true;

        this.grnService.getAll().subscribe({
            next: (grns) => {
                this.grns = grns;
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading GRNs:', err);
                this.error = 'Failed to load GRNs';
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    viewGrn(id: string): void {
        this.router.navigate(['/grns/view', id]);
    }

    editGrn(id: string, event: Event): void {
        event.stopPropagation();
        this.router.navigate(['/grns/edit', id]);
    }

    createGrn(): void {
        this.router.navigate(['/grns/create']);
    }

    receiveGrn(id: string, event: Event): void {
        event.stopPropagation();
        if (confirm('Are you sure you want to mark this GRN as received? This will update the stock levels.')) {
            this.grnService.receive(id).subscribe({
                next: () => {
                    alert('GRN received successfully!');
                    this.loadGrns();
                },
                error: (err) => {
                    console.error('Error receiving GRN:', err);
                    alert('Failed to receive GRN');
                }
            });
        }
    }

    getPaymentStatusBadgeClass(paymentStatus?: string): string {
        switch (paymentStatus) {
            case 'FullyPaid':
                return 'bg-success';
            case 'PartiallyPaid':
                return 'bg-warning';
            case 'Unpaid':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    }

    getPaymentStatusText(paymentStatus?: string): string {
        switch (paymentStatus) {
            case 'FullyPaid':
                return 'Paid';
            case 'PartiallyPaid':
                return 'Partial';
            case 'Unpaid':
                return 'Unpaid';
            default:
                return 'Unknown';
        }
    }

    recordPayment(id: string, event: Event): void {
        event.stopPropagation();
        this.router.navigate(['/grns', id, 'payment']);
    }
}
