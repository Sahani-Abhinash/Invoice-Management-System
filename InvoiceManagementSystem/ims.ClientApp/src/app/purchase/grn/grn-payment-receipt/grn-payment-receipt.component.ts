import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GrnService, GrnPaymentDetails } from '../grn.service';
import { CompanyService, Company } from '../../../companies/company/company.service';
import { AddressService, Address } from '../../../Master/geography/address/address.service';

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
    company: Company | null = null;
    companyAddress: Address | null = null;
    companyLogoUrl: string | null = null;

    constructor(
        private grnService: GrnService,
        private route: ActivatedRoute,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private companyService: CompanyService,
        private addressService: AddressService
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
            this.loadCompany();
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

    private loadCompany(): void {
        this.companyService.getAll().subscribe({
            next: (companies) => {
                if (!companies?.length) return;
                this.company = companies[0];
                this.companyLogoUrl = this.resolveLogoUrl(this.company.logoUrl);
                this.addressService.getForOwner('Company', this.company.id).subscribe({
                    next: (addresses) => {
                        this.companyAddress = addresses?.[0] || null;
                        this.cdr.detectChanges();
                    },
                    error: () => {
                        this.companyAddress = null;
                    }
                });
            },
            error: () => { }
        });
    }

    private resolveLogoUrl(url?: string | null): string | null {
        if (!url) return null;
        const trimmed = url.trim();
        if (!trimmed) return null;
        if (/^https?:\/\//i.test(trimmed)) return trimmed;
        if (trimmed.startsWith('/')) return trimmed;
        return '/' + trimmed.replace(/^\/+/, '');
    }

    print(): void {
        window.print();
    }

    goBack(): void {
        this.router.navigate(['/grns']);
    }
}
