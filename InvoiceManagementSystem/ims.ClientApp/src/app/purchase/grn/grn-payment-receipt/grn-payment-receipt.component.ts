import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GrnService, GrnPaymentDetails } from '../grn.service';

@Component({
    selector: 'app-grn-payment-receipt',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './grn-payment-receipt.component.html',
    styleUrls: ['./grn-payment-receipt.component.css']
})
export class GrnPaymentReceiptComponent implements OnInit {
    grnId: string | null = null;
    grnDetails: GrnPaymentDetails | null = null;
    isLoading = true;
    error: string | null = null;
    currentDate = new Date();

    constructor(
        private grnService: GrnService,
        private route: ActivatedRoute,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.grnId = params.get('id');

            if (!this.grnId) {
                this.error = 'Missing GRN id in route.';
                this.isLoading = false;
                this.cdr.detectChanges();
                return;
            }

            this.loadGrnDetails();
        });
    }

    loadGrnDetails(): void {
        if (!this.grnId) return;

        this.isLoading = true;
        this.grnService.getPaymentDetails(this.grnId).subscribe({
            next: (details) => {
                this.grnDetails = details;
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to load GRN details', err);
                this.error = 'Failed to load GRN payment details';
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    getPaymentMethodName(method: number): string {
        return this.grnService.getPaymentMethodName(method);
    }

    print(): void {
        window.print();
    }

    goBack(): void {
        this.router.navigate(['/grns']);
    }
}
